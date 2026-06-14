import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import type { Profile } from '../../profiles/entities/profile.entity';
import { startOfDay } from '../../reservas/config/reservation-schedule';
import {
  Reservation,
  ReservationStatusEnum,
} from '../../reservas/entities/reservations.entity';
import type { User } from '../../users/entities/user.entity';
import {
  Visitor,
  VisitorStatusEnum,
} from '../../visitantes/entities/visitor.entity';
import { RepositoryFactory } from '../../persistence/firestore/repository.factory';
import { applyTextSearch } from '../../persistence/utils/text-search.util';
import { FilterOperationalReportDTO } from '../dto/filter-operational-report.dto';
import {
  OperationalReportDTO,
  OperationalReportLinkedVisitorDTO,
  OperationalReportReservationRowDTO,
  OperationalReportSpaceCountDTO,
  OperationalReportSummaryDTO,
  OperationalReportVisitorRowDTO,
} from '../dto/operational-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly repositoryFactory: RepositoryFactory) {}

  async getOperationalReport(
    filter: FilterOperationalReportDTO,
    currentUser: AuthenticatedUser,
  ): Promise<OperationalReportDTO> {
    const context = { user: currentUser };

    const [reservations, visitors] = await Promise.all([
      this.repositoryFactory.reservations(context).findMany({}),
      this.repositoryFactory.visitors(context).findMany({}),
    ]);

    const visitorMap = new Map(visitors.map((visitor) => [visitor.id, visitor]));
    const reservationByVisitorId = this.buildVisitorReservationIndex(
      reservations,
      visitorMap,
    );

    const userIds = new Set<string>();
    for (const reservation of reservations) {
      if (reservation.createdBy) {
        userIds.add(reservation.createdBy);
      }
    }
    for (const visitor of visitors) {
      if (visitor.authorizedBy) {
        userIds.add(visitor.authorizedBy);
      }
    }

    const [userMap, profileMap] = await Promise.all([
      this.loadUsersByIds([...userIds]),
      this.loadProfiles(),
    ]);

    const filteredReservations = this.filterReservations(reservations, filter);
    const filteredVisitors = this.filterVisitors(visitors, filter);

    let reservationRows = filteredReservations.map((reservation) =>
      this.toReservationRow(
        reservation,
        visitorMap,
        userMap,
        profileMap,
      ),
    );

    let visitorRows = filteredVisitors.map((visitor) =>
      this.toVisitorRow(
        visitor,
        reservationByVisitorId.get(visitor.id),
        userMap,
        profileMap,
      ),
    );

    reservationRows = applyTextSearch(reservationRows, filter.search, [
      (row) => row.space,
      (row) => row.createdByName,
      (row) => row.createdByEmail,
      (row) => row.notes,
      (row) => row.linkedVisitors.map((v) => v.name).join(' '),
      (row) => row.linkedVisitors.map((v) => v.cpf).join(' '),
    ]);

    visitorRows = applyTextSearch(visitorRows, filter.search, [
      (row) => row.name,
      (row) => row.cpf,
      (row) => row.purpose,
      (row) => row.authorizedByName,
      (row) => row.reservationSpace,
      (row) => row.reservationOwnerName,
    ]);

    return {
      summary: this.buildSummary(
        reservationRows,
        visitorRows,
        reservationByVisitorId,
      ),
      reservations: reservationRows,
      visitors: visitorRows,
      generatedAt: new Date().toISOString(),
    };
  }

  private buildVisitorReservationIndex(
    reservations: Reservation[],
    visitorMap: Map<string, Visitor>,
  ): Map<string, Reservation> {
    const index = new Map<string, Reservation>();

    for (const reservation of reservations) {
      for (const visitorId of reservation.linkedVisitorIds ?? []) {
        if (visitorMap.has(visitorId)) {
          index.set(visitorId, reservation);
        }
      }
    }

    return index;
  }

  private filterReservations(
    reservations: Reservation[],
    filter: FilterOperationalReportDTO,
  ): Reservation[] {
    const from = filter.from ? startOfDay(new Date(filter.from)) : undefined;
    const to = filter.to ? startOfDay(new Date(filter.to)) : undefined;

    return reservations.filter((reservation) => {
      const day = startOfDay(reservation.date).getTime();

      if (from && day < from.getTime()) {
        return false;
      }
      if (to && day > to.getTime()) {
        return false;
      }
      if (
        filter.reservationStatus &&
        reservation.status !== filter.reservationStatus
      ) {
        return false;
      }
      if (filter.space && reservation.space !== filter.space) {
        return false;
      }
      return true;
    });
  }

  private filterVisitors(
    visitors: Visitor[],
    filter: FilterOperationalReportDTO,
  ): Visitor[] {
    const from = filter.from ? startOfDay(new Date(filter.from)) : undefined;
    const to = filter.to ? startOfDay(new Date(filter.to)) : undefined;

    return visitors.filter((visitor) => {
      const day = startOfDay(visitor.date).getTime();

      if (from && day < from.getTime()) {
        return false;
      }
      if (to && day > to.getTime()) {
        return false;
      }
      if (filter.visitorStatus && visitor.status !== filter.visitorStatus) {
        return false;
      }
      if (filter.visitType && visitor.visitType !== filter.visitType) {
        return false;
      }
      return true;
    });
  }

  private toReservationRow(
    reservation: Reservation,
    visitorMap: Map<string, Visitor>,
    userMap: Map<string, User>,
    profileMap: Map<string, Profile>,
  ): OperationalReportReservationRowDTO {
    const creator = userMap.get(reservation.createdBy);
    const linkedVisitors = (reservation.linkedVisitorIds ?? [])
      .map((visitorId) => visitorMap.get(visitorId))
      .filter((visitor): visitor is Visitor => visitor !== undefined)
      .map(
        (visitor): OperationalReportLinkedVisitorDTO => ({
          visitorId: visitor.id,
          name: visitor.name,
          cpf: visitor.cpf,
          status: visitor.status,
          visitType: visitor.visitType,
        }),
      );

    return {
      reservationId: reservation.id,
      space: reservation.space,
      date: this.toDateString(reservation.date),
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      status: reservation.status,
      notes: reservation.notes,
      createdByName: creator?.name ?? 'Usuario desconhecido',
      createdByEmail: creator?.email ?? '',
      createdByApartment: creator?.apartment,
      createdByBlock: creator?.block,
      createdByProfileName: this.profileName(
        creator?.profileId,
        profileMap,
      ),
      linkedVisitorCount: linkedVisitors.length,
      linkedVisitors,
    };
  }

  private toVisitorRow(
    visitor: Visitor,
    reservation: Reservation | undefined,
    userMap: Map<string, User>,
    profileMap: Map<string, Profile>,
  ): OperationalReportVisitorRowDTO {
    const authorizer = userMap.get(visitor.authorizedBy);
    const owner = reservation
      ? userMap.get(reservation.createdBy)
      : undefined;

    return {
      visitorId: visitor.id,
      name: visitor.name,
      cpf: visitor.cpf,
      phone: visitor.phone,
      date: this.toDateString(visitor.date),
      time: visitor.time,
      status: visitor.status,
      visitType: visitor.visitType,
      purpose: visitor.purpose,
      authorizedByName: authorizer?.name ?? 'Usuario desconhecido',
      authorizedByEmail: authorizer?.email ?? '',
      authorizedByApartment: authorizer?.apartment,
      authorizedByBlock: authorizer?.block,
      authorizedByProfileName: this.profileName(
        authorizer?.profileId,
        profileMap,
      ),
      reservationId: reservation?.id,
      reservationSpace: reservation?.space,
      reservationDate: reservation
        ? this.toDateString(reservation.date)
        : undefined,
      reservationStartTime: reservation?.startTime,
      reservationStatus: reservation?.status,
      reservationOwnerName: owner?.name,
    };
  }

  private buildSummary(
    reservations: OperationalReportReservationRowDTO[],
    visitors: OperationalReportVisitorRowDTO[],
    reservationByVisitorId: Map<string, Reservation>,
  ): OperationalReportSummaryDTO {
    const spaceCounts = new Map<string, number>();
    for (const reservation of reservations) {
      spaceCounts.set(
        reservation.space,
        (spaceCounts.get(reservation.space) ?? 0) + 1,
      );
    }

    const topSpaces: OperationalReportSpaceCountDTO[] = [...spaceCounts.entries()]
      .map(([space, count]) => ({ space, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalReservations: reservations.length,
      confirmedReservations: reservations.filter(
        (row) => row.status === ReservationStatusEnum.CONFIRMED,
      ).length,
      cancelledReservations: reservations.filter(
        (row) => row.status === ReservationStatusEnum.CANCELLED,
      ).length,
      totalVisitors: visitors.length,
      authorizedVisitors: visitors.filter(
        (row) => row.status === VisitorStatusEnum.AUTHORIZED,
      ).length,
      waitingVisitors: visitors.filter(
        (row) => row.status === VisitorStatusEnum.WAITING,
      ).length,
      exitedVisitors: visitors.filter(
        (row) => row.status === VisitorStatusEnum.EXITED,
      ).length,
      deniedVisitors: visitors.filter(
        (row) => row.status === VisitorStatusEnum.DENIED,
      ).length,
      reservationGuests: reservationByVisitorId.size,
      topSpaces,
    };
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

  private async loadProfiles(): Promise<Map<string, Profile>> {
    const profiles = await this.repositoryFactory
      .profilesUnscoped()
      .findMany({});
    return new Map(profiles.map((profile) => [profile.id, profile]));
  }

  private profileName(
    profileId: string | undefined,
    profileMap: Map<string, Profile>,
  ): string {
    if (!profileId) {
      return 'Perfil desconhecido';
    }
    return profileMap.get(profileId)?.name ?? profileId;
  }

  private toDateString(date: Date): string {
    return startOfDay(date).toISOString().slice(0, 10);
  }
}
