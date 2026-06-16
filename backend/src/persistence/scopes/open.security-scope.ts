import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user';
import type { QueryFilter } from '../interfaces/find-options.interface';
import type {
  ISecurityScope,
  WriteOperation,
} from '../interfaces/security-scope.interface';

/** No row-level filter — access is enforced only by RBAC on controllers. */
@Injectable()
export class OpenSecurityScope<T> implements ISecurityScope<T> {
  getListFilters(_user: AuthenticatedUser): QueryFilter[] {
    return [];
  }

  matchesEntity(_user: AuthenticatedUser, _entity: T): boolean {
    return true;
  }

  assertCanRead(_user: AuthenticatedUser, _entity: T): void {}

  assertCanWrite(
    _user: AuthenticatedUser,
    _entity: T,
    _operation: WriteOperation,
  ): void {}
}
