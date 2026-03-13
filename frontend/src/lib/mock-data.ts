// High-quality mock data for dev/demo mode
import type {
  StudentProfile, Company, Job, Achievement, Project, Certification,
  MatchResult, Application, Resume, AnalyticsOverview
} from '@/types';

export const MOCK_STUDENT: StudentProfile = {
  id: 'student-001',
  userId: 'user-001',
  firstName: 'Ravi',
  lastName: 'Kumar',
  email: 'ravi.kumar@dsu.edu.in',
  phone: '+91 9876543210',
  usn: '1DS21CS001',
  department: 'Computer Science & Engineering',
  semester: 7,
  yearOfAdmission: 2021,
  expectedGraduationYear: 2025,
  cgpa: 8.9,
  activeBacklogs: 0,
  totalBacklogs: 0,
  tenthPercentage: 95.2,
  twelfthPercentage: 91.0,
  linkedinUrl: 'https://linkedin.com/in/ravikumar',
  githubUrl: 'https://github.com/ravikumar',
  profileCompleteness: 85,
  createdAt: '2024-01-15T10:00:00Z',
  studentSkills: [
    { id: 's1', skillId: 'sk1', skill: { id: 'sk1', name: 'JavaScript', aliases: ['js'], category: 'PROGRAMMING_LANGUAGE' }, confidence: 'HIGH', source: 'resume' },
    { id: 's2', skillId: 'sk2', skill: { id: 'sk2', name: 'Node.js', aliases: ['node'], category: 'FRAMEWORK_LIBRARY' }, confidence: 'HIGH', source: 'resume' },
    { id: 's3', skillId: 'sk3', skill: { id: 'sk3', name: 'React.js', aliases: ['react'], category: 'FRAMEWORK_LIBRARY' }, confidence: 'HIGH', source: 'project:p1' },
    { id: 's4', skillId: 'sk4', skill: { id: 'sk4', name: 'PostgreSQL', aliases: ['postgres'], category: 'DATABASE' }, confidence: 'MEDIUM', source: 'inferred' },
    { id: 's5', skillId: 'sk5', skill: { id: 'sk5', name: 'AWS', aliases: ['aws'], category: 'CLOUD_DEVOPS' }, confidence: 'HIGH', source: 'certification' },
    { id: 's6', skillId: 'sk6', skill: { id: 'sk6', name: 'TypeScript', aliases: ['ts'], category: 'PROGRAMMING_LANGUAGE' }, confidence: 'HIGH', source: 'resume' },
    { id: 's7', skillId: 'sk7', skill: { id: 'sk7', name: 'Docker', aliases: ['docker'], category: 'CLOUD_DEVOPS' }, confidence: 'MEDIUM', source: 'project' },
    { id: 's8', skillId: 'sk8', skill: { id: 'sk8', name: 'REST API', aliases: ['rest'], category: 'FRAMEWORK_LIBRARY' }, confidence: 'HIGH', source: 'resume' },
    { id: 's9', skillId: 'sk9', skill: { id: 'sk9', name: 'Data Structures', aliases: ['dsa'], category: 'CS_FUNDAMENTALS' }, confidence: 'HIGH', source: 'resume' },
    { id: 's10', skillId: 'sk10', skill: { id: 'sk10', name: 'Redis', aliases: ['redis'], category: 'DATABASE' }, confidence: 'MEDIUM', source: 'project' },
  ],
};

export const MOCK_COMPANIES: Company[] = [
  { id: 'c1', name: 'Infosys Limited', industry: 'Information Technology', location: 'Bengaluru', size: '10000+', isVerified: true, website: 'https://infosys.com', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'c2', name: 'Wipro Technologies', industry: 'Information Technology', location: 'Bengaluru', size: '10000+', isVerified: true, website: 'https://wipro.com', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'c3', name: 'Zoho Corporation', industry: 'Software Products', location: 'Chennai', size: '10000+', isVerified: true, website: 'https://zoho.com', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'c4', name: 'Razorpay', industry: 'FinTech', location: 'Bengaluru', size: '1000-5000', isVerified: true, website: 'https://razorpay.com', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'c5', name: 'Groww', industry: 'FinTech', location: 'Bengaluru', size: '500-2000', isVerified: true, website: 'https://groww.in', createdAt: '2024-01-01T00:00:00Z' },
];

export const MOCK_JOBS: Job[] = [
  {
    id: 'j1', companyId: 'c1',
    company: { id: 'c1', name: 'Infosys Limited', logoUrl: undefined, industry: 'Information Technology' },
    title: 'Software Engineer — Backend',
    description: 'Build scalable backend systems for enterprise clients worldwide.',
    responsibilities: ['Design RESTful APIs', 'Work with PostgreSQL', 'Deploy on AWS'],
    location: 'Bengaluru, Karnataka',
    jobType: 'FULL_TIME', status: 'OPEN',
    ctcMin: 4.5, ctcMax: 6.5, ctcCurrency: 'INR',
    eligibleBranches: ['Computer Science & Engineering', 'Information Science & Engineering'],
    minCgpa: 7.0, maxBacklogs: 0,
    allowedGraduationYears: [2025, 2026],
    keywords: ['backend', 'node.js', 'api', 'aws'],
    applicationDeadline: '2025-03-31T00:00:00Z',
    driveDate: '2025-04-15T00:00:00Z',
    jobSkills: [
      { id: 'js1', skillId: 'sk2', skill: { id: 'sk2', name: 'Node.js', aliases: [], category: 'FRAMEWORK_LIBRARY' }, type: 'REQUIRED', importance: 9 },
      { id: 'js2', skillId: 'sk8', skill: { id: 'sk8', name: 'REST API', aliases: [], category: 'FRAMEWORK_LIBRARY' }, type: 'REQUIRED', importance: 8 },
      { id: 'js3', skillId: 'sk4', skill: { id: 'sk4', name: 'PostgreSQL', aliases: [], category: 'DATABASE' }, type: 'REQUIRED', importance: 7 },
      { id: 'js4', skillId: 'sk5', skill: { id: 'sk5', name: 'AWS', aliases: [], category: 'CLOUD_DEVOPS' }, type: 'PREFERRED', importance: 6 },
      { id: 'js5', skillId: 'sk7', skill: { id: 'sk7', name: 'Docker', aliases: [], category: 'CLOUD_DEVOPS' }, type: 'PREFERRED', importance: 5 },
    ],
    _count: { applications: 47 },
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'j2', companyId: 'c4',
    company: { id: 'c4', name: 'Razorpay', logoUrl: undefined, industry: 'FinTech' },
    title: 'Software Development Engineer — Frontend',
    description: 'Build delightful, fast UIs for India\'s leading payments platform.',
    responsibilities: ['Build React components', 'Optimize performance', 'Collaborate with design'],
    location: 'Bengaluru, Karnataka',
    jobType: 'FULL_TIME', status: 'OPEN',
    ctcMin: 14, ctcMax: 18, ctcCurrency: 'INR',
    eligibleBranches: ['Computer Science & Engineering', 'Information Science & Engineering'],
    minCgpa: 8.0, maxBacklogs: 0,
    allowedGraduationYears: [2025],
    keywords: ['react', 'typescript', 'frontend'],
    applicationDeadline: '2025-03-20T00:00:00Z',
    driveDate: '2025-04-05T00:00:00Z',
    jobSkills: [
      { id: 'js6', skillId: 'sk3', skill: { id: 'sk3', name: 'React.js', aliases: [], category: 'FRAMEWORK_LIBRARY' }, type: 'REQUIRED', importance: 10 },
      { id: 'js7', skillId: 'sk6', skill: { id: 'sk6', name: 'TypeScript', aliases: [], category: 'PROGRAMMING_LANGUAGE' }, type: 'REQUIRED', importance: 9 },
    ],
    _count: { applications: 82 },
    createdAt: '2024-01-12T00:00:00Z',
  },
  {
    id: 'j3', companyId: 'c3',
    company: { id: 'c3', name: 'Zoho Corporation', logoUrl: undefined, industry: 'Software Products' },
    title: 'Product Engineer',
    description: 'Own and build core product features end-to-end for 80M+ users.',
    responsibilities: ['Ship product features', 'Work full-stack', 'Write clean code'],
    location: 'Chennai, Tamil Nadu',
    jobType: 'FULL_TIME', status: 'OPEN',
    ctcMin: 8, ctcMax: 10, ctcCurrency: 'INR',
    eligibleBranches: ['Computer Science & Engineering', 'Information Science & Engineering', 'Artificial Intelligence & Data Science'],
    minCgpa: 8.0, maxBacklogs: 0,
    allowedGraduationYears: [2025],
    keywords: ['python', 'javascript', 'full-stack'],
    applicationDeadline: '2025-03-25T00:00:00Z',
    jobSkills: [],
    _count: { applications: 120 },
    createdAt: '2024-01-08T00:00:00Z',
  },
  {
    id: 'j4', companyId: 'c5',
    company: { id: 'c5', name: 'Groww', logoUrl: undefined, industry: 'FinTech' },
    title: 'Machine Learning Engineer',
    description: 'Build personalized financial recommendation systems at scale.',
    responsibilities: ['Build ML models', 'Deploy to production', 'A/B test improvements'],
    location: 'Bengaluru, Karnataka',
    jobType: 'FULL_TIME', status: 'OPEN',
    ctcMin: 16, ctcMax: 22, ctcCurrency: 'INR',
    eligibleBranches: ['Computer Science & Engineering', 'Artificial Intelligence & Data Science'],
    minCgpa: 8.0, maxBacklogs: 0,
    allowedGraduationYears: [2025],
    keywords: ['python', 'machine learning', 'tensorflow'],
    jobSkills: [],
    _count: { applications: 65 },
    createdAt: '2024-01-09T00:00:00Z',
  },
];

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', type: 'HACKATHON', title: 'Smart India Hackathon 2024 — Finalist', description: 'Built AI-based crop disease detection system for 5 lakh farmers.', organization: 'Ministry of Education, GOI', position: 'Finalist', createdAt: '2024-09-01T00:00:00Z' },
  { id: 'a2', type: 'INTERNSHIP', title: 'Software Engineering Intern — Infosys', description: 'Built 15 REST API endpoints in Java Spring Boot for Finacle banking platform.', organization: 'Infosys', startDate: '2024-05-01', endDate: '2024-07-31', createdAt: '2024-08-01T00:00:00Z' },
  { id: 'a3', type: 'AWARD', title: 'Best CSE Project Award 2024', description: 'Received departmental best project award for the AI Resume Parser project.', organization: 'DSU', createdAt: '2024-04-01T00:00:00Z' },
];

export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', title: 'AI-Powered Resume Parser', description: 'Full-stack web app using OpenAI GPT-4 to parse and analyze resumes with 95% accuracy.', techStack: ['Node.js', 'React.js', 'MongoDB', 'OpenAI API'], repoUrl: 'https://github.com/ravikumar/ai-resume-parser', highlights: ['95% extraction accuracy', 'Processed 1000+ resumes', 'Reduced review time by 70%'], isOngoing: false, createdAt: '2024-03-01T00:00:00Z' },
  { id: 'p2', title: 'Distributed Task Queue', description: 'Task queue system using Redis and Node.js with priority queues and real-time monitoring.', techStack: ['Node.js', 'Redis', 'TypeScript', 'WebSocket'], repoUrl: 'https://github.com/ravikumar/task-queue', highlights: ['10K+ tasks/second', 'Real-time monitoring dashboard'], isOngoing: false, createdAt: '2023-11-01T00:00:00Z' },
];

export const MOCK_CERTIFICATIONS: Certification[] = [
  { id: 'cert1', name: 'AWS Certified Developer – Associate', issuingOrganization: 'Amazon Web Services', credentialId: 'AWS-DEV-2024', inferredSkills: ['AWS', 'Cloud Architecture', 'IAM', 'S3', 'Lambda'], createdAt: '2024-06-01T00:00:00Z' },
  { id: 'cert2', name: 'Meta Frontend Developer Professional Certificate', issuingOrganization: 'Coursera / Meta', inferredSkills: ['React.js', 'JavaScript', 'HTML', 'CSS', 'UX Design'], createdAt: '2024-01-01T00:00:00Z' },
];

const DEMO_STUDENT_PROFILE = {
  id: 'student-001',
  firstName: 'Ravi',
  lastName: 'Kumar',
  department: 'Computer Science & Engineering',
  cgpa: 8.9,
  expectedGraduationYear: 2025,
};

export const MOCK_MATCH_RESULTS: MatchResult[] = [
  {
    id: 'mr1', studentProfileId: 'student-001', jobId: 'j1',
    studentProfile: DEMO_STUDENT_PROFILE,
    job: { id: 'j1', title: 'Software Engineer — Backend', company: { id: 'c1', name: 'Infosys Limited', logoUrl: undefined, industry: 'IT' } },
    eligibilityStatus: 'ELIGIBLE',
    eligibilityReasons: ['CGPA_OK: 8.9 >= 7.0', 'BACKLOGS_OK: 0 active', 'BRANCH_OK: CSE is eligible', 'GRAD_YEAR_OK: 2025'],
    overallMatchPercentage: 87,
    requiredSkillCoverage: 91,
    preferredSkillCoverage: 72,
    semanticSimilarity: 78,
    academicFit: 89,
    projectRelevance: 82,
    certificationRelevance: 75,
    matchedSkills: [
      { skillName: 'Node.js', confidence: 'HIGH', matchType: 'explicit', jobSkillType: 'required', importance: 9 },
      { skillName: 'REST API', confidence: 'HIGH', matchType: 'explicit', jobSkillType: 'required', importance: 8 },
      { skillName: 'PostgreSQL', confidence: 'MEDIUM', matchType: 'inferred', jobSkillType: 'required', importance: 7 },
    ],
    inferredMatchedSkills: [],
    missingSkills: ['Kubernetes'],
    recommendation: 'HIGHLY_RECOMMENDED',
    reasonCodes: ['HIGH_REQUIRED_SKILL_COVERAGE', 'CGPA_OK', 'ELIGIBLE'],
    reasonSummary: 'Strong backend developer with high required skill coverage. Eligible for the role. Missing only Kubernetes which is non-critical.',
    computedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'mr2', studentProfileId: 'student-001', jobId: 'j2',
    studentProfile: DEMO_STUDENT_PROFILE,
    job: { id: 'j2', title: 'SDE — Frontend', company: { id: 'c4', name: 'Razorpay', logoUrl: undefined, industry: 'FinTech' } },
    eligibilityStatus: 'ELIGIBLE',
    eligibilityReasons: ['CGPA_OK: 8.9 >= 8.0', 'BACKLOGS_OK', 'BRANCH_OK', 'GRAD_YEAR_OK: 2025'],
    overallMatchPercentage: 72,
    requiredSkillCoverage: 80,
    preferredSkillCoverage: 60,
    semanticSimilarity: 65,
    academicFit: 89,
    projectRelevance: 70,
    certificationRelevance: 60,
    matchedSkills: [
      { skillName: 'React.js', confidence: 'HIGH', matchType: 'explicit', jobSkillType: 'required', importance: 10 },
      { skillName: 'TypeScript', confidence: 'HIGH', matchType: 'explicit', jobSkillType: 'required', importance: 9 },
    ],
    inferredMatchedSkills: [],
    missingSkills: ['Next.js', 'GraphQL'],
    recommendation: 'RECOMMENDED',
    reasonCodes: ['MODERATE_REQUIRED_SKILL_COVERAGE'],
    reasonSummary: 'Good frontend skills with React and TypeScript. Missing Next.js and GraphQL experience.',
    computedAt: '2024-01-20T10:00:00Z',
  },
];

export const MOCK_APPLICATIONS: Application[] = [
  { id: 'app1', jobId: 'j1', job: { id: 'j1', title: 'Software Engineer — Backend', company: { id: 'c1', name: 'Infosys Limited', logoUrl: undefined, industry: 'IT' }, location: 'Bengaluru', ctcMin: 4.5, ctcMax: 6.5 }, status: 'SHORTLISTED', appliedAt: '2024-01-20T10:00:00Z', updatedAt: '2024-01-25T10:00:00Z' },
  { id: 'app2', jobId: 'j2', job: { id: 'j2', title: 'SDE — Frontend', company: { id: 'c4', name: 'Razorpay', logoUrl: undefined, industry: 'FinTech' }, location: 'Bengaluru', ctcMin: 14, ctcMax: 18 }, status: 'UNDER_REVIEW', appliedAt: '2024-01-18T10:00:00Z', updatedAt: '2024-01-18T10:00:00Z' },
  { id: 'app3', jobId: 'j3', job: { id: 'j3', title: 'Product Engineer', company: { id: 'c3', name: 'Zoho Corporation', logoUrl: undefined, industry: 'Software' }, location: 'Chennai', ctcMin: 8, ctcMax: 10 }, status: 'APPLIED', appliedAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z' },
];

export const MOCK_RESUMES: Resume[] = [
  { id: 'r1', type: 'UPLOADED', status: 'ACTIVE', title: 'Ravi_Kumar_Resume.pdf', version: 1, isMaster: false, createdAt: '2024-01-10T00:00:00Z', updatedAt: '2024-01-10T00:00:00Z' },
  { id: 'r2', type: 'GENERATED', status: 'ACTIVE', title: 'AI Generated Resume', version: 1, isMaster: true, createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
  { id: 'r3', type: 'TAILORED', status: 'ACTIVE', title: 'Tailored for Infosys SWE', version: 1, isMaster: false, targetJobId: 'j1', createdAt: '2024-01-20T00:00:00Z', updatedAt: '2024-01-20T00:00:00Z' },
];

export const MOCK_ANALYTICS: AnalyticsOverview = {
  overview: {
    totalStudents: 847,
    totalJobs: 23,
    openJobs: 18,
    totalCompanies: 12,
    totalApplications: 1243,
    recentApplications: 89,
    totalMatches: 3400,
  },
  shortlistBreakdown: {
    HIGHLY_RECOMMENDED: 124,
    RECOMMENDED: 298,
    BORDERLINE: 187,
    NOT_RECOMMENDED: 432,
  },
  applicationStatusBreakdown: {
    APPLIED: 502,
    UNDER_REVIEW: 289,
    SHORTLISTED: 187,
    INTERVIEW_SCHEDULED: 98,
    SELECTED: 67,
    REJECTED: 87,
    WITHDRAWN: 13,
  },
};

// Demo credentials shown on login page
export const DEMO_CREDENTIALS = [
  { role: 'STUDENT' as const, email: 'ravi.kumar@dsu.edu.in', password: 'Student@123', label: 'Student Demo' },
  { role: 'ADMIN' as const, email: 'admin@dsu.edu.in', password: 'Admin@DSU2025', label: 'Admin Demo' },
  { role: 'RECRUITER' as const, email: 'recruiter@infosyslimited.com', password: 'Recruiter@123', label: 'Recruiter Demo' },
];
