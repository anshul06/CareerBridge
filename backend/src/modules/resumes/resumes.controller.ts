import {
  Controller, Get, Post, Delete, Body, Param, Put,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ResumesService } from './resumes.service';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Resumes')
@ApiBearerAuth()
@Roles(Role.STUDENT)
@Controller('students/me/resume')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all my resumes (uploaded, generated, enhanced, tailored)' })
  getMyResumes(@CurrentUser() user: JwtPayload) {
    return this.resumesService.getMyResumes(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific resume' })
  getResume(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.resumesService.getResume(user.sub, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a resume' })
  deleteResume(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.resumesService.deleteResume(user.sub, id);
  }

  @Put(':id/set-master')
  @ApiOperation({ summary: 'Set this resume as the master/default resume' })
  setMasterResume(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.resumesService.setMasterResume(user.sub, id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload existing resume (PDF/DOCX) — auto-parses and extracts skills',
  })
  @ApiConsumes('multipart/form-data')
  uploadResume(@CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
    return this.resumesService.uploadResume(user.sub, file);
  }

  @Post('generate')
  @ApiOperation({
    summary: 'Generate a professional ATS-optimized resume from your complete profile',
    description:
      'Gathers all profile data (academics, projects, certifications, achievements) and uses AI to generate a professional resume.',
  })
  generateResume(
    @CurrentUser() user: JwtPayload,
    @Body() body: { targetRole?: string; additionalNotes?: string },
  ) {
    return this.resumesService.generateResume(user.sub, body);
  }

  @Post(':id/enhance')
  @ApiOperation({
    summary: 'Enhance an uploaded resume — identifies weak bullets, missing sections, infers skills',
  })
  enhanceResume(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.resumesService.enhanceResume(user.sub, id);
  }

  @Post('tailor/:jobId')
  @ApiOperation({
    summary: 'Tailor resume to a specific job — reorders content, highlights relevant skills',
  })
  tailorResumeForJob(
    @CurrentUser() user: JwtPayload,
    @Param('jobId') jobId: string,
    @Body() body: { baseResumeId?: string },
  ) {
    return this.resumesService.tailorResumeForJob(user.sub, jobId, body.baseResumeId);
  }
}
