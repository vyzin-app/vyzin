import { Visitor, VisitorStatus } from '../domain/visitor'
import { buildQueryString } from '../infra/http/queryParams'
import { apiClient } from '../infra/http/api'
import { VisitorListFilter } from '../domain/listFilters'

export type VisitorInput = Omit<
  Visitor,
  | 'id'
  | 'authorizedBy'
  | 'createdBy'
  | 'createdByName'
  | 'createdByDisplay'
  | 'authorizedByName'
  | 'authorizedByDisplay'
>

export interface VisitorRepository {
  list(filter?: VisitorListFilter): Promise<Visitor[]>
  get(id: string): Promise<Visitor>
  create(input: VisitorInput): Promise<string>
  update(id: string, input: VisitorInput): Promise<Visitor>
  updateStatus(
    id: string,
    status: VisitorStatus,
    exitTime?: string,
  ): Promise<Visitor>
  remove(id: string): Promise<void>
}

function normalize(visitor: Visitor): Visitor {
  return { ...visitor, date: String(visitor.date).slice(0, 10) }
}

/** The backend rejects an empty email; send `undefined` instead. */
function toBody(input: VisitorInput) {
  return {
    ...input,
    phone: input.phone || '-',
    email: input.email ? input.email : undefined,
  }
}

class HttpVisitorRepository implements VisitorRepository {
  async list(filter: VisitorListFilter = {}): Promise<Visitor[]> {
    const query = buildQueryString({
      status: filter.status,
      visitType: filter.visitType,
      date: filter.date,
      search: filter.search,
    })
    const data = await apiClient.get<Visitor[]>(`/visitors${query}`)
    return data.map(normalize)
  }

  async get(id: string): Promise<Visitor> {
    const visitor = await apiClient.get<Visitor>(`/visitors/${id}`)
    return normalize(visitor)
  }

  create(input: VisitorInput): Promise<string> {
    return apiClient.post<string>('/visitors', toBody(input))
  }

  async update(id: string, input: VisitorInput): Promise<Visitor> {
    const updated = await apiClient.put<Visitor>(
      `/visitors/${id}`,
      toBody(input),
    )
    return normalize(updated)
  }

  async updateStatus(
    id: string,
    status: VisitorStatus,
    exitTime?: string,
  ): Promise<Visitor> {
    const updated = await apiClient.patch<Visitor>(`/visitors/${id}/status`, {
      status,
      exitTime,
    })
    return normalize(updated)
  }

  remove(id: string): Promise<void> {
    return apiClient.del(`/visitors/${id}`)
  }
}

export const visitorRepository: VisitorRepository = new HttpVisitorRepository()
