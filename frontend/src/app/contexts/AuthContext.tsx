import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { authRepository } from '../data/authRepository'
import { AppFunction } from '../domain/appFunction'
import { Profile } from '../domain/profile'
import { User, UserRole } from '../domain/user'
import { AuthService } from '../services/auth/AuthService'
import { firebaseAuthService } from '../services/auth/FirebaseAuthService'

// Re-exported so existing screens can keep importing these types from here.
export type { User, UserRole }

interface AuthContextType {
  user: User | null
  profile: Profile | null
  functions: AppFunction[]
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  can: (fn: AppFunction) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
  /** Injectable for testing or swapping the auth strategy (defaults to Firebase). */
  authService?: AuthService
}

/** Seeded system profiles map to a cosmetic role used only for dashboard copy. */
function roleFromProfileId(profileId: string): UserRole {
  if (
    profileId === 'admin' ||
    profileId === 'doorman' ||
    profileId === 'resident'
  ) {
    return profileId
  }
  return 'resident'
}

export function AuthProvider({
  children,
  authService = firebaseAuthService,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadCurrentUser = useCallback(async () => {
    try {
      const { user: account, profile: accountProfile } =
        await authRepository.me()
      setUser({
        id: account.uid,
        name: account.name,
        email: account.email,
        cpf: account.cpf,
        phone: account.phone,
        apartment: account.apartment,
        block: account.block,
        profileId: account.profileId,
        role: roleFromProfileId(account.profileId),
      })
      setProfile(accountProfile)
    } catch {
      // Authenticated in Firebase but no backend profile resolved — sign out.
      await authService.logout()
      setUser(null)
      setProfile(null)
    }
  }, [authService])

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (isAuth) => {
      if (isAuth) {
        await loadCurrentUser()
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [authService, loadCurrentUser])

  const functions = useMemo<AppFunction[]>(
    () => profile?.functions ?? [],
    [profile],
  )

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      profile,
      functions,
      loading,
      isAuthenticated: user !== null,
      login: async (email, password) => {
        await authService.login(email, password)
        await loadCurrentUser()
      },
      logout: async () => {
        await authService.logout()
        setUser(null)
        setProfile(null)
      },
      can: (fn: AppFunction) => functions.includes(fn),
    }),
    [user, profile, functions, loading, authService, loadCurrentUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
