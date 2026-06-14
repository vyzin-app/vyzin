import { AnnouncementCategory } from './announcement'
import { ReservationStatus } from './reservation'
import { VisitType, VisitorStatus } from './visitor'

export interface ReservationListFilter {
  status?: ReservationStatus
  date?: string
  search?: string
}

export interface VisitorListFilter {
  status?: VisitorStatus
  visitType?: VisitType
  date?: string
  search?: string
}

export interface AnnouncementListFilter {
  category?: AnnouncementCategory
  search?: string
  isPinned?: boolean
  isImportant?: boolean
}

export interface UserListFilter {
  profileId?: string
  search?: string
}
