import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  VisitTypeEnum,
  VisitorStatusEnum,
} from '../entities/visitor.entity';

export class VisitorDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  purpose: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsString()
  time: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsEnum(VisitTypeEnum)
  visitType: VisitTypeEnum;

  @IsOptional()
  @IsEnum(VisitorStatusEnum)
  status?: VisitorStatusEnum;

  @IsOptional()
  @IsString()
  exitTime?: string;
}
