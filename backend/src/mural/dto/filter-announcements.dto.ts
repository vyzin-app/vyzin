import { IsEnum, IsOptional } from 'class-validator';
import { AnnouncementCategoryEnum } from '../entities/announcement.entity';

/** Optional query filters for listing announcements (`?category=...`). */
export class FilterAnnouncementsDTO {
  @IsOptional()
  @IsEnum(AnnouncementCategoryEnum)
  category?: AnnouncementCategoryEnum;
}
