/**
 * Local skill extractor — no API keys required.
 * Ported from resume_parser.jsx algorithm.
 */

// ============================================================
// SKILL KNOWLEDGE BASE
// ============================================================

const SKILL_TAXONOMY: Record<string, string[]> = {
  'Programming Languages': [
    'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'c', 'ruby', 'go', 'golang',
    'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'php', 'bash', 'shell',
    'powershell', 'dart', 'lua', 'haskell', 'elixir', 'erlang', 'clojure', 'groovy',
    'objective-c', 'assembly', 'cobol', 'fortran', 'vba', 'apex', 'solidity',
  ],
  'Web Frontend': [
    'react', 'reactjs', 'react.js', 'vue', 'vuejs', 'vue.js', 'angular', 'angularjs',
    'svelte', 'nextjs', 'next.js', 'nuxtjs', 'gatsby', 'html', 'html5', 'css', 'css3',
    'sass', 'scss', 'less', 'tailwind', 'tailwindcss', 'bootstrap', 'material ui',
    'chakra ui', 'ant design', 'jquery', 'redux', 'mobx', 'zustand', 'webpack',
    'vite', 'parcel', 'rollup', 'babel', 'eslint', 'prettier', 'storybook', 'figma',
    'framer motion', 'd3.js', 'd3', 'three.js', 'webgl', 'web components', 'pwa',
    'responsive design', 'accessibility', 'wcag', 'seo',
  ],
  'Web Backend': [
    'nodejs', 'node.js', 'express', 'expressjs', 'fastapi', 'flask', 'django',
    'spring', 'spring boot', 'rails', 'ruby on rails', 'laravel', 'asp.net',
    '.net core', 'nestjs', 'graphql', 'rest api', 'restful', 'grpc', 'soap',
    'websockets', 'oauth', 'jwt', 'fastify', 'hapi', 'koa', 'gin', 'fiber',
    'actix', 'rocket', 'phoenix', 'ktor', 'micronaut', 'quarkus',
  ],
  'Cloud & DevOps': [
    'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes',
    'k8s', 'terraform', 'ansible', 'puppet', 'chef', 'jenkins', 'github actions',
    'gitlab ci', 'circleci', 'travis ci', 'helm', 'istio', 'prometheus', 'grafana',
    'elk stack', 'elasticsearch', 'logstash', 'kibana', 'nginx', 'apache', 'caddy',
    'linux', 'ubuntu', 'centos', 'debian', 'ci/cd', 'devops', 'sre', 'infrastructure as code',
    'cloudformation', 'pulumi', 'vault', 'consul', 'kafka', 'rabbitmq', 'redis',
    's3', 'ec2', 'lambda', 'azure functions', 'cloud run', 'gke', 'eks', 'aks',
    'heroku', 'netlify', 'vercel', 'digitalocean',
  ],
  'Databases': [
    'sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'oracle', 'sql server',
    'mssql', 'mongodb', 'nosql', 'redis', 'cassandra', 'dynamodb', 'firestore',
    'firebase', 'neo4j', 'graph database', 'influxdb', 'clickhouse', 'snowflake',
    'bigquery', 'redshift', 'databricks', 'supabase', 'prisma', 'sqlalchemy',
    'hibernate', 'typeorm', 'sequelize', 'mongoose', 'elasticsearch', 'pinecone',
    'weaviate', 'qdrant', 'vector database',
  ],
  'Data Science & ML': [
    'machine learning', 'deep learning', 'neural networks', 'natural language processing',
    'nlp', 'computer vision', 'cv', 'data science', 'data analysis', 'data visualization',
    'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn', 'pandas', 'numpy',
    'matplotlib', 'seaborn', 'plotly', 'xgboost', 'lightgbm', 'catboost',
    'hugging face', 'transformers', 'bert', 'gpt', 'llm', 'large language models',
    'reinforcement learning', 'rl', 'time series', 'feature engineering',
    'model deployment', 'mlops', 'mlflow', 'kubeflow', 'airflow', 'spark',
    'pyspark', 'hadoop', 'hive', 'tableau', 'power bi', 'looker', 'dbt',
    'statistics', 'statistical analysis', 'a/b testing', 'hypothesis testing',
    'regression', 'classification', 'clustering', 'recommendation systems',
    'opencv', 'yolo', 'stable diffusion', 'langchain', 'llamaindex', 'rag',
    'fine-tuning', 'prompt engineering', 'vector embeddings',
  ],
  'Mobile Development': [
    'ios', 'android', 'react native', 'flutter', 'xamarin', 'ionic', 'cordova',
    'swift', 'swiftui', 'uikit', 'kotlin', 'java android', 'jetpack compose',
    'expo', 'capacitor', 'pwa', 'mobile development', 'app development',
  ],
  'Security & Networking': [
    'cybersecurity', 'information security', 'network security', 'penetration testing',
    'ethical hacking', 'vulnerability assessment', 'siem', 'soc', 'firewall',
    'vpn', 'tls', 'ssl', 'cryptography', 'iam', 'identity management',
    'zero trust', 'owasp', 'burp suite', 'metasploit', 'nmap', 'wireshark',
    'splunk', 'suricata', 'snort', 'tcp/ip', 'dns', 'http', 'https',
    'load balancing', 'cdn', 'api security', 'devsecops', 'compliance',
  ],
  'Project Management & Soft Skills': [
    'agile', 'scrum', 'kanban', 'jira', 'confluence', 'trello', 'asana',
    'project management', 'team leadership', 'communication', 'problem solving',
    'critical thinking', 'collaboration', 'mentoring', 'code review',
    'technical documentation', 'sprint planning', 'stakeholder management',
    'product management', 'cross-functional', 'waterfall', 'pmp',
    'lean', 'six sigma', 'okrs', 'kpis',
  ],
  'Tools & Platforms': [
    'git', 'github', 'gitlab', 'bitbucket', 'vscode', 'intellij', 'vim',
    'linux terminal', 'postman', 'swagger', 'openapi', 'jira', 'slack',
    'notion', 'airtable', 'figma', 'adobe xd', 'sketch', 'zeplin',
    'unity', 'unreal engine', 'blender', 'autocad', 'solidworks',
    'salesforce', 'hubspot', 'zendesk', 'stripe', 'twilio', 'sendgrid',
  ],
  'Certifications & Standards': [
    'aws certified', 'azure certified', 'gcp certified', 'cka', 'ckad', 'cks',
    'pmp', 'cissp', 'ceh', 'comptia', 'ccna', 'ccnp', 'oracle certified',
    'google certified', 'tensorflow developer', 'databricks certified',
    'hashicorp certified', 'kubernetes certified', 'scrum master', 'csm',
    'safe', 'iso 27001', 'soc 2', 'gdpr', 'hipaa',
  ],
};

const INFERENCE_RULES: Array<{ triggers: string[]; infer: string[] }> = [
  { triggers: ['react', 'vue', 'angular', 'svelte'], infer: ['Component Architecture', 'State Management', 'Frontend Development'] },
  { triggers: ['tensorflow', 'pytorch', 'keras'], infer: ['Model Training', 'GPU Computing', 'Deep Learning', 'Python'] },
  { triggers: ['docker', 'kubernetes'], infer: ['Containerization', 'Microservices', 'Orchestration'] },
  { triggers: ['aws', 'azure', 'gcp'], infer: ['Cloud Architecture', 'Cloud Infrastructure', 'Scalability'] },
  { triggers: ['mongodb', 'cassandra', 'dynamodb', 'redis'], infer: ['NoSQL', 'Non-relational Databases', 'Distributed Systems'] },
  { triggers: ['mysql', 'postgresql', 'oracle', 'sql server'], infer: ['SQL', 'Relational Databases', 'Data Modeling'] },
  { triggers: ['spark', 'hadoop', 'hive', 'kafka'], infer: ['Big Data', 'Distributed Computing', 'Data Engineering'] },
  { triggers: ['jenkins', 'github actions', 'gitlab ci', 'circleci'], infer: ['CI/CD', 'Automation', 'DevOps'] },
  { triggers: ['nlp', 'bert', 'gpt', 'transformers', 'hugging face'], infer: ['Text Processing', 'Language Models', 'AI/ML'] },
  { triggers: ['rest api', 'graphql', 'grpc'], infer: ['API Design', 'Backend Development', 'System Integration'] },
  { triggers: ['html', 'css', 'javascript'], infer: ['Web Development', 'Frontend Development'] },
  { triggers: ['python', 'pandas', 'numpy'], infer: ['Data Analysis', 'Scientific Computing'] },
  { triggers: ['git', 'github', 'gitlab'], infer: ['Version Control', 'Collaborative Development'] },
  { triggers: ['scrum', 'agile', 'kanban'], infer: ['Agile Methodology', 'Sprint Management'] },
  { triggers: ['android', 'ios', 'flutter', 'react native'], infer: ['Cross-platform Development', 'Mobile UI/UX'] },
  { triggers: ['penetration testing', 'vulnerability', 'ethical hacking', 'cybersecurity'], infer: ['Risk Assessment', 'Security Auditing'] },
];

// ============================================================
// ALGORITHM
// ============================================================

function tokenize(text: string): string {
  return text.toLowerCase()
    .replace(/[()[\]{}<>]/g, ' ')
    .replace(/[/|•·]/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSection(text: string, sectionNames: string[]): string {
  const lines = text.split('\n');
  const patterns = sectionNames.map(s => new RegExp(`^\\s*${s}\\s*[:\\-]?\\s*$`, 'i'));
  let inSection = false;
  const content: string[] = [];
  const endPattern = /^(experience|education|skills|projects|certifications|awards|publications|references|summary|objective|work history|requirements|responsibilities|qualifications|preferred|benefits)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (patterns.some(p => p.test(line))) {
      inSection = true;
      continue;
    }
    if (inSection) {
      if (i > 0 && endPattern.test(line) && !sectionNames.some(s => line.toLowerCase().includes(s.toLowerCase()))) {
        inSection = false;
        break;
      }
      content.push(line);
    }
  }
  return content.join('\n');
}

function matchSkillsInText(
  text: string,
  addMatch: (skill: string, category: string) => void,
): void {
  const tokenized = tokenize(text);
  for (const [category, skills] of Object.entries(SKILL_TAXONOMY)) {
    for (const skill of skills) {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i');
      if (regex.test(tokenized)) {
        addMatch(skill, category);
      }
    }
  }
}

// ============================================================
// PUBLIC API
// ============================================================

export interface LocalExtractedSkill {
  name: string;
  rawName: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  source: 'explicit' | 'inferred';
  inferenceReason?: string;
  aliases?: string[];
}

/**
 * Extract skills from any text (resume, JD, etc.) using the local taxonomy.
 * Returns results in the same shape as ExtractedSkill from ai-provider.interface.ts.
 */
export function extractSkillsLocal(text: string, context = ''): LocalExtractedSkill[] {
  const foundSkills = new Map<string, { display: string; category: string; sources: Set<string>; count: number }>();
  const inferredSkills = new Map<string, { display: string; triggeredBy: string[] }>();

  const addMatch = (skill: string, category: string, source?: string) => {
    const key = skill.toLowerCase();
    if (!foundSkills.has(key)) {
      foundSkills.set(key, { display: skill, category, sources: new Set(), count: 0 });
    }
    const entry = foundSkills.get(key)!;
    if (source) entry.sources.add(source);
    entry.count++;
  };

  const addInferred = (skill: string, triggeredBy: string[]) => {
    const key = skill.toLowerCase();
    if (!foundSkills.has(key) && !inferredSkills.has(key)) {
      inferredSkills.set(key, { display: skill, triggeredBy: [...triggeredBy] });
    }
  };

  // Section-aware matching
  const skillsSection = extractSection(text, ['skills', 'technical skills', 'core skills', 'competencies', 'technologies']);
  const projectsSection = extractSection(text, ['projects', 'personal projects', 'academic projects', 'key projects']);
  const certSection = extractSection(text, ['certifications', 'certificates', 'credentials', 'licenses']);
  const expSection = extractSection(text, ['experience', 'work experience', 'employment', 'work history']);
  const eduSection = extractSection(text, ['education', 'academic background', 'qualifications']);
  const summarySection = extractSection(text, ['summary', 'objective', 'profile', 'about']);

  if (skillsSection) matchSkillsInText(skillsSection, (s, c) => addMatch(s, c, 'Skills Section'));
  if (projectsSection) matchSkillsInText(projectsSection, (s, c) => addMatch(s, c, 'Projects'));
  if (certSection) matchSkillsInText(certSection, (s, c) => addMatch(s, c, 'Certifications'));
  if (expSection) matchSkillsInText(expSection, (s, c) => addMatch(s, c, 'Experience'));
  if (eduSection) matchSkillsInText(eduSection, (s, c) => addMatch(s, c, 'Education'));
  if (summarySection) matchSkillsInText(summarySection, (s, c) => addMatch(s, c, 'Summary'));
  matchSkillsInText(text, (s, c) => addMatch(s, c, 'Document'));

  // Inference rules
  const foundLower = new Set([...foundSkills.keys()]);
  for (const rule of INFERENCE_RULES) {
    const triggered = rule.triggers.filter(t => foundLower.has(t));
    if (triggered.length >= 1) {
      for (const inferred of rule.infer) {
        addInferred(inferred, triggered);
      }
    }
  }

  const results: LocalExtractedSkill[] = [];

  for (const [, val] of foundSkills) {
    results.push({
      name: val.display,
      rawName: val.display,
      confidence: val.count >= 3 ? 'HIGH' : val.count >= 2 ? 'MEDIUM' : 'HIGH',
      category: val.category,
      source: 'explicit',
    });
  }

  for (const [, val] of inferredSkills) {
    results.push({
      name: val.display,
      rawName: val.display,
      confidence: 'MEDIUM',
      category: 'Inferred',
      source: 'inferred',
      inferenceReason: `Inferred from: ${val.triggeredBy.join(', ')}`,
    });
  }

  return results;
}

/**
 * Extract JD skills split into required and preferred based on section context.
 */
export function extractJDSkillsLocal(text: string): {
  requiredSkills: string[];
  preferredSkills: string[];
} {
  const requiredSection = extractSection(text, [
    'requirements', 'required skills', 'must have', 'minimum qualifications',
    'basic qualifications', 'required qualifications',
  ]);
  const preferredSection = extractSection(text, [
    'preferred', 'nice to have', 'bonus', 'preferred qualifications',
    'good to have', 'additional qualifications',
  ]);

  const requiredNames = new Set<string>();
  const preferredNames = new Set<string>();

  if (requiredSection.trim()) {
    matchSkillsInText(requiredSection, (skill) => requiredNames.add(skill));
  }
  if (preferredSection.trim()) {
    matchSkillsInText(preferredSection, (skill) => {
      if (!requiredNames.has(skill)) preferredNames.add(skill);
    });
  }

  // Fall back to full-text extraction if no sections found
  if (requiredNames.size === 0) {
    matchSkillsInText(text, (skill) => requiredNames.add(skill));
  }

  return {
    requiredSkills: [...requiredNames],
    preferredSkills: [...preferredNames],
  };
}
