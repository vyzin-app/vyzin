import type { AuthenticatedUser } from '../../auth/types/authenticated-user';
import type { QueryFilter } from './find-options.interface';

export type WriteOperation = 'create' | 'update' | 'delete';

/**
 * Strategy for row-level security (pre-filters + post-checks).
 * Each entity can define its own scope while sharing the same repository shell.
 */
export interface ISecurityScope<T> {
  /** Firestore constraints applied before listing (when possible). */
  getListFilters(user: AuthenticatedUser): QueryFilter[];

  /** In-memory guard when Firestore alone cannot express the rule. */
  matchesEntity(user: AuthenticatedUser, entity: T): boolean;

  assertCanRead(user: AuthenticatedUser, entity: T): void;
  assertCanWrite(
    user: AuthenticatedUser,
    entity: T,
    operation: WriteOperation,
  ): void;
}
