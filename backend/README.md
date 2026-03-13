# DSU CareerBridge — Backend

AI-powered campus placement platform for Dayananda Sagar University.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: NestJS 10 (TypeScript)
- **Database**: PostgreSQL 15 + Prisma ORM
- **Cache/Queue**: Redis 7
- **AI**: OpenAI GPT-4o (structured JSON outputs)
- **Auth**: JWT + Passport
- **Validation**: class-validator + Zod
- **File Upload**: Multer (local storage → S3-ready)
- **Docs**: Swagger/OpenAPI at `/api/docs`

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15
- Redis 7
- OpenAI API key

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — set DATABASE_URL, REDIS_*, OPENAI_API_KEY
```

### 3. Database setup
```bash
npx prisma migrate dev --name init
npm run prisma:generate
```

### 4. Seed demo data
```bash
npm run seed
```

### 5. Start development server
```bash
npm run start:dev
```

API running at: http://localhost:3000/api/v1
Swagger docs:   http://localhost:3000/api/docs

---

## Demo Credentials (after seed)

| Role      | Email                              | Password        |
|-----------|------------------------------------|-----------------|
| Admin     | admin@dsu.edu.in                   | Admin@DSU2025   |
| Student   | ravi.kumar@dsu.edu.in              | Student@123     |
| Student   | priya.sharma@dsu.edu.in            | Student@123     |
| Recruiter | recruiter@infosyslimited.com       | Recruiter@123   |

---

## API Overview

### Auth
```
POST   /api/v1/auth/register          Register student/admin/recruiter
POST   /api/v1/auth/login             Get JWT token
GET    /api/v1/auth/me                Current user profile
POST   /api/v1/auth/change-password   Change password
```

### Student Profile
```
GET    /api/v1/students/me                   Full profile
PUT    /api/v1/students/me                   Update profile
GET    /api/v1/students/me/skills            Skills by category

POST   /api/v1/students/me/achievements      Add achievement
PUT    /api/v1/students/me/achievements/:id  Update
DELETE /api/v1/students/me/achievements/:id  Delete

POST   /api/v1/students/me/projects          Add project (auto skill extraction)
PUT    /api/v1/students/me/projects/:id
DELETE /api/v1/students/me/projects/:id

POST   /api/v1/students/me/certifications    Add cert with optional file upload
PUT    /api/v1/students/me/certifications/:id
DELETE /api/v1/students/me/certifications/:id

GET    /api/v1/students/me/applications             My applications
POST   /api/v1/students/me/applications/:jobId      Apply to job
GET    /api/v1/students/me/applications/:jobId/match  My match score for job
```

### Resumes (AI-powered)
```
GET    /api/v1/students/me/resume              All my resumes
POST   /api/v1/students/me/resume/upload       Upload PDF/DOCX — auto parse + skill extract
POST   /api/v1/students/me/resume/generate     Generate from complete profile
POST   /api/v1/students/me/resume/:id/enhance  Enhance uploaded resume
POST   /api/v1/students/me/resume/tailor/:jobId  Tailor for specific JD
PUT    /api/v1/students/me/resume/:id/set-master  Set as master resume
```

### Companies
```
GET    /api/v1/companies           List all
POST   /api/v1/companies           Create (Admin/Recruiter)
GET    /api/v1/companies/:id       Details with jobs
PUT    /api/v1/companies/:id       Update
DELETE /api/v1/companies/:id       Soft delete
```

### Jobs
```
GET    /api/v1/jobs                        List open jobs (filterable)
POST   /api/v1/jobs                        Create job
GET    /api/v1/jobs/:id                    Job details + skills
PUT    /api/v1/jobs/:id                    Update job
DELETE /api/v1/jobs/:id                    Delete job
POST   /api/v1/jobs/:id/parse-jd/upload    Upload JD PDF → auto parse + extract skills
POST   /api/v1/jobs/:id/parse-jd/text      Submit JD text → parse
GET    /api/v1/jobs/:id/matches            Ranked match results
GET    /api/v1/jobs/:id/shortlist          Shortlisted candidates
```

### Matching Engine
```
POST   /api/v1/matching/jobs/:jobId/run                        Run matching for ALL students
POST   /api/v1/matching/jobs/:jobId/students/:studentId        Single pair match
POST   /api/v1/matching/jobs/:jobId/shortlist/generate         Generate shortlist
GET    /api/v1/matching/jobs/:jobId/results                    Paginated results
```

### Admin Dashboard
```
GET    /api/v1/admin/analytics/overview       Platform stats
GET    /api/v1/admin/analytics/departments    Dept-wise breakdown
GET    /api/v1/admin/analytics/placements     Placement rate
GET    /api/v1/admin/students                 All students (filterable)
GET    /api/v1/admin/students/:id             Student detail
PATCH  /api/v1/admin/students/:userId/status  Activate/deactivate
GET    /api/v1/admin/jobs                     All jobs
GET    /api/v1/admin/companies                All companies
POST   /api/v1/admin/jobs/:id/run-matching    Trigger matching
GET    /api/v1/admin/jobs/:id/match-results   Match results
POST   /api/v1/admin/jobs/:id/shortlist/generate  Generate shortlist
```

### Skills Taxonomy
```
GET    /api/v1/skills              All canonical skills
GET    /api/v1/skills?category=AI_ML   Filter by category
```

### Files
```
GET    /api/v1/files/:id/download    Download file
GET    /api/v1/files/:id/metadata    File metadata
```

---

## Matching Algorithm

### Scoring Formula
```
FinalScore =
  40% × RequiredSkillCoverage   (dominant factor)
  15% × PreferredSkillCoverage
  15% × AcademicFit             (CGPA + 10th + 12th)
  10% × SemanticSimilarity      (embeddings, optional)
  10% × ProjectRelevance
  10% × CertificationRelevance
```

### Eligibility Gate
Hard eligibility checks run first. If `INELIGIBLE`, score is capped at 30%.

### Confidence Multipliers
| Skill Confidence | Multiplier |
|-----------------|------------|
| HIGH (explicit)  | 1.0        |
| MEDIUM (inferred)| 0.7        |
| LOW (weak)       | 0.4        |

### Recommendations
| Score + Coverage      | Label                |
|-----------------------|----------------------|
| ≥75% + ≥70% required  | Highly Recommended   |
| ≥55% + ≥50% required  | Recommended          |
| ≥35%                  | Borderline           |
| <35% or ineligible    | Not Recommended      |

---

## Skill Extraction Pipeline

1. **Explicit extraction**: Keywords from resume sections
2. **Inferred from projects**: Tech stack, project descriptions → derived skills
3. **Inferred from certifications**: Cert name → implied knowledge domain
4. **Normalization**: JS → JavaScript, Postgres → PostgreSQL, etc.
5. **Confidence scoring**: HIGH/MEDIUM/LOW per skill
6. **Canonical taxonomy**: All skills stored in normalized `skills` table

---

## Architecture

```
src/
├── main.ts
├── app.module.ts
├── config/
│   ├── app.config.ts
│   └── redis.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── middleware/
│   ├── all-exceptions.filter.ts
│   ├── transform.interceptor.ts
│   └── roles.guard.ts
├── shared/
│   ├── decorators/
│   └── dto/
└── modules/
    ├── auth/          JWT auth, strategies, guards
    ├── students/      Profile, achievements, projects, certs, applications
    ├── resumes/       Upload, generate, enhance, tailor
    ├── skills/        Taxonomy, extraction pipeline
    ├── companies/     Company management
    ├── jobs/          Job CRUD + JD parsing
    ├── matching/      Engine + service + controller
    ├── admin/         Dashboard + analytics
    ├── ai/            OpenAI abstraction + templates
    └── files/         Upload, storage, text extraction
```

---

## Production Checklist

- [ ] Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Switch `STORAGE_PROVIDER=s3` and configure AWS credentials
- [ ] Set `NODE_ENV=production`
- [ ] Run `npm run prisma:migrate:deploy`
- [ ] Configure SSL/TLS
- [ ] Enable Redis AUTH in production
- [ ] Set up monitoring (e.g. Sentry, Datadog)
- [ ] Configure rate limiting in production
- [ ] Review and harden CORS origin
