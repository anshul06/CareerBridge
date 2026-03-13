import {
  Controller, Post, Get, Param, Body, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { MatchingService } from './matching.service';
import { Roles } from '../../shared/decorators/roles.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@ApiTags('Matching')
@ApiBearerAuth()
@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Roles(Role.ADMIN, Role.RECRUITER)
  @Post('jobs/:jobId/run')
  @ApiOperation({
    summary: 'Run matching engine for ALL students against a job',
    description: 'Computes match scores for all students. Can be slow for large datasets. Returns sorted results.',
  })
  runMatchingForJob(
    @Param('jobId') jobId: string,
    @Body() body: { includeSemantics?: boolean },
  ) {
    return this.matchingService.runMatchingForJob(jobId, {
      includeSemantics: body.includeSemantics ?? false,
    });
  }

  @Roles(Role.ADMIN, Role.RECRUITER)
  @Post('jobs/:jobId/students/:studentProfileId')
  @ApiOperation({ summary: 'Compute match for a specific student-job pair' })
  computeSingleMatch(
    @Param('jobId') jobId: string,
    @Param('studentProfileId') studentProfileId: string,
    @Body() body: { includeSemantics?: boolean },
  ) {
    return this.matchingService.computeMatch(studentProfileId, jobId, {
      includeSemantics: body.includeSemantics ?? false,
    });
  }

  @Roles(Role.ADMIN, Role.RECRUITER)
  @Post('jobs/:jobId/shortlist/generate')
  @ApiOperation({ summary: 'Generate shortlist from match results for applied students' })
  generateShortlist(
    @Param('jobId') jobId: string,
    @Body() body: {
      minMatchPercentage?: number;
      maxCandidates?: number;
      onlyEligible?: boolean;
    },
  ) {
    return this.matchingService.generateShortlist(jobId, body);
  }

  @Roles(Role.ADMIN, Role.RECRUITER)
  @Get('jobs/:jobId/results')
  @ApiOperation({ summary: 'Get paginated match results for a job' })
  @ApiQuery({ name: 'recommendation', required: false })
  @ApiQuery({ name: 'eligibilityStatus', required: false })
  @ApiQuery({ name: 'minScore', required: false, type: Number })
  getMatchResults(
    @Param('jobId') jobId: string,
    @Query() pagination: PaginationDto,
    @Query('recommendation') recommendation?: string,
    @Query('eligibilityStatus') eligibilityStatus?: string,
    @Query('minScore') minScore?: number,
  ) {
    return this.matchingService.getMatchResults(jobId, {
      ...pagination,
      recommendation,
      eligibilityStatus,
      minScore,
    });
  }
}
