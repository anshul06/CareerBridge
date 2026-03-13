import {
  Controller, Get, Post, Put, Delete, Body, Param,
  Query, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiQuery,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@ApiTags('Jobs')
@ApiBearerAuth()
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Roles(Role.ADMIN, Role.RECRUITER)
  @Post()
  @ApiOperation({ summary: 'Create a new job posting' })
  create(@Body() dto: CreateJobDto) {
    return this.jobsService.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all open jobs with skill details' })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'jobType', required: false })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['OPEN', 'CLOSED', 'DRAFT'] })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('department') department?: string,
    @Query('jobType') jobType?: string,
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
  ) {
    return this.jobsService.findAll({ ...pagination, department, jobType, companyId, status });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get job details with required/preferred skills' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.RECRUITER)
  @Put(':id')
  @ApiOperation({ summary: 'Update job posting' })
  update(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobsService.update(id, dto);
  }

  @Roles(Role.ADMIN, Role.RECRUITER)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete job (soft delete)' })
  remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }

  // ─── JD Parsing ───────────────────────────────

  @Roles(Role.ADMIN, Role.RECRUITER)
  @Post('parse-jd/preview')
  @ApiOperation({ summary: 'Preview parse a JD text (no job ID needed) — returns extracted fields without saving' })
  previewParseJD(@Body() body: { rawText: string }) {
    return this.jobsService.previewParseJD(body.rawText);
  }

  @Roles(Role.ADMIN, Role.RECRUITER)
  @Post(':id/parse-jd/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload JD PDF/DOCX — auto-parses and extracts skills' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'JD file (PDF or DOCX)' })
  uploadAndParseJD(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.jobsService.uploadAndParseJD(id, file, user.sub);
  }

  @Roles(Role.ADMIN, Role.RECRUITER)
  @Post(':id/parse-jd/text')
  @ApiOperation({ summary: 'Submit JD as raw text — auto-parses and extracts skills' })
  parseJDFromText(
    @Param('id') id: string,
    @Body() body: { rawText: string },
  ) {
    return this.jobsService.parseJDFromText(id, body.rawText);
  }

  // ─── Match Results & Shortlist ───────────────────────────────

  @Roles(Role.ADMIN, Role.RECRUITER)
  @Get(':id/matches')
  @ApiOperation({ summary: 'Get ranked match results for this job (sorted by match %)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getJobMatches(@Param('id') id: string, @Query('limit') limit?: number) {
    return this.jobsService.getJobMatches(id, limit);
  }

  @Roles(Role.ADMIN, Role.RECRUITER)
  @Get(':id/shortlist')
  @ApiOperation({ summary: 'Get shortlisted candidates for this job' })
  getJobShortlist(@Param('id') id: string) {
    return this.jobsService.getJobShortlist(id);
  }
}
