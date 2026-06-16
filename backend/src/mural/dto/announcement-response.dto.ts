import { Announcement } from '../entities/announcement.entity';

/** Announcement payload returned by the API with author details resolved. */
export interface AnnouncementResponseDTO extends Announcement {
  authorName: string;
  authorDisplay: string;
}
