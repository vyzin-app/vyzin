import { ForbiddenException } from '@nestjs/common';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user';
import type { QueryFilter } from '../interfaces/find-options.interface';
import type {
  ISecurityScope,
  WriteOperation,
} from '../interfaces/security-scope.interface';

export interface OwnershipScopeConfig<T> {
  /** Firestore field used for equality pre-filter (e.g. `createdBy`). */
  ownerField: string;
  getOwnerId: (entity: T) => string;
  /** @deprecated Prefer canBypassRead / canBypassWrite for split rules. */
  canBypass?: (user: AuthenticatedUser) => boolean;
  canBypassRead?: (user: AuthenticatedUser) => boolean;
  canBypassWrite?: (user: AuthenticatedUser) => boolean;
  readDeniedMessage?: string;
  writeDeniedMessage?: string;
}

/**
 * Reusable ownership scope: users see only rows they own unless a bypass rule applies.
 */
export class OwnershipSecurityScope<T> implements ISecurityScope<T> {
  constructor(private readonly config: OwnershipScopeConfig<T>) {}

  private canReadAll(user: AuthenticatedUser): boolean {
    if (this.config.canBypassRead) {
      return this.config.canBypassRead(user);
    }
    return this.config.canBypass?.(user) ?? false;
  }

  private canWriteAll(user: AuthenticatedUser): boolean {
    if (this.config.canBypassWrite) {
      return this.config.canBypassWrite(user);
    }
    return this.config.canBypass?.(user) ?? false;
  }

  private isOwner(user: AuthenticatedUser, entity: T): boolean {
    return this.config.getOwnerId(entity) === user.uid;
  }

  getListFilters(user: AuthenticatedUser): QueryFilter[] {
    if (this.canReadAll(user)) {
      return [];
    }
    return [
      {
        field: this.config.ownerField,
        op: '==',
        value: user.uid,
      },
    ];
  }

  matchesEntity(user: AuthenticatedUser, entity: T): boolean {
    return this.canReadAll(user) || this.isOwner(user, entity);
  }

  assertCanRead(user: AuthenticatedUser, entity: T): void {
    if (!this.matchesEntity(user, entity)) {
      throw new ForbiddenException(
        this.config.readDeniedMessage ??
          'Voce nao tem permissao para acessar este registro.',
      );
    }
  }

  assertCanWrite(
    user: AuthenticatedUser,
    entity: T,
    _operation: WriteOperation,
  ): void {
    if (this.canWriteAll(user) || this.isOwner(user, entity)) {
      return;
    }
    throw new ForbiddenException(
      this.config.writeDeniedMessage ??
        'Voce nao tem permissao para alterar este registro.',
    );
  }
}
