import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'amine@campus.tn' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'motdepasse123' })
  @IsString()
  password!: string;
}