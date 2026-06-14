import { IsOptional, IsString } from 'class-validator';

/** Optional query filters for listing users (`?profileId=...&search=...`). */
export class FilterUsersDTO {
  @IsOptional()
  @IsString()
  profileId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
