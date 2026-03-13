import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl, IsEnum } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Infosys Limited' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'https://infosys.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'Information Technology' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Bengaluru, Karnataka' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: '10000+' })
  @IsOptional()
  @IsString()
  size?: string;
}

export class UpdateCompanyDto extends CreateCompanyDto {}
