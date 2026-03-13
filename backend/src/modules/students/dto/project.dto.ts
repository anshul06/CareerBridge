import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsBoolean,
  IsArray, IsDateString, IsUrl,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'AI Resume Builder' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Built a full-stack resume builder using React and Node.js with OpenAI integration' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: ['React', 'Node.js', 'PostgreSQL', 'OpenAI'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  repoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  liveUrl?: string;

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

  @ApiPropertyOptional({ example: ['Reduced load time by 40%', 'Integrated 3 AI models'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];
}

export class UpdateProjectDto extends CreateProjectDto {}
