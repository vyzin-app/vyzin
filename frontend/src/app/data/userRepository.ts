import { apiClient } from '../infra/http/api'

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
  list(): Promise<ManagedUser[]>
  create(input: CreateUserInput): Promise<ManagedUser>
  update(uid: string, input: UpdateUserInput): Promise<ManagedUser>
  remove(uid: string): Promise<void>
}

class HttpUserRepository implements UserRepository {
  list(): Promise<ManagedUser[]> {
    return apiClient.get<ManagedUser[]>('/users')
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
