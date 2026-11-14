import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateProgressDto {
  @ApiProperty({ example: 60, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  mastery!: number;

  @ApiPropertyOptional({ example: 'Revoir les jointures' })
  @IsOptional()
  @IsString()
  notes?: string;
}