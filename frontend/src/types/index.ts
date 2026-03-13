// ─────────────────────────────────────────────
// AUTH & USERS
// ─────────────────────────────────────────────

export type Role = 'STUDENT' | 'ADMIN' | 'RECRUITER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

// ─────────────────────────────────────────────
// STUDENT PROFILE
// ─────────────────────────────────────────────

export interface StudentProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  usn?: string;
  rollNo?: string;
  department: string;
  semester?: number;
  yearOfAdmission?: number;
  expectedGraduationYear?: number;
  cgpa?: number;
  activeBacklogs: number;
  totalBacklogs: number;
  tenthPercentage?: number;
  tenthBoard?: string;
  twelfthPercentage?: number;
  twelfthBoard?: string;
  diplomaPercentage?: number;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  profileCompleteness: number;
  studentSkills?: StudentSkill[];
  achievements?: Achievement[];
  projects?: Project[];
  certifications?: Certification[];
  resumes?: Resume[];
  createdAt: string;
}

// ─────────────────────────────────────────────
// SKILLS
// ─────────────────────────────────────────────

export type SkillCategory =
  | 'PROGRAMMING_LANGUAGE'
  | 'FRAMEWORK_LIBRARY'
  | 'DATABASE'
  | 'CLOUD_DEVOPS'
  | 'AI_ML'
  | 'DATA_ANALYTICS'
  | 'CS_FUNDAMENTALS'
  | 'SOFT_SKILLS'
  | 'DOMAIN_SKILLS'
  | 'TOOLS_PLATFORMS'
  | 'OTHER';

export type SkillConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Skill {
  id: string;
  name: string;
  aliases: string[];
  category: SkillCategory;
  description?: string;
}

export interface StudentSkill {
  id: string;
  skillId: string;
  skill: Skill;
  confidence: SkillConfidence;
  source?: string;
  inferenceReason?: string;
  yearsExperience?: number;
}

// ─────────────────────────────────────────────
// ACHIEVEMENTS / PROJECTS / CERTS
// ─────────────────────────────────────────────

export type AchievementType =
  | 'HACKATHON'
  | 'INTERNSHIP'
  | 'PROJECT'
  | 'RESEARCH_PAPER'
  | 'CERTIFICATION'
  | 'CLUB_LEADERSHIP'
  | 'AWARD'
  | 'WORKSHOP'
  | 'TECHNICAL_EVENT'
  | 'VOLUNTEERING'
  | 'OTHER';

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description?: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
  isOngoing?: boolean;
  position?: string;
  url?: string;
  fileId?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  repoUrl?: string;
  liveUrl?: string;
  startDate?: string;
  endDate?: string;
  isOngoing?: boolean;
  highlights: string[];
  createdAt: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  inferredSkills: string[];
  fileId?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// RESUMES
// ─────────────────────────────────────────────

export type ResumeType = 'UPLOADED' | 'GENERATED' | 'ENHANCED' | 'TAILORED';
export type ResumeStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface ResumeSection {
  id: string;
  sectionType: string;
  title: string;
  content: any;
  order: number;
}

export interface Resume {
  id: string;
  type: ResumeType;
  status: ResumeStatus;
  title: string;
  version: number;
  isMaster: boolean;
  targetJobId?: string;
  structuredContent?: any;
  htmlContent?: string;
  extractedText?: string;
  enhancementNotes?: any;
  extractedSkills?: any;
  fileId?: string;
  sections?: ResumeSection[];
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// COMPANIES & JOBS
// ─────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  description?: string;
  logoUrl?: string;
  location?: string;
  size?: string;
  hrEmail?: string;
  isVerified: boolean;
  jobs?: Job[];
  createdAt: string;
}

export type JobType = 'FULL_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'PART_TIME';
export type JobStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'CANCELLED';

export interface JobSkill {
  id: string;
  skillId: string;
  skill: Skill;
  type: 'REQUIRED' | 'PREFERRED';
  importance: number;
}

export interface Job {
  id: string;
  companyId: string;
  company: Pick<Company, 'id' | 'name' | 'logoUrl' | 'industry'>;
  title: string;
  description: string;
  responsibilities: string[];
  location?: string;
  jobType: JobType;
  status: JobStatus;
  ctcMin?: number;
  ctcMax?: number;
  ctcCurrency: string;
  eligibleBranches: string[];
  minCgpa?: number;
  maxBacklogs?: number;
  allowedGraduationYears: number[];
  keywords: string[];
  rawJdText?: string;
  applicationDeadline?: string;
  driveDate?: string;
  jobSkills: JobSkill[];
  _count?: { applications: number };
  createdAt: string;
}

// ─────────────────────────────────────────────
// APPLICATIONS
// ─────────────────────────────────────────────

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'SELECTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface Application {
  id: string;
  jobId: string;
  job: Pick<Job, 'id' | 'title' | 'company' | 'location' | 'ctcMin' | 'ctcMax'>;
  status: ApplicationStatus;
  resumeId?: string;
  appliedAt: string;
  updatedAt: string;
  notes?: string;
  interviewDate?: string;
  shortlist?: Shortlist;
}

// ─────────────────────────────────────────────
// MATCHING
// ─────────────────────────────────────────────

export type EligibilityStatus = 'ELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'INELIGIBLE';
export type ShortlistStatus = 'HIGHLY_RECOMMENDED' | 'RECOMMENDED' | 'BORDERLINE' | 'NOT_RECOMMENDED';

export interface MatchedSkillInfo {
  skillName: string;
  confidence: SkillConfidence;
  matchType: 'explicit' | 'inferred';
  jobSkillType: 'required' | 'preferred';
  importance: number;
}

export interface MatchResult {
  id: string;
  studentProfileId: string;
  studentProfile?: Pick<StudentProfile, 'id' | 'firstName' | 'lastName' | 'department' | 'cgpa' | 'expectedGraduationYear'>;
  jobId: string;
  job?: Pick<Job, 'id' | 'title' | 'company'>;
  eligibilityStatus: EligibilityStatus;
  eligibilityReasons: string[];
  overallMatchPercentage: number;
  requiredSkillCoverage: number;
  preferredSkillCoverage: number;
  semanticSimilarity: number;
  academicFit: number;
  projectRelevance: number;
  certificationRelevance: number;
  matchedSkills: MatchedSkillInfo[];
  inferredMatchedSkills: MatchedSkillInfo[];
  missingSkills: string[];
  recommendation: ShortlistStatus;
  reasonCodes: string[];
  reasonSummary: string;
  computedAt: string;
}

export interface Shortlist {
  id: string;
  applicationId: string;
  jobId: string;
  status: ShortlistStatus;
  adminNotes?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// API RESPONSES
// ─────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─────────────────────────────────────────────
// ANALYTICS (Admin)
// ─────────────────────────────────────────────

export interface AnalyticsOverview {
  overview: {
    totalStudents: number;
    totalJobs: number;
    openJobs: number;
    totalCompanies: number;
    totalApplications: number;
    recentApplications: number;
    totalMatches: number;
  };
  shortlistBreakdown: Record<ShortlistStatus, number>;
  applicationStatusBreakdown: Record<ApplicationStatus, number>;
}
