import { AppFunction } from '../domain/appFunction'
import { Profile } from '../domain/profile'
import { apiClient } from '../infra/http/api'

export interface ProfileInput {
  name: string
  description?: string
  functions: AppFunction[]
}

export interface ProfileRepository {
  list(): Promise<Profile[]>
  create(input: ProfileInput): Promise<Profile>
  update(id: string, input: ProfileInput): Promise<Profile>
  remove(id: string): Promise<void>
}

class HttpProfileRepository implements ProfileRepository {
  list(): Promise<Profile[]> {
    return apiClient.get<Profile[]>('/profiles')
  }

  create(input: ProfileInput): Promise<Profile> {
    return apiClient.post<Profile>('/profiles', input)
  }

  update(id: string, input: ProfileInput): Promise<Profile> {
    return apiClient.put<Profile>(`/profiles/${id}`, input)
  }

  remove(id: string): Promise<void> {
    return apiClient.del(`/profiles/${id}`)
  }
}

export const profileRepository: ProfileRepository = new HttpProfileRepository()
