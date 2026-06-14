import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ReservationStatusEnum } from '../../reservas/entities/reservations.entity';
import {
  VisitTypeEnum,
  VisitorStatusEnum,
} from '../../visitantes/entities/visitor.entity';

export class FilterOperationalReportDTO {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(ReservationStatusEnum)
  reservationStatus?: ReservationStatusEnum;

  @IsOptional()
  @IsString()
  space?: string;

  @IsOptional()
  @IsEnum(VisitorStatusEnum)
  visitorStatus?: VisitorStatusEnum;

  @IsOptional()
  @IsEnum(VisitTypeEnum)
  visitType?: VisitTypeEnum;

  @IsOptional()
  @IsString()
  search?: string;
}
