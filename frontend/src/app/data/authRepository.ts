import { FunctionDescriptor } from '../domain/appFunction'
import { Profile } from '../domain/profile'
import { apiClient } from '../infra/http/api'

export interface AuthMeResponse {
  user: {
    uid: string
    name: string
    email: string
    cpf: string
    phone: string
    apartment?: string
    block?: string
    profileId: string
  }
  profile: Profile
}

export interface AuthRepository {
  me(): Promise<AuthMeResponse>
  listFunctions(): Promise<FunctionDescriptor[]>
}

class HttpAuthRepository implements AuthRepository {
  me(): Promise<AuthMeResponse> {
    return apiClient.get<AuthMeResponse>('/auth/me')
  }

  listFunctions(): Promise<FunctionDescriptor[]> {
    return apiClient.get<FunctionDescriptor[]>('/functions')
  }
}

export const authRepository: AuthRepository = new HttpAuthRepository()
