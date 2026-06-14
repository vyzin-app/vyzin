import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import type { QueryFilter } from '../../persistence/interfaces/find-options.interface';
import { RepositoryFactory } from '../../persistence/firestore/repository.factory';
import { applyTextSearch } from '../../persistence/utils/text-search.util';
import { VisitorDTO } from '../dto/visitor.dto';
import { UpdateVisitorStatusDTO } from '../dto/update-visitor-status.dto';
import { FilterVisitorsDTO } from '../dto/filter-visitors.dto';
import {
  Visitor,
  VisitorStatusEnum,
} from '../entities/visitor.entity';

@Injectable()
export class VisitorsService {
  constructor(private readonly repositoryFactory: RepositoryFactory) {}

  async getVisitors(
    filter: FilterVisitorsDTO,
    currentUser: AuthenticatedUser,
  ): Promise<Visitor[]> {
    const filters = this.buildVisitorFilters(filter);
    const results = await this.repositoryFactory
      .visitors({ user: currentUser })
      .findMany({ filters });
    return applyTextSearch(results, filter.search, [
      (visitor) => visitor.name,
      (visitor) => visitor.cpf,
      (visitor) => visitor.purpose,
    ]);
  }

  async getVisitorById(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<Visitor> {
    return this.repositoryFactory
      .visitors({ user: currentUser })
      .findOneOrFail(id);
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
        status: dto.status ?? VisitorStatusEnum.WAITING,
        authorizedBy: currentUser.uid,
        exitTime: dto.exitTime,
      }));

    return visitor.id;
  }

  async updateVisitor(
    id: string,
    dto: VisitorDTO,
    currentUser: AuthenticatedUser,
  ): Promise<Visitor> {
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
      exitTime: dto.exitTime ?? existing.exitTime,
    };

    return repo.save(id, visitor);
  }

  /** Workflow transition (authorize / deny / register exit). */
  async updateStatus(
    id: string,
    dto: UpdateVisitorStatusDTO,
    currentUser: AuthenticatedUser,
  ): Promise<Visitor> {
    const repo = this.repositoryFactory.visitors({ user: currentUser });
    const existing = await repo.findOneOrFail(id);

    const visitor: Visitor = {
      ...existing,
      status: dto.status,
      authorizedBy: currentUser.uid,
      exitTime:
        dto.status === VisitorStatusEnum.EXITED
          ? (dto.exitTime ?? existing.exitTime)
          : existing.exitTime,
    };

    return repo.save(id, visitor);
  }

  async deleteVisitor(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<void> {
    await this.repositoryFactory
      .visitors({ user: currentUser })
      .delete(id);
  }
}
