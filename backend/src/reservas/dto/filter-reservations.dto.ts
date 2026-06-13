/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationStatusEnum } from '../entities/reservations.entity';

/** Optional query filters for listing reservations (`?status=...&date=...`). */
export class FilterReservationsDTO {
  @IsOptional()
  @IsEnum(ReservationStatusEnum)
  status?: ReservationStatusEnum;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;
}
