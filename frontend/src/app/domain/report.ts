export interface OperationalReportLinkedVisitor {
  visitorId: string
  name: string
  cpf: string
  status: string
  visitType: string
}

export interface OperationalReportReservationRow {
  reservationId: string
  space: string
  date: string
  startTime: string
  endTime: string
  status: string
  notes: string
  createdByName: string
  createdByEmail: string
  createdByApartment?: string
  createdByBlock?: string
  createdByProfileName: string
  linkedVisitorCount: number
  linkedVisitors: OperationalReportLinkedVisitor[]
}

export interface OperationalReportVisitorRow {
  visitorId: string
  name: string
  cpf: string
  phone: string
  date: string
  time: string
  status: string
  visitType: string
  purpose: string
  authorizedByName: string
  authorizedByEmail: string
  authorizedByApartment?: string
  authorizedByBlock?: string
  authorizedByProfileName: string
  reservationId?: string
  reservationSpace?: string
  reservationDate?: string
  reservationStartTime?: string
  reservationStatus?: string
  reservationOwnerName?: string
}

export interface OperationalReportSpaceCount {
  space: string
  count: number
}

export interface OperationalReportSummary {
  totalReservations: number
  confirmedReservations: number
  cancelledReservations: number
  totalVisitors: number
  authorizedVisitors: number
  waitingVisitors: number
  exitedVisitors: number
  deniedVisitors: number
  reservationGuests: number
  topSpaces: OperationalReportSpaceCount[]
}

export interface OperationalReport {
  summary: OperationalReportSummary
  reservations: OperationalReportReservationRow[]
  visitors: OperationalReportVisitorRow[]
  generatedAt: string
}

export interface OperationalReportFilter {
  from?: string
  to?: string
  reservationStatus?: 'confirmed' | 'cancelled'
  space?: string
  visitorStatus?: 'authorized' | 'waiting' | 'exited' | 'denied'
  visitType?: 'apartment' | 'reservation'
  search?: string
}
