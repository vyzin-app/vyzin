import { createApiClient } from './apiClient'

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

let unauthorizedHandler: (() => void) | undefined

/**
 * Shared API client. Session is kept in an httpOnly cookie set by the backend
 * after POST /auth/login. All data and permission checks go through the API.
 */
export const apiClient = createApiClient({
  baseUrl,
  withCredentials: true,
  onUnauthorized: () => {
    unauthorizedHandler?.()
  },
})

/** Lets AuthContext clear local state when any request returns 401. */
export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler
}
