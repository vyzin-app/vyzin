export interface AvailableSlot {
  startTime: string
  endTime: string
  label: string
  available: boolean
}

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
  createdByName?: string
  createdByEmail?: string
  createdByDisplay?: string
  linkedVisitorIds: string[]
}
