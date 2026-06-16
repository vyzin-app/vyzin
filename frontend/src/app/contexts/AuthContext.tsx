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
import { setUnauthorizedHandler } from '../infra/http/api'

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

function mapAccountToUser(account: AuthMeResponseUser): User {
  return {
    id: account.uid,
    name: account.name,
    email: account.email,
    cpf: account.cpf,
    phone: account.phone,
    apartment: account.apartment,
    block: account.block,
    profileId: account.profileId,
    role: roleFromProfileId(account.profileId),
  }
}

type AuthMeResponseUser = {
  uid: string
  name: string
  email: string
  cpf: string
  phone: string
  apartment?: string
  block?: string
  profileId: string
}

function applySession(
  account: AuthMeResponseUser,
  accountProfile: Profile,
  setUser: (user: User | null) => void,
  setProfile: (profile: Profile | null) => void,
) {
  setUser(mapAccountToUser(account))
  setProfile(accountProfile)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const clearSession = useCallback(() => {
    setUser(null)
    setProfile(null)
  }, [])

  const loadCurrentUser = useCallback(async () => {
    try {
      const { user: account, profile: accountProfile } =
        await authRepository.me()
      applySession(account, accountProfile, setUser, setProfile)
    } catch {
      clearSession()
    }
  }, [clearSession])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession()
    })
  }, [clearSession])

  useEffect(() => {
    void loadCurrentUser().finally(() => setLoading(false))
  }, [loadCurrentUser])

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
        const { user: account, profile: accountProfile } =
          await authRepository.login(email, password)
        applySession(account, accountProfile, setUser, setProfile)
      },
      logout: async () => {
        try {
          await authRepository.logout()
        } finally {
          clearSession()
        }
      },
      can: (fn: AppFunction) => functions.includes(fn),
    }),
    [user, profile, functions, loading, clearSession],
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
