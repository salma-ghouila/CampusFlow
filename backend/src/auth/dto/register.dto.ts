import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Amine Ben Salah' })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({ example: 'amine@campus.tn' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'motdepasse123' })
  @IsString()
  @MinLength(8)
  password!: string;
}