import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AppFunction } from '../../auth/functions/app-functions';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import type { AccessContext } from '../../persistence/interfaces/access-context.interface';
import type { QueryFilter } from '../../persistence/interfaces/find-options.interface';
import { RepositoryFactory } from '../../persistence/firestore/repository.factory';
import { applyTextSearch } from '../../persistence/utils/text-search.util';
import {
  RESERVATION_BLOCK_HOURS,
  buildScheduleSlots,
  endOfDay,
  ScheduleSlotAvailability,
  slotsOverlap,
  startOfDay,
} from '../config/reservation-schedule';
import { FilterAvailableSlotsDTO } from '../dto/filter-available-slots.dto';
import { ReservationDTO } from '../dto/reservation.dto';
import { FilterReservationsDTO } from '../dto/filter-reservations.dto';
import { ReservationResponseDTO } from '../dto/reservation-response.dto';
import {
  Reservation,
  ReservationStatusEnum,
} from '../entities/reservations.entity';
import type { User } from '../../users/entities/user.entity';

@Injectable()
export class ReservationsService {
  constructor(private readonly repositoryFactory: RepositoryFactory) {}

  async getReservations(
    filter: FilterReservationsDTO,
    currentUser: AuthenticatedUser,
  ): Promise<ReservationResponseDTO[]> {
    const repo = this.repositoryFactory.reservations({ user: currentUser });
    const filters = this.buildReservationFilters(filter);
    const results = await repo.findMany({ filters });
    const enriched = await this.enrichWithCreator(results);
    return applyTextSearch(enriched, filter.search, [
      (reservation) => reservation.space,
      (reservation) => reservation.createdByName,
      (reservation) => reservation.createdByEmail,
      (reservation) => reservation.notes,
    ]);
  }

  async getReservationById(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<ReservationResponseDTO> {
    const reservation = await this.repositoryFactory
      .reservations({ user: currentUser })
      .findOneOrFail(id);
    return this.enrichOneWithCreator(reservation);
  }

  /** Returns bookable spaces and block duration (hours) for the UI. */
  getSpaces(): { name: string; blockHours: number }[] {
    return Object.entries(RESERVATION_BLOCK_HOURS).map(([name, blockHours]) => ({
      name,
      blockHours,
    }));
  }

  /** Returns all schedule blocks for the day, marking which are still free. */
  async getAvailableSlots(
    filter: FilterAvailableSlotsDTO,
  ): Promise<ScheduleSlotAvailability[]> {
    const dayEnd = endOfDay(filter.date);
    if (dayEnd.getTime() < Date.now()) {
      throw new BadRequestException(
        'Nao e possivel consultar horarios para uma data que ja passou.',
      );
    }

    const active = await this.getActiveReservationsForSpaceOnDate(
      filter.space,
      filter.date,
      filter.excludeId,
    );

    return buildScheduleSlots(filter.space).map((slot) => ({
      ...slot,
      available:
        !this.isSlotStartInPast(filter.date, slot.startTime) &&
        !active.some((reservation) =>
          slotsOverlap(
            slot.startTime,
            slot.endTime,
            reservation.startTime,
            reservation.endTime,
          ),
        ),
    }));
  }

  private isSlotStartInPast(date: Date, startTime: string): boolean {
    const slotStart = new Date(date);
    const [hours, minutes] = startTime.split(':').map(Number);
    slotStart.setHours(hours, minutes ?? 0, 0, 0);
    return slotStart.getTime() < Date.now();
  }

  private buildReservationFilters(
    filter: FilterReservationsDTO = {},
  ): QueryFilter[] {
    const filters: QueryFilter[] = [];

    if (filter.status) {
      filters.push({ field: 'status', op: '==', value: filter.status });
    }

    if (filter.date) {
      const dayStart = new Date(filter.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(filter.date);
      dayEnd.setHours(23, 59, 59, 999);
      filters.push({ field: 'date', op: '>=', value: dayStart });
      filters.push({ field: 'date', op: '<=', value: dayEnd });
    }

    return filters;
  }

  private async getActiveReservationsForSpaceOnDate(
    space: string,
    date: Date,
    excludeId?: string,
  ): Promise<Reservation[]> {
    const repo = this.repositoryFactory.reservationsUnscoped();
    const reservations = await repo.findMany({
      filters: [
        { field: 'date', op: '>=', value: startOfDay(date) },
        { field: 'date', op: '<=', value: endOfDay(date) },
      ],
    });

    return reservations.filter(
      (reservation) =>
        reservation.space === space &&
        reservation.status !== ReservationStatusEnum.CANCELLED &&
        reservation.id !== excludeId,
    );
  }

  private scheduleChanged(
    existing: Reservation,
    dto: ReservationDTO,
  ): boolean {
    return (
      dto.space !== existing.space ||
      dto.startTime !== existing.startTime ||
      dto.endTime !== existing.endTime ||
      startOfDay(dto.date).getTime() !== startOfDay(existing.date).getTime()
    );
  }

  private assertCanLinkVisitor(
    reservation: Reservation,
    currentUser: AuthenticatedUser,
  ): void {
    if (reservation.createdBy === currentUser.uid) {
      return;
    }

    if (currentUser.functions.includes(AppFunction.RESERVATIONS_MANAGE_ALL)) {
      return;
    }

    const canReadAll =
      currentUser.functions.includes(AppFunction.RESERVATIONS_READ) &&
      !currentUser.functions.includes(AppFunction.RESERVATIONS_MANAGE);

    if (
      canReadAll &&
      currentUser.functions.includes(AppFunction.VISITORS_MANAGE)
    ) {
      return;
    }

    throw new ForbiddenException(
      'Voce nao tem permissao para vincular visitantes a esta reserva.',
    );
  }

  /** Rejects reservations whose start moment is already in the past. */
  private assertNotInPast(date: Date, startTime: string): void {
    const slotStart = new Date(date);
    const [hours, minutes] = startTime.split(':').map(Number);
    slotStart.setHours(hours, minutes ?? 0, 0, 0);

    if (slotStart.getTime() < Date.now()) {
      throw new BadRequestException(
        'Nao e possivel reservar para uma data ou horario que ja passou.',
      );
    }
  }

  private async assertSlotAvailable(
    space: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ): Promise<void> {
    const available = await this.getAvailableSlots({ space, date, excludeId });
    const isFree = available.some(
      (slot) =>
        slot.available &&
        slot.startTime === startTime &&
        slot.endTime === endTime,
    );

    if (!isFree) {
      throw new ConflictException(
        'Horario indisponivel para este espaco na data selecionada.',
      );
    }
  }

  async createReservation(
    dto: ReservationDTO,
    currentUser: AuthenticatedUser,
  ): Promise<string> {
    if (dto.status === ReservationStatusEnum.CONFIRMED) {
      this.assertNotInPast(dto.date, dto.startTime);
      await this.assertSlotAvailable(
        dto.space,
        dto.date,
        dto.startTime,
        dto.endTime,
      );
    }

    const context: AccessContext = { user: currentUser };
    const reservation = await this.repositoryFactory
      .reservations(context)
      .createWithGeneratedId((id) => ({
        id,
        space: dto.space,
        date: dto.date,
        startTime: dto.startTime,
        endTime: dto.endTime,
        notes: dto.notes ?? '',
        status: dto.status,
        createdBy: currentUser.uid,
        linkedVisitorIds: dto.linkedVisitorIds ?? [],
      }));

    return reservation.id;
  }

  async updateReservation(
    id: string,
    dto: ReservationDTO,
    currentUser: AuthenticatedUser,
  ): Promise<ReservationResponseDTO> {
    const repo = this.repositoryFactory.reservations({ user: currentUser });
    const existing = await repo.findOneOrFail(id);

    if (
      dto.status === ReservationStatusEnum.CONFIRMED &&
      this.scheduleChanged(existing, dto)
    ) {
      this.assertNotInPast(dto.date, dto.startTime);
      await this.assertSlotAvailable(
        dto.space,
        dto.date,
        dto.startTime,
        dto.endTime,
        id,
      );
    }

    const updatedReservation: Reservation = {
      ...existing,
      ...dto,
      id: existing.id,
      notes: dto.notes ?? existing.notes,
      createdBy: existing.createdBy,
      linkedVisitorIds:
        dto.status === ReservationStatusEnum.CANCELLED
          ? (existing.linkedVisitorIds ?? [])
          : (dto.linkedVisitorIds ?? existing.linkedVisitorIds ?? []),
    };

    const saved = await repo.save(id, updatedReservation);
    return this.enrichOneWithCreator(saved);
  }

  private async enrichOneWithCreator(
    reservation: Reservation,
  ): Promise<ReservationResponseDTO> {
    const [enriched] = await this.enrichWithCreator([reservation]);
    return enriched;
  }

  private async enrichWithCreator(
    reservations: Reservation[],
  ): Promise<ReservationResponseDTO[]> {
    const userMap = await this.loadUsersByIds(
      reservations.map((reservation) => reservation.createdBy),
    );

    return reservations.map((reservation) =>
      this.toReservationResponse(reservation, userMap.get(reservation.createdBy)),
    );
  }

  private async loadUsersByIds(uids: string[]): Promise<Map<string, User>> {
    const uniqueIds = [...new Set(uids.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return new Map();
    }

    const entries = await Promise.all(
      uniqueIds.map(async (uid) => {
        const user = await this.repositoryFactory.usersUnscoped().findById(uid);
        return user ? ([uid, user] as const) : null;
      }),
    );

    return new Map(entries.filter((entry) => entry !== null));
  }

  private toReservationResponse(
    reservation: Reservation,
    creator?: User,
  ): ReservationResponseDTO {
    const createdByName = creator?.name ?? 'Usuario desconhecido';
    const createdByEmail = creator?.email ?? '';
    const createdByDisplay =
      creator?.name || creator?.email || 'Usuario desconhecido';

    return {
      ...reservation,
      createdByName,
      createdByEmail,
      createdByDisplay,
    };
  }

  async deleteReservation(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<void> {
    await this.repositoryFactory
      .reservations({ user: currentUser })
      .delete(id);
  }

  async linkVisitor(
    reservationId: string,
    visitorId: string,
    currentUser: AuthenticatedUser,
  ): Promise<ReservationResponseDTO> {
    const repo = this.repositoryFactory.reservations({ user: currentUser });
    const existing = await repo.findOneOrFail(reservationId);
    this.assertCanLinkVisitor(existing, currentUser);

    const linkedVisitorIds = existing.linkedVisitorIds ?? [];
    if (linkedVisitorIds.includes(visitorId)) {
      return this.enrichOneWithCreator(existing);
    }

    const updated: Reservation = {
      ...existing,
      linkedVisitorIds: [...linkedVisitorIds, visitorId],
    };

    const saved = await this.repositoryFactory
      .reservationsUnscoped()
      .save(reservationId, updated);
    return this.enrichOneWithCreator(saved);
  }

  async unlinkVisitor(
    reservationId: string,
    visitorId: string,
    currentUser: AuthenticatedUser,
  ): Promise<ReservationResponseDTO> {
    const repo = this.repositoryFactory.reservations({ user: currentUser });
    const existing = await repo.findOneOrFail(reservationId);
    this.assertCanLinkVisitor(existing, currentUser);

    const linkedVisitorIds = existing.linkedVisitorIds ?? [];
    const updated: Reservation = {
      ...existing,
      linkedVisitorIds: linkedVisitorIds.filter((id) => id !== visitorId),
    };

    const saved = await this.repositoryFactory
      .reservationsUnscoped()
      .save(reservationId, updated);
    return this.enrichOneWithCreator(saved);
  }
}
