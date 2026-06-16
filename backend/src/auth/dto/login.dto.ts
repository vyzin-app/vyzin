import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@vyzin.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
