import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PreAuthorizationDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsString()
  @IsNotEmpty()
  schedule: string;

  @IsString()
  @IsNotEmpty()
  validUntil: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
