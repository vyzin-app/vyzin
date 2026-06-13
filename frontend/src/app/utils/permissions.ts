import { AppFunction } from '../domain/appFunction'

/**
 * Permission flags derived dynamically from the logged-in user's functions
 * (which come from their profile). This replaces the old static role matrix:
 * permission is now data, owned by the profile (Information Expert).
 */
export interface Permission {
  canAccessDashboard: boolean
  canAccessReservations: boolean
  canManageReservations: boolean
  canAccessVisitors: boolean
  canManageVisitors: boolean
  canVisitorWorkflow: boolean
  canAccessNoticeBoard: boolean
  canManageNoticeBoard: boolean
  canAccessInformation: boolean
  canEditInformation: boolean
  canAccessSecurity: boolean
  canManageUsers: boolean
  canAccessProfiles: boolean
  canManageProfiles: boolean
}

export function getUserPermissions(functions: AppFunction[]): Permission {
  const has = (fn: AppFunction) => functions.includes(fn)
  return {
    canAccessDashboard: true,
    canAccessReservations: has(AppFunction.RESERVATIONS_READ),
    canManageReservations: has(AppFunction.RESERVATIONS_MANAGE),
    canAccessVisitors: has(AppFunction.VISITORS_READ),
    canManageVisitors: has(AppFunction.VISITORS_MANAGE),
    canVisitorWorkflow: has(AppFunction.VISITORS_WORKFLOW),
    canAccessNoticeBoard: has(AppFunction.ANNOUNCEMENTS_READ),
    canManageNoticeBoard: has(AppFunction.ANNOUNCEMENTS_MANAGE),
    canAccessInformation: has(AppFunction.INFORMATION_READ),
    canEditInformation: has(AppFunction.INFORMATION_EDIT),
    canAccessSecurity: has(AppFunction.USERS_READ),
    canManageUsers: has(AppFunction.USERS_MANAGE),
    canAccessProfiles: has(AppFunction.PROFILES_READ),
    canManageProfiles: has(AppFunction.PROFILES_MANAGE),
  }
}
