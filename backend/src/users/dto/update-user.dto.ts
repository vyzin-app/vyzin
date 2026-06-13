import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** Email/password are managed by Firebase Auth and are not editable here. */
export class UpdateUserDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  apartment?: string;

  @IsOptional()
  @IsString()
  block?: string;

  @IsString()
  @IsNotEmpty()
  profileId: string;
}
