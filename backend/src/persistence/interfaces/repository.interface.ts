import type { FindManyOptions } from './find-options.interface';

/**
 * Generic persistence port (Repository pattern).
 * Domain services depend on this abstraction, not on Firestore details.
 */
export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findOneOrFail(id: string): Promise<T>;
  findMany(options?: FindManyOptions): Promise<T[]>;
  create(entity: T, id?: string): Promise<T>;
  save(id: string, entity: T): Promise<T>;
  update(id: string, partial: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
