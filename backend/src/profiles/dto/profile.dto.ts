import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AppFunction } from '../../auth/functions/app-functions';

export class ProfileDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsEnum(AppFunction, { each: true })
  functions: AppFunction[];
}
