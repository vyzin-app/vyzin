import { Reservation } from '../domain/reservation'
import { apiClient } from '../infra/http/api'

export type ReservationInput = Omit<Reservation, 'id' | 'createdBy'>

export interface ReservationRepository {
  list(): Promise<Reservation[]>
  create(input: ReservationInput): Promise<string>
  update(id: string, input: ReservationInput): Promise<Reservation>
  remove(id: string): Promise<void>
}

/** Firestore serializes dates to ISO strings; keep just the YYYY-MM-DD part. */
function normalize(reservation: Reservation): Reservation {
  return { ...reservation, date: String(reservation.date).slice(0, 10) }
}

class HttpReservationRepository implements ReservationRepository {
  async list(): Promise<Reservation[]> {
    const data = await apiClient.get<Reservation[]>('/reservations')
    return data.map(normalize)
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

  remove(id: string): Promise<void> {
    return apiClient.del(`/reservations/${id}`)
  }
}

export const reservationRepository: ReservationRepository =
  new HttpReservationRepository()
