import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { SkillsService } from '../skills/skills.service';
import { FilesService } from '../files/files.service';
import { SkillCategory } from '@prisma/client';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { PaginationDto, paginate } from '../../shared/dto/pagination.dto';

@Injectable()
export class JobsService {
  private readonly logger = new Logger('JobsService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly skillsService: SkillsService,
    private readonly filesService: FilesService,
  ) {}

  async create(dto: CreateJobDto) {
    const { requiredSkills, preferredSkills, ...jobData } = dto;

    const job = await this.prisma.job.create({
      data: {
        ...jobData,
        applicationDeadline: dto.applicationDeadline ? new Date(dto.applicationDeadline) : undefined,
        driveDate: dto.driveDate ? new Date(dto.driveDate) : undefined,
      },
    });

    // Add skills
    if (requiredSkills?.length) {
      await this.skillsService.normalizeSkillsForJob(job.id, requiredSkills, 'REQUIRED');
    }
    if (preferredSkills?.length) {
      await this.skillsService.normalizeSkillsForJob(job.id, preferredSkills, 'PREFERRED');
    }

    return this.findOne(job.id);
  }

  async findAll(pagination: PaginationDto & {
    department?: string;
    jobType?: string;
    companyId?: string;
    minCgpa?: number;
    status?: string;
  }) {
    const { page = 1, limit = 20, search, department, jobType, companyId, status = 'OPEN' } = pagination;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;
    if (jobType) where.jobType = jobType;
    if (department) where.eligibleBranches = { has: department };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          company: { select: { id: true, name: true, logoUrl: true, industry: true } },
          jobSkills: {
            include: { skill: { select: { name: true, category: true } } },
          },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return paginate(items, total, page, limit);
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id, deletedAt: null },
      include: {
        company: true,
        jobSkills: {
          include: { skill: true },
          orderBy: [{ type: 'asc' }, { importance: 'desc' }],
        },
        _count: { select: { applications: true, matchResults: true } },
      },
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async update(id: string, dto: UpdateJobDto) {
    await this.findOne(id);
    const { requiredSkills, preferredSkills, ...jobData } = dto;

    const job = await this.prisma.job.update({
      where: { id },
      data: {
        ...jobData,
        applicationDeadline: dto.applicationDeadline ? new Date(dto.applicationDeadline) : undefined,
        driveDate: dto.driveDate ? new Date(dto.driveDate) : undefined,
      },
    });

    // Refresh skills if provided
    if (requiredSkills !== undefined) {
      await this.prisma.jobSkill.deleteMany({ where: { jobId: id, type: 'REQUIRED' } });
      if (requiredSkills.length) {
        await this.skillsService.normalizeSkillsForJob(id, requiredSkills, 'REQUIRED');
      }
    }
    if (preferredSkills !== undefined) {
      await this.prisma.jobSkill.deleteMany({ where: { jobId: id, type: 'PREFERRED' } });
      if (preferredSkills.length) {
        await this.skillsService.normalizeSkillsForJob(id, preferredSkills, 'PREFERRED');
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.job.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Job deleted' };
  }

  // ─── JD Upload + Parsing ───────────────────────────────

  async uploadAndParseJD(jobId: string, file: Express.Multer.File, uploadedBy: string) {
    const job = await this.findOne(jobId);

    // Save JD file
    const savedFile = await this.filesService.saveFile(file, 'JD_DOCUMENT', uploadedBy);

    // Extract raw text
    const rawText = await this.filesService.extractTextFromFile(savedFile.id);

    // AI parse the JD
    const parsed = await this.aiService.parseJobDescription(rawText);

    this.logger.log(`JD parsed for job ${jobId}: ${parsed.requiredSkills?.length || 0} required skills found`);

    // Update job with parsed data
    await this.prisma.job.update({
      where: { id: jobId },
      data: {
        rawJdText: rawText,
        jdFileId: savedFile.id,
        responsibilities: parsed.responsibilities || job.responsibilities,
        keywords: parsed.keywords || job.keywords,
        minCgpa: parsed.minCgpa ?? job.minCgpa,
        maxBacklogs: parsed.maxBacklogs ?? job.maxBacklogs,
        eligibleBranches: parsed.eligibleBranches?.length ? parsed.eligibleBranches : job.eligibleBranches,
        allowedGraduationYears: parsed.allowedGraduationYears?.length
          ? parsed.allowedGraduationYears
          : job.allowedGraduationYears,
        ctcMin: parsed.ctcMin ?? job.ctcMin,
        ctcMax: parsed.ctcMax ?? job.ctcMax,
        location: parsed.location ?? job.location,
      },
    });

    // Upsert parsed skills
    if (parsed.requiredSkills?.length) {
      await this.prisma.jobSkill.deleteMany({ where: { jobId, type: 'REQUIRED' } });
      await this.skillsService.normalizeSkillsForJob(jobId, parsed.requiredSkills, 'REQUIRED');
    }
    if (parsed.preferredSkills?.length) {
      await this.prisma.jobSkill.deleteMany({ where: { jobId, type: 'PREFERRED' } });
      await this.skillsService.normalizeSkillsForJob(jobId, parsed.preferredSkills, 'PREFERRED');
    }
    // Soft skills as required (with SOFT_SKILLS category hint)
    if (parsed.softSkills?.length) {
      await this.skillsService.normalizeSkillsForJob(
        jobId, parsed.softSkills, 'REQUIRED', SkillCategory.SOFT_SKILLS,
      );
    }

    return {
      message: 'JD uploaded and parsed successfully',
      parsedData: parsed,
      fileId: savedFile.id,
    };
  }

  async previewParseJD(rawText: string) {
    const parsed = await this.aiService.parseJobDescription(rawText);
    return { parsedData: parsed };
  }

  async parseJDFromText(jobId: string, rawText: string) {
    const job = await this.findOne(jobId);
    const parsed = await this.aiService.parseJobDescription(rawText);

    await this.prisma.job.update({
      where: { id: jobId },
      data: {
        rawJdText: rawText,
        responsibilities: parsed.responsibilities || job.responsibilities,
        keywords: parsed.keywords || job.keywords,
        minCgpa: parsed.minCgpa ?? job.minCgpa,
        maxBacklogs: parsed.maxBacklogs ?? job.maxBacklogs,
        eligibleBranches: parsed.eligibleBranches?.length ? parsed.eligibleBranches : job.eligibleBranches,
        allowedGraduationYears: parsed.allowedGraduationYears?.length
          ? parsed.allowedGraduationYears
          : job.allowedGraduationYears,
        ctcMin: parsed.ctcMin ?? job.ctcMin,
        ctcMax: parsed.ctcMax ?? job.ctcMax,
        location: parsed.location ?? job.location,
      },
    });

    if (parsed.requiredSkills?.length) {
      await this.prisma.jobSkill.deleteMany({ where: { jobId, type: 'REQUIRED' } });
      await this.skillsService.normalizeSkillsForJob(jobId, parsed.requiredSkills, 'REQUIRED');
    }
    if (parsed.preferredSkills?.length) {
      await this.prisma.jobSkill.deleteMany({ where: { jobId, type: 'PREFERRED' } });
      await this.skillsService.normalizeSkillsForJob(jobId, parsed.preferredSkills, 'PREFERRED');
    }
    if (parsed.softSkills?.length) {
      await this.skillsService.normalizeSkillsForJob(
        jobId, parsed.softSkills, 'REQUIRED', SkillCategory.SOFT_SKILLS,
      );
    }

    return { message: 'JD text parsed successfully', parsedData: parsed };
  }

  async getJobMatches(jobId: string, limit = 50) {
    await this.findOne(jobId);
    return this.prisma.matchResult.findMany({
      where: { jobId },
      include: {
        studentProfile: {
          select: {
            id: true, firstName: true, lastName: true,
            department: true, cgpa: true, expectedGraduationYear: true,
            user: { select: { email: true } },
          },
        },
      },
      orderBy: { overallMatchPercentage: 'desc' },
      take: limit,
    });
  }

  async getJobShortlist(jobId: string) {
    await this.findOne(jobId);
    return this.prisma.shortlist.findMany({
      where: { jobId },
      include: {
        application: {
          include: {
            studentProfile: {
              select: {
                id: true, firstName: true, lastName: true,
                department: true, cgpa: true,
                user: { select: { email: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
