import { buildQueryString } from '../infra/http/queryParams'
import { apiClient } from '../infra/http/api'
import { UserListFilter } from '../domain/listFilters'

export interface ManagedUser {
  uid: string
  name: string
  email: string
  cpf: string
  phone: string
  apartment?: string
  block?: string
  profileId: string
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  cpf: string
  phone: string
  apartment?: string
  block?: string
  profileId: string
}

export type UpdateUserInput = Omit<CreateUserInput, 'email' | 'password'>

export interface UserRepository {
  list(filter?: UserListFilter): Promise<ManagedUser[]>
  create(input: CreateUserInput): Promise<ManagedUser>
  update(uid: string, input: UpdateUserInput): Promise<ManagedUser>
  remove(uid: string): Promise<void>
}

class HttpUserRepository implements UserRepository {
  list(filter: UserListFilter = {}): Promise<ManagedUser[]> {
    const query = buildQueryString({
      profileId: filter.profileId,
      search: filter.search,
    })
    return apiClient.get<ManagedUser[]>(`/users${query}`)
  }

  create(input: CreateUserInput): Promise<ManagedUser> {
    return apiClient.post<ManagedUser>('/users', input)
  }

  update(uid: string, input: UpdateUserInput): Promise<ManagedUser> {
    return apiClient.put<ManagedUser>(`/users/${uid}`, input)
  }

  remove(uid: string): Promise<void> {
    return apiClient.del(`/users/${uid}`)
  }
}

export const userRepository: UserRepository = new HttpUserRepository()
