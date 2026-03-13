import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SkillCategory } from '@prisma/client';
import { SkillsService } from './skills.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Skills')
@ApiBearerAuth()
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all skills in the canonical taxonomy' })
  @ApiQuery({ name: 'category', enum: SkillCategory, required: false })
  getAllSkills(@Query('category') category?: SkillCategory) {
    return this.skillsService.getAllSkills(category);
  }
}
