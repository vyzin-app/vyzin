import { NotFoundException } from '@nestjs/common';
import type { CollectionDefinition } from '../../src/persistence/interfaces/collection-definition.interface';
import type { FindManyOptions } from '../../src/persistence/interfaces/find-options.interface';
import { memoryStore } from './memory-store';

/** Drop-in memory replacement for FirestoreRepository used in tests. */
export class MemoryFirestoreRepository<T> {
  constructor(private readonly definition: CollectionDefinition<T>) {}

  async findById(id: string): Promise<T | null> {
    return memoryStore.get<T>(this.definition.name, id);
  }

  async findOneOrFail(id: string): Promise<T> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new NotFoundException(
        `${this.definition.name} document ${id} not found`,
      );
    }
    return entity;
  }

  async findMany(options?: FindManyOptions): Promise<T[]> {
    return memoryStore.list<T>(this.definition.name, options);
  }

  async create(entity: T, id?: string): Promise<T> {
    const documentId = id ?? this.definition.getId(entity);
    return memoryStore.set(this.definition.name, documentId, entity);
  }

  async createWithGeneratedId(build: (id: string) => T): Promise<T> {
    const id = memoryStore.generateId(this.definition.name);
    const entity = build(id);
    return this.create(entity, id);
  }

  async save(id: string, entity: T): Promise<T> {
    return memoryStore.set(this.definition.name, id, entity);
  }

  async update(id: string, partial: Partial<T>): Promise<T> {
    const existing = await this.findOneOrFail(id);
    const updated = { ...existing, ...partial };
    return this.save(id, updated);
  }

  async delete(id: string): Promise<void> {
    await this.findOneOrFail(id);
    memoryStore.delete(this.definition.name, id);
  }
}
