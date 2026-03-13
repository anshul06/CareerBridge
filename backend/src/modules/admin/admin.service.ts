import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MatchingService } from '../matching/matching.service';
import { PaginationDto, paginate } from '../../shared/dto/pagination.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger('AdminService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly matchingService: MatchingService,
  ) {}

  async getAnalyticsOverview() {
    const [
      totalStudents,
      totalJobs,
      totalCompanies,
      totalApplications,
      totalMatches,
      shortlistCounts,
      applicationsByStatus,
    ] = await Promise.all([
      this.prisma.studentProfile.count(),
      this.prisma.job.count({ where: { deletedAt: null } }),
      this.prisma.company.count({ where: { deletedAt: null } }),
      this.prisma.application.count(),
      this.prisma.matchResult.count(),
      this.prisma.shortlist.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.application.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    const openJobs = await this.prisma.job.count({ where: { status: 'OPEN', deletedAt: null } });
    const recentApplications = await this.prisma.application.count({
      where: { appliedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    });

    return {
      overview: {
        totalStudents,
        totalJobs,
        openJobs,
        totalCompanies,
        totalApplications,
        recentApplications,
        totalMatches,
      },
      shortlistBreakdown: shortlistCounts.reduce(
        (acc, item) => ({ ...acc, [item.status]: item._count }),
        {},
      ),
      applicationStatusBreakdown: applicationsByStatus.reduce(
        (acc, item) => ({ ...acc, [item.status]: item._count }),
        {},
      ),
    };
  }

  async getAllStudents(
    pagination: PaginationDto & {
      department?: string;
      minCgpa?: number;
      maxCgpa?: number;
      graduationYear?: number;
    },
  ) {
    const { page = 1, limit = 20, search, department, minCgpa, maxCgpa, graduationYear } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (department) where.department = { contains: department, mode: 'insensitive' };
    if (minCgpa) where.cgpa = { gte: minCgpa };
    if (maxCgpa) where.cgpa = { ...where.cgpa, lte: maxCgpa };
    if (graduationYear) where.expectedGraduationYear = graduationYear;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { usn: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.studentProfile.findMany({
        where,
        include: {
          user: { select: { email: true, isActive: true } },
          _count: {
            select: {
              achievements: true,
              projects: true,
              certifications: true,
              applications: true,
              studentSkills: true,
            },
          },
        },
        orderBy: [{ cgpa: 'desc' }, { firstName: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.studentProfile.count({ where }),
    ]);

    return paginate(items, total, page, limit);
  }

  async getStudentDetail(studentProfileId: string) {
    return this.prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: {
        user: { select: { email: true, isActive: true, createdAt: true } },
        achievements: { where: { deletedAt: null } },
        projects: { where: { deletedAt: null } },
        certifications: { where: { deletedAt: null } },
        studentSkills: {
          include: { skill: true },
          orderBy: { confidence: 'asc' },
        },
        resumes: { where: { deletedAt: null, status: 'ACTIVE' } },
        applications: {
          include: { job: { include: { company: { select: { name: true } } } } },
          orderBy: { appliedAt: 'desc' },
        },
        matchResults: {
          include: { job: { select: { title: true } } },
          orderBy: { overallMatchPercentage: 'desc' },
          take: 10,
        },
      },
    });
  }

  async getAllJobs(pagination: PaginationDto & { status?: string; companyId?: string }) {
    const { page = 1, limit = 20, search, status, companyId } = pagination;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          company: { select: { name: true, industry: true } },
          _count: { select: { applications: true, matchResults: true, shortlists: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return paginate(items, total, page, limit);
  }

  async getAllCompanies(pagination: PaginationDto) {
    const { page = 1, limit = 20, search } = pagination;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        include: { _count: { select: { jobs: true } } },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.company.count({ where }),
    ]);

    return paginate(items, total, page, limit);
  }

  async runMatchingForJob(jobId: string, includeSemantics = false) {
    this.logger.log(`Admin triggered matching for job ${jobId}`);
    return this.matchingService.runMatchingForJob(jobId, { includeSemantics });
  }

  async getJobMatchResults(jobId: string, pagination: PaginationDto) {
    return this.matchingService.getMatchResults(jobId, pagination);
  }

  async generateShortlist(jobId: string, options: any) {
    return this.matchingService.generateShortlist(jobId, options);
  }

  async updateStudentStatus(userId: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
  }

  async getDepartmentStats() {
    const stats = await this.prisma.studentProfile.groupBy({
      by: ['department'],
      _count: true,
      _avg: { cgpa: true },
    });
    return stats.map((s) => ({
      department: s.department,
      studentCount: s._count,
      avgCgpa: s._avg.cgpa ? Math.round(s._avg.cgpa * 100) / 100 : null,
    }));
  }

  async getPlacementStats() {
    const selected = await this.prisma.application.count({
      where: { status: 'SELECTED' },
    });
    const totalStudents = await this.prisma.studentProfile.count();
    const studentsPlaced = await this.prisma.application.groupBy({
      by: ['studentProfileId'],
      where: { status: 'SELECTED' },
    });

    return {
      totalStudents,
      studentsPlaced: studentsPlaced.length,
      placementRate: totalStudents > 0
        ? Math.round((studentsPlaced.length / totalStudents) * 100)
        : 0,
      totalOffers: selected,
    };
  }
}
