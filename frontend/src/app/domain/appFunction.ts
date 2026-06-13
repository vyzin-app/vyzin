/**
 * Mirror of the backend function catalog (auth/functions/app-functions.ts).
 * Values must match the backend strings exactly — they are what the profile's
 * `functions[]` contains and what the UI gates on.
 */
export enum AppFunction {
  RESERVATIONS_READ = 'reservations:read',
  RESERVATIONS_MANAGE = 'reservations:manage',
  RESERVATIONS_MANAGE_ALL = 'reservations:manage_all',
  VISITORS_READ = 'visitors:read',
  VISITORS_MANAGE = 'visitors:manage',
  VISITORS_WORKFLOW = 'visitors:workflow',
  ANNOUNCEMENTS_READ = 'announcements:read',
  ANNOUNCEMENTS_MANAGE = 'announcements:manage',
  INFORMATION_READ = 'information:read',
  INFORMATION_EDIT = 'information:edit',
  USERS_READ = 'users:read',
  USERS_MANAGE = 'users:manage',
  PROFILES_READ = 'profiles:read',
  PROFILES_MANAGE = 'profiles:manage',
}

export interface FunctionDescriptor {
  key: AppFunction
  label: string
  area: string
}
