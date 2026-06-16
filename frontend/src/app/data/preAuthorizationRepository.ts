import {
  PreAuthorization,
  PreAuthorizationInput,
} from '../domain/preAuthorization'
import { buildQueryString } from '../infra/http/queryParams'
import { apiClient } from '../infra/http/api'

export interface PreAuthorizationRepository {
  list(search?: string): Promise<PreAuthorization[]>
  get(id: string): Promise<PreAuthorization>
  create(input: PreAuthorizationInput): Promise<string>
  update(id: string, input: PreAuthorizationInput): Promise<PreAuthorization>
  remove(id: string): Promise<void>
}

function normalize(item: PreAuthorization): PreAuthorization {
  return {
    ...item,
    validUntil: String(item.validUntil).slice(0, 10),
  }
}

class HttpPreAuthorizationRepository implements PreAuthorizationRepository {
  async list(search?: string): Promise<PreAuthorization[]> {
    const query = buildQueryString({ search })
    const data = await apiClient.get<PreAuthorization[]>(
      `/pre-authorizations${query}`,
    )
    return data.map(normalize)
  }

  async get(id: string): Promise<PreAuthorization> {
    const item = await apiClient.get<PreAuthorization>(
      `/pre-authorizations/${id}`,
    )
    return normalize(item)
  }

  create(input: PreAuthorizationInput): Promise<string> {
    return apiClient.post<string>('/pre-authorizations', input)
  }

  async update(
    id: string,
    input: PreAuthorizationInput,
  ): Promise<PreAuthorization> {
    const updated = await apiClient.put<PreAuthorization>(
      `/pre-authorizations/${id}`,
      input,
    )
    return normalize(updated)
  }

  remove(id: string): Promise<void> {
    return apiClient.del(`/pre-authorizations/${id}`)
  }
}

export const preAuthorizationRepository: PreAuthorizationRepository =
  new HttpPreAuthorizationRepository()
