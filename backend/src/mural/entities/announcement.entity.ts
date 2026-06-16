export enum AnnouncementCategoryEnum {
  GENERAL = 'general',
  EVENT = 'event',
  MAINTENANCE = 'maintenance',
  IMPORTANT = 'important',
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: Date;
  category: AnnouncementCategoryEnum;
  isPinned: boolean;
  isImportant: boolean;
  likes: number;
  comments: number;
}
