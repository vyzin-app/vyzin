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
  authorizedBy: string
  exitTime?: string
}
