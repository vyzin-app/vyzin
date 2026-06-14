import { AvailableSlot, Reservation } from '../domain/reservation'
import { buildQueryString } from '../infra/http/queryParams'
import { apiClient } from '../infra/http/api'
import { ReservationListFilter } from '../domain/listFilters'

export type ReservationInput = Omit<Reservation, 'id' | 'createdBy'>

export interface ReservationRepository {
  list(filter?: ReservationListFilter): Promise<Reservation[]>
  getAvailableSlots(
    space: string,
    date: string,
    excludeId?: string,
  ): Promise<AvailableSlot[]>
  create(input: ReservationInput): Promise<string>
  update(id: string, input: ReservationInput): Promise<Reservation>
  linkVisitor(reservationId: string, visitorId: string): Promise<void>
  unlinkVisitor(reservationId: string, visitorId: string): Promise<void>
  remove(id: string): Promise<void>
}

/** Firestore serializes dates to ISO strings; keep just the YYYY-MM-DD part. */
function normalize(reservation: Reservation): Reservation {
  return { ...reservation, date: String(reservation.date).slice(0, 10) }
}

class HttpReservationRepository implements ReservationRepository {
  async list(filter: ReservationListFilter = {}): Promise<Reservation[]> {
    const query = buildQueryString({
      status: filter.status,
      date: filter.date,
      search: filter.search,
    })
    const data = await apiClient.get<Reservation[]>(`/reservations${query}`)
    return data.map(normalize)
  }

  getAvailableSlots(
    space: string,
    date: string,
    excludeId?: string,
  ): Promise<AvailableSlot[]> {
    const query = buildQueryString({ space, date, excludeId })
    return apiClient.get<AvailableSlot[]>(
      `/reservations/available-slots${query}`,
    )
  }

  create(input: ReservationInput): Promise<string> {
    return apiClient.post<string>('/reservations', input)
  }

  async update(id: string, input: ReservationInput): Promise<Reservation> {
    const updated = await apiClient.put<Reservation>(
      `/reservations/${id}`,
      input,
    )
    return normalize(updated)
  }

  linkVisitor(reservationId: string, visitorId: string): Promise<void> {
    return apiClient.post<void>(
      `/reservations/${reservationId}/visitors/${visitorId}`,
    )
  }

  unlinkVisitor(reservationId: string, visitorId: string): Promise<void> {
    return apiClient.del(
      `/reservations/${reservationId}/visitors/${visitorId}`,
    )
  }

  remove(id: string): Promise<void> {
    return apiClient.del(`/reservations/${id}`)
  }
}

export const reservationRepository: ReservationRepository =
  new HttpReservationRepository()
