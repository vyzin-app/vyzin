/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationStatusEnum } from '../entities/reservations.entity';

export class ReservationDTO {
  @IsString()
  space: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsEnum(ReservationStatusEnum)
  @IsNotEmpty()
  status: ReservationStatusEnum;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  linkedVisitorIds?: string[];
}
