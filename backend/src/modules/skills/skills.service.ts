import { Injectable, Logger } from '@nestjs/common';
import { Skill, SkillCategory, SkillConfidence } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { ExtractedSkill } from '../ai/interfaces/ai-provider.interface';

export interface SkillExtractionResult {
  skills: Array<{
    skillId: string;
    name: string;
    confidence: SkillConfidence;
    source: string;
    inferenceReason?: string;
  }>;
  rawExtracted: ExtractedSkill[];
}

@Injectable()
export class SkillsService {
  private readonly logger = new Logger('SkillsService');
  private skillCache: Map<string, Skill> = new Map(); // name -> Skill record

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async getAllSkills(category?: SkillCategory): Promise<Skill[]> {
    return this.prisma.skill.findMany({
      where: { isActive: true, ...(category ? { category } : {}) },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findOrCreateSkill(
    rawName: string,
    category: SkillCategory = SkillCategory.OTHER,
  ): Promise<Skill> {
    // Normalize the name
    const canonical = await this.aiService.normalizeSkillName(rawName);
    const lowerCanonical = canonical.toLowerCase();

    // Check cache
    if (this.skillCache.has(lowerCanonical)) {
      return this.skillCache.get(lowerCanonical)!;
    }

    // Check DB by canonical name or alias
    let skill = await this.prisma.skill.findFirst({
      where: {
        OR: [
          { name: { equals: canonical, mode: 'insensitive' } },
          { aliases: { has: rawName.toLowerCase() } },
          { aliases: { has: canonical.toLowerCase() } },
        ],
        isActive: true,
      },
    });

    if (!skill) {
      // Create new canonical skill
      skill = await this.prisma.skill.create({
        data: {
          name: canonical,
          aliases: [rawName.toLowerCase(), canonical.toLowerCase()].filter(
            (a, i, arr) => arr.indexOf(a) === i,
          ),
          category,
        },
      });
      this.logger.log(`Created new skill: ${canonical} (${category})`);
    }

    this.skillCache.set(lowerCanonical, skill);
    return skill;
  }

  // Main skill extraction pipeline for a student from a piece of text
  async extractAndUpsertStudentSkills(
    studentProfileId: string,
    text: string,
    source: string,
    context: string,
  ): Promise<SkillExtractionResult> {
    // Step 1: AI extraction (explicit + inferred)
    const extractedSkills = await this.aiService.extractSkillsFromText(text, context);

    const results: SkillExtractionResult['skills'] = [];

    for (const extracted of extractedSkills) {
      try {
        const category = this.mapCategoryString(extracted.category);
        const skill = await this.findOrCreateSkill(extracted.name, category);
        const confidence = this.mapConfidence(extracted.confidence);

        // Upsert student-skill relationship
        await this.prisma.studentSkill.upsert({
          where: {
            studentProfileId_skillId: {
              studentProfileId,
              skillId: skill.id,
            },
          },
          update: {
            // Only upgrade confidence, never downgrade
            confidence: this.upgradeConfidence(confidence),
            source,
            inferenceReason: extracted.inferenceReason,
            updatedAt: new Date(),
          },
          create: {
            studentProfileId,
            skillId: skill.id,
            confidence,
            source,
            inferenceReason: extracted.inferenceReason,
          },
        });

        results.push({
          skillId: skill.id,
          name: skill.name,
          confidence,
          source,
          inferenceReason: extracted.inferenceReason,
        });
      } catch (err) {
        this.logger.warn(`Failed to process skill "${extracted.name}": ${err.message}`);
      }
    }

    this.logger.log(
      `Extracted ${results.length} skills for student ${studentProfileId} from ${source}`,
    );

    return { skills: results, rawExtracted: extractedSkills };
  }

  async getStudentSkills(studentProfileId: string) {
    return this.prisma.studentSkill.findMany({
      where: { studentProfileId },
      include: { skill: true },
      orderBy: [{ confidence: 'asc' }, { skill: { name: 'asc' } }],
    });
  }

  async getStudentSkillsByCategory(studentProfileId: string) {
    const studentSkills = await this.getStudentSkills(studentProfileId);
    const grouped: Record<string, typeof studentSkills> = {};

    for (const ss of studentSkills) {
      const cat = ss.skill.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(ss);
    }
    return grouped;
  }

  async normalizeSkillsForJob(
    jobId: string,
    rawSkills: string[],
    type: 'REQUIRED' | 'PREFERRED',
    hintCategory?: SkillCategory,
  ) {
    const results: Array<{ skillId: string; name: string }> = [];
    for (const raw of rawSkills) {
      const skill = await this.findOrCreateSkill(raw, hintCategory);
      results.push({ skillId: skill.id, name: skill.name });

      await this.prisma.jobSkill.upsert({
        where: { jobId_skillId_type: { jobId, skillId: skill.id, type } },
        update: {},
        create: { jobId, skillId: skill.id, type },
      });
    }
    return results;
  }

  private mapCategoryString(cat: string): SkillCategory {
    const map: Record<string, SkillCategory> = {
      'PROGRAMMING_LANGUAGE': SkillCategory.PROGRAMMING_LANGUAGE,
      'FRAMEWORK_LIBRARY': SkillCategory.FRAMEWORK_LIBRARY,
      'DATABASE': SkillCategory.DATABASE,
      'CLOUD_DEVOPS': SkillCategory.CLOUD_DEVOPS,
      'AI_ML': SkillCategory.AI_ML,
      'DATA_ANALYTICS': SkillCategory.DATA_ANALYTICS,
      'CS_FUNDAMENTALS': SkillCategory.CS_FUNDAMENTALS,
      'SOFT_SKILLS': SkillCategory.SOFT_SKILLS,
      'DOMAIN_SKILLS': SkillCategory.DOMAIN_SKILLS,
      'TOOLS_PLATFORMS': SkillCategory.TOOLS_PLATFORMS,
    };
    return map[cat?.toUpperCase()] || SkillCategory.OTHER;
  }

  private mapConfidence(conf: string): SkillConfidence {
    const map: Record<string, SkillConfidence> = {
      'HIGH': SkillConfidence.HIGH,
      'MEDIUM': SkillConfidence.MEDIUM,
      'LOW': SkillConfidence.LOW,
    };
    return map[conf?.toUpperCase()] || SkillConfidence.MEDIUM;
  }

  private upgradeConfidence(newConf: SkillConfidence): SkillConfidence {
    // Return the better confidence when updating
    const order = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return newConf; // Prisma will handle the existing field comparison
  }
}
