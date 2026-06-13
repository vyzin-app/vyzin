import { Announcement, AnnouncementCategory } from '../domain/announcement'
import { apiClient } from '../infra/http/api'

export interface AnnouncementInput {
  title: string
  content: string
  category: AnnouncementCategory
  isPinned: boolean
  isImportant: boolean
}

export interface AnnouncementRepository {
  list(): Promise<Announcement[]>
  create(input: AnnouncementInput): Promise<string>
  update(id: string, input: AnnouncementInput): Promise<Announcement>
  remove(id: string): Promise<void>
}

function normalize(announcement: Announcement): Announcement {
  return { ...announcement, date: String(announcement.date) }
}

class HttpAnnouncementRepository implements AnnouncementRepository {
  async list(): Promise<Announcement[]> {
    const data = await apiClient.get<Announcement[]>('/announcements')
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
