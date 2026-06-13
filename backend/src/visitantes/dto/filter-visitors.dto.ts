import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import {
  VisitTypeEnum,
  VisitorStatusEnum,
} from '../entities/visitor.entity';

/** Optional query filters for listing visitors (`?status=...&date=...&visitType=...`). */
export class FilterVisitorsDTO {
  @IsOptional()
  @IsEnum(VisitorStatusEnum)
  status?: VisitorStatusEnum;

  @IsOptional()
  @IsEnum(VisitTypeEnum)
  visitType?: VisitTypeEnum;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;
}
