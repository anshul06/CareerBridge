import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional, IsString, IsNumber, IsInt, IsEnum,
  Min, Max, IsUrl, IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '@prisma/client';

export class UpdateStudentProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional({ enum: Gender }) @IsOptional() @IsEnum(Gender) gender?: Gender;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateOfBirth?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() usn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() rollNo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() department?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(8) semester?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() yearOfAdmission?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() expectedGraduationYear?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 10 })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(10) cgpa?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) activeBacklogs?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) totalBacklogs?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) tenthPercentage?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() tenthBoard?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() tenthYear?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) twelfthPercentage?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() twelfthBoard?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() twelfthYear?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) diplomaPercentage?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() diplomaStream?: string;

  @ApiPropertyOptional() @IsOptional() @IsUrl() linkedinUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() githubUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() portfolioUrl?: string;
}
