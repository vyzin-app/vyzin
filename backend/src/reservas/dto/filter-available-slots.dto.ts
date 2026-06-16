/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

/** Query params for GET /reservations/available-slots */
export class FilterAvailableSlotsDTO {
  @IsString()
  space: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  /** When editing, ignore the current reservation in conflict checks. */
  @IsOptional()
  @IsString()
  excludeId?: string;
}
