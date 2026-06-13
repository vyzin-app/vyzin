import { FirebaseError } from 'firebase/app'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { firebaseAuth } from '../../infra/firebase/firebaseClient'
import { AuthService } from './AuthService'

const TOKEN_STORAGE_KEY = 'vyzin_id_token'

/** Maps Firebase Auth errors to user-facing Portuguese messages. */
export function mapFirebaseAuthError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/configuration-not-found':
        return (
          'Login por e-mail ainda nao esta habilitado no Firebase. ' +
          'Console → Authentication → Sign-in method → E-mail/senha → Ativar.'
        )
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-email':
        return 'E-mail ou senha invalidos.'
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
      default:
        return error.message
    }
  }
  return error instanceof Error ? error.message : 'Erro ao entrar.'
}

/** Firebase-backed implementation of the AuthService Strategy. */
export class FirebaseAuthService implements AuthService {
  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(firebaseAuth, email, password)
    await this.persistToken()
  }

  async logout(): Promise<void> {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    await signOut(firebaseAuth)
  }

  async getToken(): Promise<string | null> {
    const user = firebaseAuth.currentUser
    if (!user) {
      return localStorage.getItem(TOKEN_STORAGE_KEY)
    }
    const token = await user.getIdToken()
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    return token
  }

  private async persistToken(): Promise<void> {
    const token = await this.getToken()
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
    }
  }

  onAuthStateChanged(callback: (isAuthenticated: boolean) => void): () => void {
    return onAuthStateChanged(firebaseAuth, (user) => callback(user !== null))
  }
}

export const firebaseAuthService = new FirebaseAuthService()
