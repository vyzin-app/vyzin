import { Announcement, AnnouncementCategory } from '../domain/announcement'
import { buildQueryString } from '../infra/http/queryParams'
import { apiClient } from '../infra/http/api'
import { AnnouncementListFilter } from '../domain/listFilters'

export interface AnnouncementInput {
  title: string
  content: string
  category: AnnouncementCategory
  isPinned: boolean
  isImportant: boolean
}

export interface AnnouncementRepository {
  list(filter?: AnnouncementListFilter): Promise<Announcement[]>
  create(input: AnnouncementInput): Promise<string>
  update(id: string, input: AnnouncementInput): Promise<Announcement>
  remove(id: string): Promise<void>
}

function normalize(announcement: Announcement): Announcement {
  return { ...announcement, date: String(announcement.date) }
}

class HttpAnnouncementRepository implements AnnouncementRepository {
  async list(filter: AnnouncementListFilter = {}): Promise<Announcement[]> {
    const query = buildQueryString({
      category: filter.category,
      search: filter.search,
      isPinned: filter.isPinned,
      isImportant: filter.isImportant,
    })
    const data = await apiClient.get<Announcement[]>(`/announcements${query}`)
    return data.map(normalize)
  }

  create(input: AnnouncementInput): Promise<string> {
    return apiClient.post<string>('/announcements', input)
  }

  async update(id: string, input: AnnouncementInput): Promise<Announcement> {
    const updated = await apiClient.put<Announcement>(
      `/announcements/${id}`,
      input,
    )
    return normalize(updated)
  }

  remove(id: string): Promise<void> {
    return apiClient.del(`/announcements/${id}`)
  }
}

export const announcementRepository: AnnouncementRepository =
  new HttpAnnouncementRepository()
