import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { RepositoryFactory } from '../../persistence/firestore/repository.factory';
import { applyTextSearch } from '../../persistence/utils/text-search.util';
import { PreAuthorizationDTO } from '../dto/pre-authorization.dto';
import { PreAuthorization } from '../entities/pre-authorization.entity';

@Injectable()
export class PreAuthorizationsService {
  constructor(private readonly repositoryFactory: RepositoryFactory) {}

  async list(
    search: string | undefined,
    currentUser: AuthenticatedUser,
  ): Promise<PreAuthorization[]> {
    const results = await this.repositoryFactory
      .preAuthorizations({ user: currentUser })
      .findMany({});
    return applyTextSearch(results, search, [
      (item) => item.name,
      (item) => item.cpf,
      (item) => item.schedule,
    ]);
  }

  async getById(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<PreAuthorization> {
    return this.repositoryFactory
      .preAuthorizations({ user: currentUser })
      .findOneOrFail(id);
  }

  async create(
    dto: PreAuthorizationDTO,
    currentUser: AuthenticatedUser,
  ): Promise<string> {
    const item = await this.repositoryFactory
      .preAuthorizations({ user: currentUser })
      .createWithGeneratedId((id) => ({
        id,
        name: dto.name,
        cpf: dto.cpf,
        schedule: dto.schedule,
        validUntil: dto.validUntil,
        active: dto.active ?? true,
        createdBy: currentUser.uid,
      }));
    return item.id;
  }

  async update(
    id: string,
    dto: PreAuthorizationDTO,
    currentUser: AuthenticatedUser,
  ): Promise<PreAuthorization> {
    const repo = this.repositoryFactory.preAuthorizations({ user: currentUser });
    const existing = await repo.findOneOrFail(id);
    const updated: PreAuthorization = {
      ...existing,
      name: dto.name,
      cpf: dto.cpf,
      schedule: dto.schedule,
      validUntil: dto.validUntil,
      active: dto.active ?? existing.active,
      createdBy: existing.createdBy,
    };
    return repo.save(id, updated);
  }

  async remove(id: string, currentUser: AuthenticatedUser): Promise<void> {
    await this.repositoryFactory
      .preAuthorizations({ user: currentUser })
      .delete(id);
  }
}
