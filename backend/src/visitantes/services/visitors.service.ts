import { Injectable, BadRequestException } from '@nestjs/common';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import type { QueryFilter } from '../../persistence/interfaces/find-options.interface';
import { RepositoryFactory } from '../../persistence/firestore/repository.factory';
import { applyTextSearch } from '../../persistence/utils/text-search.util';
import { VisitorDTO } from '../dto/visitor.dto';
import { VisitorResponseDTO } from '../dto/visitor-response.dto';
import { UpdateVisitorStatusDTO } from '../dto/update-visitor-status.dto';
import { FilterVisitorsDTO } from '../dto/filter-visitors.dto';
import {
  Visitor,
  VisitorStatusEnum,
} from '../entities/visitor.entity';
import type { User } from '../../users/entities/user.entity';

/** Statuses that represent a workflow decision already taken by the portaria. */
const DECIDED_STATUSES: VisitorStatusEnum[] = [
  VisitorStatusEnum.AUTHORIZED,
  VisitorStatusEnum.DENIED,
  VisitorStatusEnum.EXITED,
];

@Injectable()
export class VisitorsService {
  constructor(private readonly repositoryFactory: RepositoryFactory) {}

  async getVisitors(
    filter: FilterVisitorsDTO,
    currentUser: AuthenticatedUser,
  ): Promise<VisitorResponseDTO[]> {
    const filters = this.buildVisitorFilters(filter);
    const results = await this.repositoryFactory
      .visitors({ user: currentUser })
      .findMany({ filters });
    const enriched = await this.enrichWithPeople(results);
    return applyTextSearch(enriched, filter.search, [
      (visitor) => visitor.name,
      (visitor) => visitor.cpf,
      (visitor) => visitor.purpose,
      (visitor) => visitor.createdByName,
    ]);
  }

  async getVisitorById(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<VisitorResponseDTO> {
    const visitor = await this.repositoryFactory
      .visitors({ user: currentUser })
      .findOneOrFail(id);
    return this.enrichOneWithPeople(visitor);
  }

  private buildVisitorFilters(filter: FilterVisitorsDTO = {}): QueryFilter[] {
    const filters: QueryFilter[] = [];

    if (filter.status) {
      filters.push({ field: 'status', op: '==', value: filter.status });
    }

    if (filter.visitType) {
      filters.push({ field: 'visitType', op: '==', value: filter.visitType });
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

  async createVisitor(
    dto: VisitorDTO,
    currentUser: AuthenticatedUser,
  ): Promise<string> {
    this.assertNotInPast(dto.date, dto.time);

    const status = dto.status ?? VisitorStatusEnum.WAITING;
    const visitor = await this.repositoryFactory
      .visitors({ user: currentUser })
      .createWithGeneratedId((id) => ({
        id,
        name: dto.name,
        cpf: dto.cpf,
        phone: dto.phone,
        email: dto.email ?? '',
        purpose: dto.purpose,
        date: dto.date,
        time: dto.time,
        notes: dto.notes ?? '',
        visitType: dto.visitType,
        status,
        createdBy: currentUser.uid,
        // Only stamp the authorizer when the visitor is already decided on creation.
        authorizedBy: DECIDED_STATUSES.includes(status) ? currentUser.uid : '',
        exitTime: dto.exitTime,
      }));

    return visitor.id;
  }

  async updateVisitor(
    id: string,
    dto: VisitorDTO,
    currentUser: AuthenticatedUser,
  ): Promise<VisitorResponseDTO> {
    this.assertNotInPast(dto.date, dto.time);

    const repo = this.repositoryFactory.visitors({ user: currentUser });
    const existing = await repo.findOneOrFail(id);

    const visitor: Visitor = {
      ...existing,
      name: dto.name,
      cpf: dto.cpf,
      phone: dto.phone,
      email: dto.email ?? '',
      purpose: dto.purpose,
      date: dto.date,
      time: dto.time,
      notes: dto.notes ?? '',
      visitType: dto.visitType,
      status: dto.status ?? existing.status,
      createdBy: existing.createdBy,
      exitTime: dto.exitTime ?? existing.exitTime,
    };

    const saved = await repo.save(id, visitor);
    return this.enrichOneWithPeople(saved);
  }

  /** Workflow transition (authorize / deny / register exit). */
  async updateStatus(
    id: string,
    dto: UpdateVisitorStatusDTO,
    currentUser: AuthenticatedUser,
  ): Promise<VisitorResponseDTO> {
    const repo = this.repositoryFactory.visitors({ user: currentUser });
    const existing = await repo.findOneOrFail(id);

    const visitor: Visitor = {
      ...existing,
      status: dto.status,
      // The workflow operator becomes the authorizer; ownership (createdBy) is untouched.
      authorizedBy: currentUser.uid,
      exitTime:
        dto.status === VisitorStatusEnum.EXITED
          ? (dto.exitTime ?? existing.exitTime)
          : existing.exitTime,
    };

    const saved = await repo.save(id, visitor);
    return this.enrichOneWithPeople(saved);
  }

  private async enrichOneWithPeople(
    visitor: Visitor,
  ): Promise<VisitorResponseDTO> {
    const [enriched] = await this.enrichWithPeople([visitor]);
    return enriched;
  }

  private async enrichWithPeople(
    visitors: Visitor[],
  ): Promise<VisitorResponseDTO[]> {
    const userMap = await this.loadUsersByIds(
      visitors.flatMap((visitor) => [visitor.createdBy, visitor.authorizedBy]),
    );

    return visitors.map((visitor) => {
      const creator = userMap.get(visitor.createdBy);
      const authorizer = userMap.get(visitor.authorizedBy);
      return {
        ...visitor,
        createdByName: creator?.name ?? 'Usuario desconhecido',
        createdByEmail: creator?.email ?? '',
        createdByDisplay:
          creator?.name || creator?.email || 'Usuario desconhecido',
        authorizedByName: authorizer?.name ?? '',
        authorizedByDisplay: authorizer?.name || authorizer?.email || '',
      };
    });
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

  async deleteVisitor(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<void> {
    await this.repositoryFactory
      .visitors({ user: currentUser })
      .delete(id);
  }

  private assertNotInPast(date: Date, time: string): void {
    const slotStart = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    slotStart.setHours(hours, minutes ?? 0, 0, 0);

    if (slotStart.getTime() < Date.now()) {
      throw new BadRequestException(
        'Nao e possivel cadastrar visita para uma data ou horario que ja passou.',
      );
    }
  }
}
