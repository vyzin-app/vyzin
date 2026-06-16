import type { FindManyOptions, QueryFilter } from '../../src/persistence/interfaces/find-options.interface';

type CollectionStore = Map<string, unknown>;

/** In-memory storage shared by test repositories. */
export class MemoryStore {
  private readonly collections = new Map<string, CollectionStore>();

  private bucket(name: string): CollectionStore {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map());
    }
    return this.collections.get(name)!;
  }

  clear(): void {
    this.collections.clear();
  }

  get<T>(collection: string, id: string): T | null {
    const value = this.bucket(collection).get(id);
    return value ? structuredClone(value as T) : null;
  }

  set<T>(collection: string, id: string, entity: T): T {
    const copy = structuredClone(entity);
    this.bucket(collection).set(id, copy);
    return copy;
  }

  delete(collection: string, id: string): void {
    this.bucket(collection).delete(id);
  }

  list<T>(collection: string, options?: FindManyOptions): T[] {
    const items = [...this.bucket(collection).values()] as T[];
    const filtered = items.filter((item) =>
      (options?.filters ?? []).every((filter) => matchesFilter(item, filter)),
    );
    if (options?.limit !== undefined) {
      return filtered.slice(0, options.limit).map((item) => structuredClone(item));
    }
    return filtered.map((item) => structuredClone(item));
  }

  generateId(collection: string): string {
    return `${collection}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

function getFieldValue(entity: unknown, field: string): unknown {
  if (typeof entity !== 'object' || entity === null) {
    return undefined;
  }
  return (entity as Record<string, unknown>)[field];
}

function matchesFilter(entity: unknown, filter: QueryFilter): boolean {
  const value = getFieldValue(entity, filter.field);
  const target = filter.value;

  switch (filter.op) {
    case '==':
      return value === target;
    case '>=':
      return compareValues(value, target) >= 0;
    case '<=':
      return compareValues(value, target) <= 0;
    default:
      return true;
  }
}

function compareValues(a: unknown, b: unknown): number {
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return 0;
}

export const memoryStore = new MemoryStore();
