// AI Provider abstraction — swap providers without touching feature code

export interface ParsedResumeContent {
  summary?: string;
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  education?: Array<{
    institution: string;
    degree: string;
    field?: string;
    cgpa?: number;
    year?: number;
  }>;
  experience?: Array<{
    company: string;
    role: string;
    duration?: string;
    description: string;
    bullets?: string[];
  }>;
  projects?: Array<{
    title: string;
    description: string;
    techStack?: string[];
    bullets?: string[];
  }>;
  skills?: string[];
  certifications?: Array<{
    name: string;
    issuer?: string;
    year?: number;
  }>;
  achievements?: string[];
}

export interface ExtractedSkill {
  name: string;           // canonical name
  rawName: string;        // as found in text
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  source: string;         // "explicit" | "inferred"
  inferenceReason?: string;
  aliases?: string[];
}

export interface ParsedJobDescription {
  jobTitle?: string;
  company?: string;
  location?: string;
  jobType?: string;
  ctcMin?: number;
  ctcMax?: number;
  ctcCurrency?: string;
  experienceLevel?: string;
  eligibleBranches?: string[];
  minCgpa?: number;
  maxBacklogs?: number;
  allowedGraduationYears?: number[];
  requiredSkills?: string[];
  preferredSkills?: string[];
  softSkills?: string[];
  responsibilities?: string[];
  keywords?: string[];
  additionalNotes?: string;
}

export interface ResumeGenerationInput {
  studentProfile: Record<string, any>;
  achievements: any[];
  projects: any[];
  certifications: any[];
  additionalNotes?: string;
  targetRole?: string;
}

export interface GeneratedResume {
  summary: string;
  sections: Array<{
    type: string;
    title: string;
    content: any;
    order: number;
  }>;
  htmlContent: string;
  atsKeywords: string[];
}

export interface EnhancedResume {
  originalContent: ParsedResumeContent;
  improvedSummary: string;
  improvedBullets: Array<{
    original: string;
    improved: string;
    section: string;
  }>;
  missingSections: string[];
  suggestedSkills: ExtractedSkill[];
  htmlContent: string;
  enhancementNotes: string[];
}

export interface TailoredResume {
  jobTitle: string;
  targetedSummary: string;
  prioritizedSections: Array<{
    type: string;
    title: string;
    content: any;
    order: number;
    relevanceScore: number;
  }>;
  highlightedSkills: string[];
  htmlContent: string;
  tailoringNotes: string[];
}

export interface IAIProvider {
  parseResume(rawText: string): Promise<ParsedResumeContent>;
  extractSkillsFromText(text: string, context: string): Promise<ExtractedSkill[]>;
  parseJobDescription(rawText: string): Promise<ParsedJobDescription>;
  generateResume(input: ResumeGenerationInput): Promise<GeneratedResume>;
  enhanceResume(parsedContent: ParsedResumeContent, rawText: string): Promise<EnhancedResume>;
  tailorResumeToJob(
    studentData: Record<string, any>,
    jobDescription: ParsedJobDescription,
    rawJdText: string,
  ): Promise<TailoredResume>;
  generateEmbedding(text: string): Promise<number[]>;
  normalizeSkillName(rawSkillName: string): Promise<string>;
}
