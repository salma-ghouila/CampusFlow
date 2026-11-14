import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Informatique' })
  @IsOptional()
  @IsString()
  program?: string;

  @ApiPropertyOptional({ example: 'Licence 2' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(80)
  weeklyStudyHours?: number;

  @ApiPropertyOptional({ example: 'Soir' })
  @IsOptional()
  @IsString()
  availability?: string;

  @ApiPropertyOptional({ example: 'Amine Ben Salah' })
  @IsOptional()
  @IsString()
  fullName?: string;
}