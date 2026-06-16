import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { firebaseAuth } from '../../infra/firebase/firebaseClient'
import type { AuthService } from './AuthService'

class FirebaseAuthService implements AuthService {
  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(firebaseAuth, email, password)
  }

  async logout(): Promise<void> {
    await signOut(firebaseAuth)
  }

  async getToken(): Promise<string | null> {
    const user = firebaseAuth.currentUser
    if (!user) {
      return null
    }
    return user.getIdToken()
  }

  onAuthStateChanged(callback: (isAuthenticated: boolean) => void): () => void {
    return onAuthStateChanged(firebaseAuth, (user) => {
      callback(user !== null)
    })
  }
}

export const firebaseAuthService = new FirebaseAuthService()

/** Maps Firebase Auth errors to user-facing Portuguese messages. */
export function mapFirebaseAuthError(error: unknown): string {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
      ? (error as { code: string }).code
      : ''

  switch (code) {
    case 'auth/invalid-email':
      return 'E-mail inválido.'
    case 'auth/user-disabled':
      return 'Esta conta foi desativada.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.'
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.'
    case 'auth/configuration-not-found':
      return 'Autenticação não configurada no Firebase. Habilite E-mail/senha no console.'
    default:
      return error instanceof Error
        ? error.message
        : 'Não foi possível entrar. Tente novamente.'
  }
}
