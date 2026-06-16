import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AnnouncementCategoryEnum } from '../entities/announcement.entity';

export class AnnouncementDTO {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(AnnouncementCategoryEnum)
  category: AnnouncementCategoryEnum;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsBoolean()
  isImportant?: boolean;
}
