import { AppFunction } from '../../auth/functions/app-functions';

export interface Profile {
  id: string;
  name: string;
  description: string;
  functions: AppFunction[];
  /** System profiles (e.g. admin) are protected from deletion and lockout. */
  isSystem: boolean;
}
