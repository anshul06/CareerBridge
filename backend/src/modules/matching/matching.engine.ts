/**
 * DSU CareerBridge — Matching Engine
 *
 * A layered scoring algorithm with full explainability.
 * This module is purely functional with no DB/service dependencies.
 * All DB reads happen in MatchingService before calling this engine.
 */

import { EligibilityStatus, ShortlistStatus, SkillConfidence } from '@prisma/client';

// ─────────────────────────────────────────────
// INPUT TYPES
// ─────────────────────────────────────────────

export interface StudentMatchInput {
  profileId: string;
  firstName: string;
  lastName: string;
  department: string;
  cgpa: number | null;
  activeBacklogs: number;
  totalBacklogs: number;
  expectedGraduationYear: number | null;
  tenthPercentage: number | null;
  twelfthPercentage: number | null;

  // Normalized student skills: { skillName -> { confidence, source } }
  skills: Map<string, { confidence: SkillConfidence; source: string }>;

  // Soft skill names extracted from profile (category = SOFT_SKILLS)
  softSkillNames: string[];

  // Project descriptions (concatenated)
  projectText: string;
  // Certification names + descriptions
  certificationText: string;
  // Achievement descriptions
  achievementText: string;

  // Resume summary text (for semantic)
  resumeSummary?: string;

  // Counts
  certificationCount: number;
  internshipCount: number;
  hackathonCount: number;
  researchCount: number;
  projectCount: number;
}

export interface JobMatchInput {
  jobId: string;
  title: string;
  minCgpa: number | null;
  maxBacklogs: number | null;
  eligibleBranches: string[];
  allowedGraduationYears: number[];
  genderConstraint: string | null;

  // Normalized required/preferred technical skills: skill name -> importance (1-10)
  requiredSkills: Map<string, number>;
  preferredSkills: Map<string, number>;

  // Soft skills explicitly required by the JD
  softSkillsRequired: string[];

  // JD text for semantic and keyword matching
  rawJdText?: string;
}

// ─────────────────────────────────────────────
// OUTPUT TYPES
// ─────────────────────────────────────────────

export interface MatchedSkillInfo {
  skillName: string;
  confidence: SkillConfidence;
  matchType: 'explicit' | 'inferred';
  jobSkillType: 'required' | 'preferred';
  importance: number;
}

export interface EngineMatchResult {
  studentProfileId: string;
  jobId: string;

  eligibilityStatus: EligibilityStatus;
  eligibilityReasons: string[];

  overallMatchPercentage: number;
  requiredSkillCoverage: number;
  preferredSkillCoverage: number;
  semanticSimilarity: number;
  academicFit: number;
  projectRelevance: number;
  certificationRelevance: number;
  softSkillScore: number;

  matchedSkills: MatchedSkillInfo[];
  inferredMatchedSkills: MatchedSkillInfo[];
  missingSkills: string[];
  matchedSoftSkills: string[];

  recommendation: ShortlistStatus;
  reasonCodes: string[];
  reasonSummary: string;
}

// ─────────────────────────────────────────────
// WEIGHTS  (must sum to 1.0)
// ─────────────────────────────────────────────

const WEIGHTS = {
  requiredSkill:   0.35,  // Technical required skills — dominant factor
  preferredSkill:  0.12,  // Technical preferred skills
  academicFit:     0.14,  // CGPA, 10th, 12th
  semantic:        0.09,  // AI embedding similarity (async, optional)
  projectRelevance:0.13,  // Project + internship + hackathon relevance
  certification:   0.08,  // Certs, research papers
  softSkills:      0.09,  // Communication, leadership, teamwork etc.
};

const CONFIDENCE_MULTIPLIERS: Record<SkillConfidence, number> = {
  HIGH: 1.0,
  MEDIUM: 0.7,
  LOW: 0.4,
};

// Common soft skill keywords for achievement-based scoring
const LEADERSHIP_KEYWORDS = ['lead', 'president', 'captain', 'head', 'coordinator', 'organized', 'managed', 'mentor'];
const TEAMWORK_KEYWORDS    = ['team', 'collaborate', 'volunteer', 'community', 'club', 'society', 'group'];
const ACHIEVEMENT_KEYWORDS = ['won', 'winner', 'award', 'rank', 'prize', 'first', 'second', 'best', 'hackathon', 'champion'];
const COMMUNICATION_KEYWORDS = ['presented', 'presentation', 'paper', 'conference', 'workshop', 'seminar', 'spoke', 'authored'];

// ─────────────────────────────────────────────
// MATCHING ENGINE
// ─────────────────────────────────────────────

export class MatchingEngine {
  /**
   * Compute full match result for a student-job pair.
   * @param student - normalized student data
   * @param job - normalized job data
   * @param semanticSimilarityScore - precomputed from AI embeddings (0-100), or 0
   */
  static compute(
    student: StudentMatchInput,
    job: JobMatchInput,
    semanticSimilarityScore = 0,
  ): EngineMatchResult {
    // Stage 1: Hard eligibility check
    const { status: eligibilityStatus, reasons: eligibilityReasons } =
      this.computeEligibility(student, job);

    // Stage 2: Technical skill matching
    const {
      requiredSkillCoverage,
      preferredSkillCoverage,
      matchedSkills,
      inferredMatchedSkills,
      missingSkills,
    } = this.computeSkillMatch(student, job);

    // Stage 3: Academic fit
    const academicFit = this.computeAcademicFit(student);

    // Stage 4: Project + experience relevance (keyword overlap + activity bonuses)
    const projectRelevance = this.computeProjectRelevance(student, job);

    // Stage 5: Certification relevance
    const certificationRelevance = this.computeCertificationRelevance(student);

    // Stage 6: Soft skills (communication, leadership, teamwork)
    const { score: softSkillScore, matched: matchedSoftSkills } =
      this.computeSoftSkillScore(student, job);

    // Final weighted score
    let overallMatchPercentage =
      WEIGHTS.requiredSkill   * requiredSkillCoverage +
      WEIGHTS.preferredSkill  * preferredSkillCoverage +
      WEIGHTS.academicFit     * academicFit +
      WEIGHTS.semantic        * semanticSimilarityScore +
      WEIGHTS.projectRelevance* projectRelevance +
      WEIGHTS.certification   * certificationRelevance +
      WEIGHTS.softSkills      * softSkillScore;

    // Hard eligibility penalty
    if (eligibilityStatus === EligibilityStatus.INELIGIBLE) {
      overallMatchPercentage = Math.min(overallMatchPercentage, 30);
    } else if (eligibilityStatus === EligibilityStatus.PARTIALLY_ELIGIBLE) {
      overallMatchPercentage = Math.min(overallMatchPercentage, 65);
    }

    overallMatchPercentage = Math.round(Math.min(100, Math.max(0, overallMatchPercentage)));

    const { recommendation, reasonCodes, reasonSummary } = this.buildRecommendation({
      eligibilityStatus,
      overallMatchPercentage,
      requiredSkillCoverage,
      missingSkills,
      eligibilityReasons,
      softSkillScore,
      projectRelevance,
    });

    return {
      studentProfileId: student.profileId,
      jobId: job.jobId,
      eligibilityStatus,
      eligibilityReasons,
      overallMatchPercentage,
      requiredSkillCoverage:   Math.round(requiredSkillCoverage),
      preferredSkillCoverage:  Math.round(preferredSkillCoverage),
      semanticSimilarity:      Math.round(semanticSimilarityScore),
      academicFit:             Math.round(academicFit),
      projectRelevance:        Math.round(projectRelevance),
      certificationRelevance:  Math.round(certificationRelevance),
      softSkillScore:          Math.round(softSkillScore),
      matchedSkills,
      inferredMatchedSkills,
      missingSkills,
      matchedSoftSkills,
      recommendation,
      reasonCodes,
      reasonSummary,
    };
  }

  // ─── Stage 1: Hard Eligibility ───────────────────────────────

  private static computeEligibility(
    student: StudentMatchInput,
    job: JobMatchInput,
  ): { status: EligibilityStatus; reasons: string[] } {
    const reasons: string[] = [];
    let hardFail = false;
    let softFail = false;

    // CGPA check
    if (job.minCgpa !== null && student.cgpa !== null) {
      if (student.cgpa < job.minCgpa) {
        reasons.push(`CGPA_BELOW_CUTOFF: Student CGPA ${student.cgpa} < required ${job.minCgpa}`);
        hardFail = true;
      } else {
        reasons.push(`CGPA_OK: ${student.cgpa} >= ${job.minCgpa}`);
      }
    } else if (job.minCgpa !== null && student.cgpa === null) {
      reasons.push('CGPA_NOT_PROVIDED: CGPA required but not set in profile');
      softFail = true;
    }

    // Backlog check
    if (job.maxBacklogs !== null) {
      if (student.activeBacklogs > job.maxBacklogs) {
        reasons.push(
          `BACKLOG_EXCEEDED: Active backlogs ${student.activeBacklogs} > allowed ${job.maxBacklogs}`,
        );
        hardFail = true;
      } else {
        reasons.push(`BACKLOGS_OK: ${student.activeBacklogs} active backlogs within limit`);
      }
    }

    // Branch check
    if (job.eligibleBranches.length > 0) {
      const isEligibleBranch = job.eligibleBranches.some(
        (b) =>
          b.toLowerCase() === student.department.toLowerCase() ||
          student.department.toLowerCase().includes(b.toLowerCase()) ||
          b.toLowerCase().includes(student.department.toLowerCase().split(' ')[0]),
      );
      if (!isEligibleBranch) {
        reasons.push(
          `BRANCH_NOT_ELIGIBLE: ${student.department} not in ${job.eligibleBranches.join(', ')}`,
        );
        hardFail = true;
      } else {
        reasons.push(`BRANCH_OK: ${student.department} is eligible`);
      }
    }

    // Graduation year check
    if (job.allowedGraduationYears.length > 0 && student.expectedGraduationYear) {
      if (!job.allowedGraduationYears.includes(student.expectedGraduationYear)) {
        reasons.push(
          `GRAD_YEAR_MISMATCH: ${student.expectedGraduationYear} not in ${job.allowedGraduationYears.join(', ')}`,
        );
        hardFail = true;
      } else {
        reasons.push(`GRAD_YEAR_OK: ${student.expectedGraduationYear}`);
      }
    }

    if (hardFail) return { status: EligibilityStatus.INELIGIBLE, reasons };
    if (softFail) return { status: EligibilityStatus.PARTIALLY_ELIGIBLE, reasons };
    return { status: EligibilityStatus.ELIGIBLE, reasons };
  }

  // ─── Stage 2: Technical Skill Matching ───────────────────────────────

  private static computeSkillMatch(
    student: StudentMatchInput,
    job: JobMatchInput,
  ) {
    const matchedSkills: MatchedSkillInfo[] = [];
    const inferredMatchedSkills: MatchedSkillInfo[] = [];
    const missingSkills: string[] = [];

    let requiredWeightedScore = 0;
    let requiredTotalWeight = 0;
    let preferredWeightedScore = 0;
    let preferredTotalWeight = 0;

    // Match required skills
    for (const [skillName, importance] of job.requiredSkills) {
      requiredTotalWeight += importance;
      const studentSkill = this.findSkillMatch(student.skills, skillName);

      if (studentSkill) {
        const multiplier = CONFIDENCE_MULTIPLIERS[studentSkill.confidence];
        requiredWeightedScore += importance * multiplier;

        const info: MatchedSkillInfo = {
          skillName,
          confidence: studentSkill.confidence,
          matchType: studentSkill.confidence === 'HIGH' ? 'explicit' : 'inferred',
          jobSkillType: 'required',
          importance,
        };
        if (info.matchType === 'inferred') {
          inferredMatchedSkills.push(info);
        } else {
          matchedSkills.push(info);
        }
      } else {
        missingSkills.push(skillName);
      }
    }

    // Match preferred skills
    for (const [skillName, importance] of job.preferredSkills) {
      preferredTotalWeight += importance;
      const studentSkill = this.findSkillMatch(student.skills, skillName);

      if (studentSkill) {
        const multiplier = CONFIDENCE_MULTIPLIERS[studentSkill.confidence];
        preferredWeightedScore += importance * multiplier;

        matchedSkills.push({
          skillName,
          confidence: studentSkill.confidence,
          matchType: studentSkill.confidence === 'HIGH' ? 'explicit' : 'inferred',
          jobSkillType: 'preferred',
          importance,
        });
      }
    }

    const requiredSkillCoverage =
      requiredTotalWeight > 0
        ? (requiredWeightedScore / requiredTotalWeight) * 100
        : 100;

    const preferredSkillCoverage =
      preferredTotalWeight > 0
        ? (preferredWeightedScore / preferredTotalWeight) * 100
        : 0;

    return {
      requiredSkillCoverage,
      preferredSkillCoverage,
      matchedSkills,
      inferredMatchedSkills,
      missingSkills,
    };
  }

  // Fuzzy skill name matching (handles normalized aliases)
  private static findSkillMatch(
    studentSkills: Map<string, { confidence: SkillConfidence; source: string }>,
    jobSkillName: string,
  ) {
    const normalized = jobSkillName.toLowerCase().trim();

    // Exact match
    for (const [key, value] of studentSkills) {
      if (key.toLowerCase() === normalized) return value;
    }

    // Partial match (one contains the other)
    for (const [key, value] of studentSkills) {
      const keyLower = key.toLowerCase();
      if (keyLower.includes(normalized) || normalized.includes(keyLower)) {
        return value;
      }
    }

    return null;
  }

  // ─── Stage 3: Academic Fit ───────────────────────────────

  private static computeAcademicFit(student: StudentMatchInput): number {
    let score = 0;
    let factors = 0;

    if (student.cgpa !== null) {
      score += Math.min(100, (student.cgpa / 10) * 100);
      factors++;
    }

    if (student.tenthPercentage !== null) {
      score += Math.min(100, student.tenthPercentage);
      factors++;
    }

    if (student.twelfthPercentage !== null) {
      score += Math.min(100, student.twelfthPercentage);
      factors++;
    }

    return factors > 0 ? score / factors : 50;
  }

  // ─── Stage 4: Project + Experience Relevance ───────────────────────────────

  private static computeProjectRelevance(
    student: StudentMatchInput,
    job: JobMatchInput,
  ): number {
    // Build combined student activity text: projects + achievements + certifications
    const activityText = [student.projectText, student.achievementText, student.certificationText]
      .filter(Boolean)
      .join(' ');

    if (!activityText) return 0;

    const activityWords = new Set(activityText.toLowerCase().split(/\W+/).filter(w => w.length > 2));

    // Required skill keyword overlap with projects/achievements
    const requiredSkillWords = new Set<string>();
    for (const [skillName] of job.requiredSkills) {
      skillName.toLowerCase().split(/\W+/).forEach((w) => { if (w.length > 2) requiredSkillWords.add(w); });
    }

    // JD keyword overlap with project/achievement text
    const jdWords = job.rawJdText
      ? new Set(job.rawJdText.toLowerCase().split(/\W+/).filter(w => w.length > 3))
      : new Set<string>();

    // Skill word overlap
    let skillOverlap = 0;
    for (const word of requiredSkillWords) {
      if (activityWords.has(word)) skillOverlap++;
    }
    const skillScore = requiredSkillWords.size > 0
      ? (skillOverlap / requiredSkillWords.size) * 50
      : 0;

    // JD keyword overlap with activity text
    let jdOverlap = 0;
    let jdTotal = 0;
    for (const word of jdWords) {
      if (word.length > 4) { // only meaningful words
        jdTotal++;
        if (activityWords.has(word)) jdOverlap++;
      }
    }
    const jdScore = jdTotal > 0 ? (jdOverlap / jdTotal) * 30 : 0;

    // Activity bonuses
    let bonus = 0;
    if (student.projectCount >= 3) bonus += 10;
    else if (student.projectCount >= 1) bonus += 5;
    if (student.internshipCount > 0) bonus += 10;
    if (student.hackathonCount > 0) bonus += 5;
    if (student.researchCount > 0) bonus += 8;

    return Math.min(100, skillScore + jdScore + bonus);
  }

  // ─── Stage 5: Certification Relevance ───────────────────────────────

  private static computeCertificationRelevance(student: StudentMatchInput): number {
    if (student.certificationCount === 0) return 0;
    const baseScore = Math.min(60, student.certificationCount * 15);
    const researchBonus = Math.min(40, student.researchCount * 20);
    return Math.min(100, baseScore + researchBonus);
  }

  // ─── Stage 6: Soft Skills ───────────────────────────────

  private static computeSoftSkillScore(
    student: StudentMatchInput,
    job: JobMatchInput,
  ): { score: number; matched: string[] } {
    const matchedSoftSkills: string[] = [];
    let score = 0;

    // Part A: Match student's soft skills against job's required soft skills
    if (job.softSkillsRequired.length > 0) {
      const studentSoftLower = student.softSkillNames.map(s => s.toLowerCase());
      let matched = 0;
      for (const required of job.softSkillsRequired) {
        const reqLower = required.toLowerCase();
        const found = studentSoftLower.find(s => s.includes(reqLower) || reqLower.includes(s));
        if (found) {
          matched++;
          matchedSoftSkills.push(required);
        }
      }
      score += (matched / job.softSkillsRequired.length) * 60;
    }

    // Part B: Achievement-based soft skill indicators (universal bonuses)
    const achLower = (student.achievementText + ' ' + student.projectText).toLowerCase();

    let activityBonus = 0;
    if (LEADERSHIP_KEYWORDS.some(kw => achLower.includes(kw))) {
      activityBonus += 12;
      if (!matchedSoftSkills.includes('Leadership')) matchedSoftSkills.push('Leadership');
    }
    if (TEAMWORK_KEYWORDS.some(kw => achLower.includes(kw))) {
      activityBonus += 10;
      if (!matchedSoftSkills.includes('Teamwork')) matchedSoftSkills.push('Teamwork');
    }
    if (ACHIEVEMENT_KEYWORDS.some(kw => achLower.includes(kw))) {
      activityBonus += 8;
      if (!matchedSoftSkills.includes('Competitive Mindset')) matchedSoftSkills.push('Competitive Mindset');
    }
    if (COMMUNICATION_KEYWORDS.some(kw => achLower.includes(kw))) {
      activityBonus += 10;
      if (!matchedSoftSkills.includes('Communication')) matchedSoftSkills.push('Communication');
    }
    if (student.internshipCount > 0) {
      activityBonus += 8; // Work experience implies professionalism
    }

    score += Math.min(40, activityBonus);

    // If no soft skills were required by the job, base score on achievements only
    if (job.softSkillsRequired.length === 0) {
      score = Math.min(60, activityBonus);
    }

    return { score: Math.min(100, score), matched: matchedSoftSkills };
  }

  // ─── Recommendation Builder ───────────────────────────────

  private static buildRecommendation(params: {
    eligibilityStatus: EligibilityStatus;
    overallMatchPercentage: number;
    requiredSkillCoverage: number;
    missingSkills: string[];
    eligibilityReasons: string[];
    softSkillScore: number;
    projectRelevance: number;
  }) {
    const reasonCodes: string[] = [];
    const { eligibilityStatus, overallMatchPercentage, requiredSkillCoverage, missingSkills, softSkillScore, projectRelevance } = params;

    if (eligibilityStatus === EligibilityStatus.INELIGIBLE) {
      reasonCodes.push('HARD_ELIGIBILITY_FAILED');
    }

    if (requiredSkillCoverage >= 80) {
      reasonCodes.push('HIGH_REQUIRED_SKILL_COVERAGE');
    } else if (requiredSkillCoverage >= 50) {
      reasonCodes.push('MODERATE_REQUIRED_SKILL_COVERAGE');
    } else {
      reasonCodes.push('LOW_REQUIRED_SKILL_COVERAGE');
    }

    if (softSkillScore >= 70) reasonCodes.push('STRONG_SOFT_SKILLS');
    if (projectRelevance >= 60) reasonCodes.push('RELEVANT_PROJECTS');

    if (missingSkills.length > 0) {
      reasonCodes.push(`MISSING_SKILLS_${missingSkills.length}`);
    }

    let recommendation: ShortlistStatus;
    if (eligibilityStatus === EligibilityStatus.INELIGIBLE) {
      recommendation = ShortlistStatus.NOT_RECOMMENDED;
      reasonCodes.push('INELIGIBLE_DISQUALIFIED');
    } else if (overallMatchPercentage >= 75 && requiredSkillCoverage >= 70) {
      recommendation = ShortlistStatus.HIGHLY_RECOMMENDED;
    } else if (overallMatchPercentage >= 55 && requiredSkillCoverage >= 50) {
      recommendation = ShortlistStatus.RECOMMENDED;
    } else if (overallMatchPercentage >= 35) {
      recommendation = ShortlistStatus.BORDERLINE;
    } else {
      recommendation = ShortlistStatus.NOT_RECOMMENDED;
    }

    const reasonSummary = this.buildSummary(
      eligibilityStatus,
      overallMatchPercentage,
      requiredSkillCoverage,
      missingSkills,
      recommendation,
      softSkillScore,
    );

    return { recommendation, reasonCodes, reasonSummary };
  }

  private static buildSummary(
    eligibility: EligibilityStatus,
    overall: number,
    requiredCoverage: number,
    missing: string[],
    recommendation: ShortlistStatus,
    softSkillScore: number,
  ): string {
    const parts: string[] = [];

    if (eligibility === EligibilityStatus.INELIGIBLE) {
      parts.push('Student does not meet hard eligibility criteria.');
    } else if (eligibility === EligibilityStatus.PARTIALLY_ELIGIBLE) {
      parts.push('Student partially meets eligibility criteria.');
    } else {
      parts.push('Student meets all eligibility requirements.');
    }

    parts.push(`Overall match: ${overall}%. Required skill coverage: ${Math.round(requiredCoverage)}%.`);

    if (softSkillScore >= 60) {
      parts.push(`Strong soft skills profile (score: ${Math.round(softSkillScore)}%).`);
    }

    if (missing.length > 0) {
      parts.push(
        `Missing critical skills: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ` and ${missing.length - 5} more` : ''}.`,
      );
    }

    parts.push(`Recommendation: ${recommendation.replace(/_/g, ' ')}.`);

    return parts.join(' ');
  }
}
