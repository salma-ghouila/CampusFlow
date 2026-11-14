import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateChapterDto {
  @ApiProperty({ example: 'Le modèle OSI' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;
}