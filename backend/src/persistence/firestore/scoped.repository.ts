import { ForbiddenException } from '@nestjs/common';
import type { AccessContext } from '../interfaces/access-context.interface';
import type { FindManyOptions } from '../interfaces/find-options.interface';
import type { IRepository } from '../interfaces/repository.interface';
import type { ISecurityScope } from '../interfaces/security-scope.interface';
import type { FirestoreRepository } from './firestore.repository';

/**
 * Decorator that wraps a repository with row-level security (pre-filter + checks).
 */
export class ScopedRepository<T> implements IRepository<T> {
  constructor(
    private readonly repository: FirestoreRepository<T>,
    private readonly scope: ISecurityScope<T>,
    private readonly access: AccessContext,
  ) {}

  private get user() {
    return this.access.user;
  }

  private mergeScopeFilters(options?: FindManyOptions): FindManyOptions {
    const scopeFilters = this.scope.getListFilters(this.user);
    return {
      ...options,
      filters: [...scopeFilters, ...(options?.filters ?? [])],
    };
  }

  async findById(id: string): Promise<T | null> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      return null;
    }
    if (!this.scope.matchesEntity(this.user, entity)) {
      return null;
    }
    return entity;
  }

  async findOneOrFail(id: string): Promise<T> {
    const entity = await this.repository.findOneOrFail(id);
    this.scope.assertCanRead(this.user, entity);
    return entity;
  }

  async findMany(options?: FindManyOptions): Promise<T[]> {
    const results = await this.repository.findMany(
      this.mergeScopeFilters(options),
    );
    return results.filter((entity) =>
      this.scope.matchesEntity(this.user, entity),
    );
  }

  async create(entity: T, id?: string): Promise<T> {
    this.scope.assertCanWrite(this.user, entity, 'create');
    return this.repository.create(entity, id);
  }

  async createWithGeneratedId(build: (id: string) => T): Promise<T> {
    return this.repository.createWithGeneratedId((id) => {
      const entity = build(id);
      this.scope.assertCanWrite(this.user, entity, 'create');
      return entity;
    });
  }

  async save(id: string, entity: T): Promise<T> {
    this.scope.assertCanWrite(this.user, entity, 'update');
    return this.repository.save(id, entity);
  }

  async update(id: string, partial: Partial<T>): Promise<T> {
    const existing = await this.repository.findOneOrFail(id);
    this.scope.assertCanWrite(this.user, existing, 'update');
    const updated = { ...existing, ...partial };
    this.scope.assertCanWrite(this.user, updated as T, 'update');
    return this.repository.save(id, updated as T);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repository.findOneOrFail(id);
    this.scope.assertCanWrite(this.user, existing, 'delete');
    await this.repository.delete(id);
  }

  /** Exposes the underlying unscoped repository for internal/domain queries. */
  unscoped(): FirestoreRepository<T> {
    return this.repository;
  }
}

/** Factory helper for services that require an access context on reads/writes. */
export function requireAccessContext(
  access?: AccessContext,
): asserts access is AccessContext {
  if (!access?.user) {
    throw new ForbiddenException(
      'Contexto de acesso obrigatorio para esta operacao.',
    );
  }
}
