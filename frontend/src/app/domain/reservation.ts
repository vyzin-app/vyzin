export type ReservationStatus = 'confirmed' | 'cancelled'

export interface Reservation {
  id: string
  space: string
  date: string
  startTime: string
  endTime: string
  notes: string
  status: ReservationStatus
  createdBy: string
  linkedVisitorIds: string[]
}
