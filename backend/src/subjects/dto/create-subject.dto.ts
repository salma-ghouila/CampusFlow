import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Réseaux informatiques' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;
}