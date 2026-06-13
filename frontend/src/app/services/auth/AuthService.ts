/**
 * Authentication abstraction (Strategy + Dependency Inversion). The UI/context
 * depends on this interface, not on Firebase, so the implementation can be
 * swapped (e.g. for tests) without touching consumers.
 */
export interface AuthService {
  login(email: string, password: string): Promise<void>
  logout(): Promise<void>
  /** Current user's fresh ID token, or null when signed out. */
  getToken(): Promise<string | null>
  /** Subscribes to auth state changes; returns an unsubscribe function. */
  onAuthStateChanged(callback: (isAuthenticated: boolean) => void): () => void
}
