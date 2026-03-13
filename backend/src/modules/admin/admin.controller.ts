import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { Roles } from '../../shared/decorators/roles.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Analytics ───────────────────────────────

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Platform-wide analytics overview' })
  getAnalyticsOverview() {
    return this.adminService.getAnalyticsOverview();
  }

  @Get('analytics/departments')
  @ApiOperation({ summary: 'Department-wise student statistics' })
  getDepartmentStats() {
    return this.adminService.getDepartmentStats();
  }

  @Get('analytics/placements')
  @ApiOperation({ summary: 'Placement statistics and rate' })
  getPlacementStats() {
    return this.adminService.getPlacementStats();
  }

  // ─── Students ───────────────────────────────

  @Get('students')
  @ApiOperation({ summary: 'List all students with filters' })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'minCgpa', required: false, type: Number })
  @ApiQuery({ name: 'maxCgpa', required: false, type: Number })
  @ApiQuery({ name: 'graduationYear', required: false, type: Number })
  getAllStudents(
    @Query() pagination: PaginationDto,
    @Query('department') department?: string,
    @Query('minCgpa') minCgpa?: number,
    @Query('maxCgpa') maxCgpa?: number,
    @Query('graduationYear') graduationYear?: number,
  ) {
    return this.adminService.getAllStudents({ ...pagination, department, minCgpa, maxCgpa, graduationYear });
  }

  @Get('students/:id')
  @ApiOperation({ summary: 'Get detailed student profile (admin view)' })
  getStudentDetail(@Param('id') id: string) {
    return this.adminService.getStudentDetail(id);
  }

  @Patch('students/:userId/status')
  @ApiOperation({ summary: 'Activate or deactivate a student account' })
  updateStudentStatus(
    @Param('userId') userId: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.adminService.updateStudentStatus(userId, body.isActive);
  }

  // ─── Jobs ───────────────────────────────

  @Get('jobs')
  @ApiOperation({ summary: 'List all jobs (all statuses)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'companyId', required: false })
  getAllJobs(
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.adminService.getAllJobs({ ...pagination, status, companyId });
  }

  // ─── Companies ───────────────────────────────

  @Get('companies')
  @ApiOperation({ summary: 'List all companies' })
  getAllCompanies(@Query() pagination: PaginationDto) {
    return this.adminService.getAllCompanies(pagination);
  }

  // ─── Matching ───────────────────────────────

  @Post('jobs/:id/run-matching')
  @ApiOperation({ summary: 'Trigger matching engine for a job against all students' })
  runMatchingForJob(
    @Param('id') id: string,
    @Body() body: { includeSemantics?: boolean },
  ) {
    return this.adminService.runMatchingForJob(id, body.includeSemantics ?? false);
  }

  @Get('jobs/:id/match-results')
  @ApiOperation({ summary: 'Get paginated match results for a job' })
  getJobMatchResults(@Param('id') id: string, @Query() pagination: PaginationDto) {
    return this.adminService.getJobMatchResults(id, pagination);
  }

  @Post('jobs/:id/shortlist/generate')
  @ApiOperation({ summary: 'Generate shortlist for a job from match results' })
  generateShortlist(
    @Param('id') id: string,
    @Body() body: { minMatchPercentage?: number; maxCandidates?: number; onlyEligible?: boolean },
  ) {
    return this.adminService.generateShortlist(id, body);
  }
}
