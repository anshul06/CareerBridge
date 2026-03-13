import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsEnum, IsOptional,
  IsBoolean, IsDateString, IsUrl,
} from 'class-validator';
import { AchievementType } from '@prisma/client';

export class CreateAchievementDto {
  @ApiProperty({ enum: AchievementType })
  @IsEnum(AchievementType)
  type: AchievementType;

  @ApiProperty({ example: 'Smart India Hackathon 2024 - Finalist' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isOngoing?: boolean;

  @ApiPropertyOptional({ example: 'Finalist' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  url?: string;
}

export class UpdateAchievementDto extends CreateAchievementDto {}
