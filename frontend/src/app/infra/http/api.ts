import { firebaseAuthService } from '../../services/auth/FirebaseAuthService'
import { createApiClient } from './apiClient'

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

/**
 * Shared API client singleton. Pulls the Bearer token from the Firebase auth
 * service and signs the user out on a 401. Repositories import this instance.
 */
export const apiClient = createApiClient({
  baseUrl,
  getToken: () => firebaseAuthService.getToken(),
  onUnauthorized: () => {
    void firebaseAuthService.logout()
  },
})
