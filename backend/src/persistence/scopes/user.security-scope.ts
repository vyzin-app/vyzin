import { ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user';
import type { User } from '../../users/entities/user.entity';
import type { QueryFilter } from '../interfaces/find-options.interface';
import type {
  ISecurityScope,
  WriteOperation,
} from '../interfaces/security-scope.interface';

/** Doormen only see residents; admins see everyone (RBAC on controllers). */
@Injectable()
export class UserSecurityScope implements ISecurityScope<User> {
  private isDoorman(user: AuthenticatedUser): boolean {
    return user.profileId === 'doorman';
  }

  getListFilters(user: AuthenticatedUser): QueryFilter[] {
    if (this.isDoorman(user)) {
      return [{ field: 'profileId', op: '==', value: 'resident' }];
    }
    return [];
  }

  matchesEntity(user: AuthenticatedUser, entity: User): boolean {
    if (this.isDoorman(user)) {
      return entity.profileId === 'resident';
    }
    return true;
  }

  assertCanRead(user: AuthenticatedUser, entity: User): void {
    if (!this.matchesEntity(user, entity)) {
      throw new ForbiddenException(
        'Voce so pode visualizar moradores cadastrados.',
      );
    }
  }

  assertCanWrite(
    user: AuthenticatedUser,
    entity: User,
    _operation: WriteOperation,
  ): void {
    this.assertCanRead(user, entity);
  }
}
