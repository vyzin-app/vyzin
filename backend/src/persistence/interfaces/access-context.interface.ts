import type { AuthenticatedUser } from '../../auth/types/authenticated-user';

/** Context passed from controllers so repositories can apply row-level security. */
export interface AccessContext {
  user: AuthenticatedUser;
}
