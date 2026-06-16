import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VisitorStatusEnum } from '../entities/visitor.entity';

export class UpdateVisitorStatusDTO {
  @IsEnum(VisitorStatusEnum)
  status: VisitorStatusEnum;

  @IsOptional()
  @IsString()
  exitTime?: string;
}
