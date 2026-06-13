export type AnnouncementCategory =
  | 'general'
  | 'event'
  | 'maintenance'
  | 'important'

export interface Announcement {
  id: string
  title: string
  content: string
  author: string
  date: string
  category: AnnouncementCategory
  isPinned: boolean
  isImportant: boolean
  likes: number
  comments: number
}
