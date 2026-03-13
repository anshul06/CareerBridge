import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SkillsService } from '../skills/skills.service';
import { AiService } from '../ai/ai.service';
import { FilesService } from '../files/files.service';
import { UpdateStudentProfileDto } from './dto/update-profile.dto';
import { CreateAchievementDto, UpdateAchievementDto } from './dto/achievement.dto';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { CreateCertificationDto, UpdateCertificationDto } from './dto/certification.dto';
import { PaginationDto, paginate } from '../../shared/dto/pagination.dto';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger('StudentsService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly skillsService: SkillsService,
    private readonly aiService: AiService,
    private readonly filesService: FilesService,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, isVerified: true, lastLoginAt: true } },
        achievements: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
        projects: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
        certifications: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
        studentSkills: {
          include: { skill: true },
          orderBy: [{ confidence: 'asc' }],
        },
        resumes: {
          where: { deletedAt: null, status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!profile) throw new NotFoundException('Student profile not found');
    return profile;
  }

  async getProfileById(profileId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { id: profileId },
      include: {
        user: { select: { email: true } },
        achievements: { where: { deletedAt: null } },
        projects: { where: { deletedAt: null } },
        certifications: { where: { deletedAt: null } },
        studentSkills: { include: { skill: true } },
        resumes: { where: { deletedAt: null, status: 'ACTIVE', isMaster: true } },
      },
    });
    if (!profile) throw new NotFoundException('Student profile not found');
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateStudentProfileDto) {
    const profile = await this.prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Student profile not found');

    const updated = await this.prisma.studentProfile.update({
      where: { userId },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        profileCompleteness: this.computeProfileCompleteness({ ...profile, ...dto }),
      },
    });

    return updated;
  }

  // ─── Achievements ───────────────────────────────

  async createAchievement(userId: string, dto: CreateAchievementDto) {
    const profile = await this.ensureProfile(userId);
    const achievement = await this.prisma.achievement.create({
      data: {
        studentProfileId: profile.id,
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });

    // Async skill extraction from achievement description
    if (dto.description) {
      this.skillsService
        .extractAndUpsertStudentSkills(
          profile.id,
          `${dto.title}. ${dto.description}`,
          `achievement:${achievement.id}`,
          `Achievement: ${dto.type}`,
        )
        .catch((err) => this.logger.warn('Skill extraction failed:', err.message));
    }

    return achievement;
  }

  async updateAchievement(userId: string, achievementId: string, dto: UpdateAchievementDto) {
    const profile = await this.ensureProfile(userId);
    await this.ensureAchievementOwnership(achievementId, profile.id);

    return this.prisma.achievement.update({
      where: { id: achievementId },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async deleteAchievement(userId: string, achievementId: string) {
    const profile = await this.ensureProfile(userId);
    await this.ensureAchievementOwnership(achievementId, profile.id);
    await this.prisma.achievement.update({
      where: { id: achievementId },
      data: { deletedAt: new Date() },
    });
    return { message: 'Achievement deleted' };
  }

  // ─── Projects ───────────────────────────────

  async createProject(userId: string, dto: CreateProjectDto) {
    const profile = await this.ensureProfile(userId);
    const project = await this.prisma.project.create({
      data: {
        studentProfileId: profile.id,
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });

    // Extract skills from project description + tech stack
    const extractionText = [
      dto.title,
      dto.description,
      dto.techStack?.join(', '),
      dto.highlights?.join('. '),
    ]
      .filter(Boolean)
      .join('\n');

    this.skillsService
      .extractAndUpsertStudentSkills(
        profile.id,
        extractionText,
        `project:${project.id}`,
        `Project: ${dto.title}`,
      )
      .catch((err) => this.logger.warn('Skill extraction failed:', err.message));

    return project;
  }

  async updateProject(userId: string, projectId: string, dto: UpdateProjectDto) {
    const profile = await this.ensureProfile(userId);
    await this.ensureProjectOwnership(projectId, profile.id);
    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async deleteProject(userId: string, projectId: string) {
    const profile = await this.ensureProfile(userId);
    await this.ensureProjectOwnership(projectId, profile.id);
    await this.prisma.project.update({ where: { id: projectId }, data: { deletedAt: new Date() } });
    return { message: 'Project deleted' };
  }

  // ─── Certifications ───────────────────────────────

  async createCertification(userId: string, dto: CreateCertificationDto, file?: Express.Multer.File) {
    const profile = await this.ensureProfile(userId);

    let fileId: string | undefined;
    if (file) {
      const savedFile = await this.filesService.saveFile(file, 'CERTIFICATE', userId);
      fileId = savedFile.id;
    }

    // Extract inferred skills from certification name
    const extractionText = `${dto.name} - ${dto.issuingOrganization}. ${dto.description || ''}`;
    const extractedSkills = await this.aiService.extractSkillsFromText(
      extractionText,
      `Certification: ${dto.name}`,
    );
    const inferredSkillNames = extractedSkills.map((s) => s.name);

    const certification = await this.prisma.certification.create({
      data: {
        studentProfileId: profile.id,
        ...dto,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        inferredSkills: inferredSkillNames,
        fileId,
      },
    });

    // Upsert skills
    this.skillsService
      .extractAndUpsertStudentSkills(
        profile.id,
        extractionText,
        `certification:${certification.id}`,
        `Certification: ${dto.name}`,
      )
      .catch((err) => this.logger.warn('Skill extraction failed:', err.message));

    return certification;
  }

  async updateCertification(userId: string, certId: string, dto: UpdateCertificationDto) {
    const profile = await this.ensureProfile(userId);
    await this.ensureCertOwnership(certId, profile.id);
    return this.prisma.certification.update({
      where: { id: certId },
      data: {
        ...dto,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      },
    });
  }

  async deleteCertification(userId: string, certId: string) {
    const profile = await this.ensureProfile(userId);
    await this.ensureCertOwnership(certId, profile.id);
    await this.prisma.certification.update({ where: { id: certId }, data: { deletedAt: new Date() } });
    return { message: 'Certification deleted' };
  }

  // ─── Applications ───────────────────────────────

  async getMyApplications(userId: string, pagination: PaginationDto) {
    const profile = await this.ensureProfile(userId);
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.application.findMany({
        where: { studentProfileId: profile.id },
        include: {
          job: {
            include: { company: { select: { name: true, logoUrl: true } } },
          },
          shortlist: true,
        },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.application.count({ where: { studentProfileId: profile.id } }),
    ]);

    return paginate(items, total, page, limit);
  }

  async applyToJob(userId: string, jobId: string, resumeId?: string) {
    const profile = await this.ensureProfile(userId);

    const job = await this.prisma.job.findUnique({
      where: { id: jobId, deletedAt: null, status: 'OPEN' },
      include: { jobSkills: { include: { skill: true } } },
    });
    if (!job) throw new NotFoundException('Job not found or not open');

    const existing = await this.prisma.application.findUnique({
      where: { studentProfileId_jobId: { studentProfileId: profile.id, jobId } },
    });
    if (existing) throw new ForbiddenException('Already applied to this job');

    return this.prisma.application.create({
      data: {
        studentProfileId: profile.id,
        jobId,
        resumeId,
      },
      include: { job: { include: { company: { select: { name: true } } } } },
    });
  }

  async getJobMatchForStudent(userId: string, jobId: string) {
    const profile = await this.ensureProfile(userId);
    const match = await this.prisma.matchResult.findUnique({
      where: { studentProfileId_jobId: { studentProfileId: profile.id, jobId } },
      include: { job: { select: { title: true, company: { select: { name: true } } } } },
    });
    if (!match) return { message: 'Match not yet computed. Please check back later.' };
    return match;
  }

  // ─── Helpers ───────────────────────────────

  async ensureProfile(userId: string) {
    const profile = await this.prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Student profile not found');
    return profile;
  }

  private async ensureAchievementOwnership(achievementId: string, profileId: string) {
    const item = await this.prisma.achievement.findUnique({ where: { id: achievementId } });
    if (!item || item.studentProfileId !== profileId) {
      throw new ForbiddenException('Not your achievement');
    }
    if (item.deletedAt) throw new NotFoundException('Achievement not found');
  }

  private async ensureProjectOwnership(projectId: string, profileId: string) {
    const item = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!item || item.studentProfileId !== profileId) throw new ForbiddenException('Not your project');
  }

  private async ensureCertOwnership(certId: string, profileId: string) {
    const item = await this.prisma.certification.findUnique({ where: { id: certId } });
    if (!item || item.studentProfileId !== profileId) throw new ForbiddenException('Not your certification');
  }

  private computeProfileCompleteness(profile: any): number {
    const fields = [
      'firstName', 'lastName', 'phone', 'department', 'cgpa', 'usn',
      'yearOfAdmission', 'expectedGraduationYear', 'tenthPercentage',
      'linkedinUrl', 'githubUrl',
    ];
    const filled = fields.filter((f) => profile[f] != null && profile[f] !== '').length;
    return Math.round((filled / fields.length) * 100);
  }
}
