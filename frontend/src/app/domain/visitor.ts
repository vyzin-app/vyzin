export type VisitType = 'apartment' | 'reservation'
export type VisitorStatus = 'authorized' | 'waiting' | 'exited' | 'denied'

export interface Visitor {
  id: string
  name: string
  cpf: string
  phone: string
  email: string
  purpose: string
  date: string
  time: string
  notes: string
  visitType: VisitType
  status: VisitorStatus
  /** Owner of the record: who registered the visitor (set by the server). */
  createdBy?: string
  authorizedBy: string
  exitTime?: string
  // Resolved display fields returned by the API (read-only).
  createdByName?: string
  createdByDisplay?: string
  authorizedByName?: string
  authorizedByDisplay?: string
}
