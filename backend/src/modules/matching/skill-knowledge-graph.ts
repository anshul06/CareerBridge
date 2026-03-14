/**
 * Skill Knowledge Graph — Graph-based Semantic Skill Similarity Engine
 *
 * Academic basis:
 *  - ESCO Skill Taxonomy (European Skills/Competences/Qualifications/Occupations)
 *  - O*NET Skills Database (Occupational Information Network, US DOL)
 *  - "Towards Effective and Interpretable Person-Job Fitting" (Jiang et al., SIGIR 2021)
 *  - "APJFNN: Attentive Person-Job Fit Neural Network" (Qin et al., SIGIR 2018)
 *  - "Person-Job Fit: Adapting the Right Talent for the Right Job" (Zhu et al., WWW 2018)
 *
 * Graph structure:
 *   Nodes  = skills (130+ technical skills and domains)
 *   Edges  = three semantic relationship types:
 *     IMPLIES     : directed; skill A implies knowledge of B
 *                   e.g. django → python (0.92) — having Django means you know Python
 *     SUBSTITUTE  : bidirectional; A can substitute for B as a job requirement
 *                   e.g. postgresql ↔ mysql (0.82) — MySQL experience counts for PostgreSQL roles
 *     SYNONYM     : bidirectional, weight=1.0; exact equivalents
 *                   e.g. postgres ↔ postgresql
 *
 * Matching algorithm:
 *   Best-first search (Dijkstra-like for max-product path)
 *   Depth decay: hop1=1.0, hop2=0.85, hop3=0.70
 *   Minimum similarity threshold: 0.30 (prune low-quality paths)
 *   Returns: score [0-1], traversal path (for explainability), hop count
 *
 * Usage:
 *   const reach = SKILL_GRAPH.getAllReachable('tensorflow');
 *   // reach.get('python') → {score:0.85, path:['tensorflow','python'], hops:1, edgeType:'IMPLIES'}
 *   const sim = SKILL_GRAPH.getSimilarity('pytorch', 'tensorflow');
 *   // → {score:0.88, path:['pytorch','tensorflow'], hops:1, edgeType:'SUBSTITUTE'}
 */

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type EdgeType = 'SYNONYM' | 'SUBSTITUTE' | 'IMPLIES';

interface GraphEdge {
  weight: number;
  type: EdgeType;
}

export interface SkillSimilarity {
  score: number;       // 0–1 semantic similarity
  path: string[];      // graph traversal path for explainability
  hops: number;        // 0=exact, 1=direct edge, 2=1-hop transitive, 3=2-hop transitive
  edgeType: EdgeType;  // dominant edge type in path
}

// ─────────────────────────────────────────────
// GRAPH ENGINE
// ─────────────────────────────────────────────

const DEPTH_DECAY = [1.0, 1.0, 0.85, 0.70] as const;
const MIN_SCORE = 0.28;
const MAX_HOPS = 3;

class SkillKnowledgeGraph {
  private adj = new Map<string, Map<string, GraphEdge>>();
  private aliasMap = new Map<string, string>(); // alias → canonical

  private norm(s: string): string {
    return s.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  private resolve(s: string): string {
    const n = this.norm(s);
    return this.aliasMap.get(n) ?? n;
  }

  private ensureNode(id: string): void {
    if (!this.adj.has(id)) this.adj.set(id, new Map());
  }

  // Register a canonical skill with its aliases
  skill(canonical: string, aliases: string[]): this {
    const c = this.norm(canonical);
    this.ensureNode(c);
    for (const a of aliases) {
      this.aliasMap.set(this.norm(a), c);
    }
    return this;
  }

  // Add a directed edge; if bidir=true also add reverse
  private addEdge(from: string, to: string, weight: number, type: EdgeType, bidir: boolean): void {
    const f = this.resolve(from);
    const t = this.resolve(to);
    this.ensureNode(f);
    this.ensureNode(t);
    // Keep best weight if edge already exists
    const fMap = this.adj.get(f)!;
    const existing = fMap.get(t);
    if (!existing || existing.weight < weight) {
      fMap.set(t, { weight, type });
    }
    if (bidir) {
      const tMap = this.adj.get(t)!;
      const existingRev = tMap.get(f);
      if (!existingRev || existingRev.weight < weight) {
        tMap.set(f, { weight, type });
      }
    }
  }

  // Synonym (bidirectional, weight=1.0)
  synonym(a: string, b: string): this {
    this.addEdge(a, b, 1.0, 'SYNONYM', true);
    return this;
  }

  // Directed implication: `from` implies knowledge of `to`
  implies(from: string, to: string, weight: number): this {
    this.addEdge(from, to, weight, 'IMPLIES', false);
    return this;
  }

  // Bidirectional substitute: `a` can substitute for `b` in job requirements
  sub(a: string, b: string, weight: number): this {
    this.addEdge(a, b, weight, 'SUBSTITUTE', true);
    return this;
  }

  /**
   * Best-first search (max-product path scoring).
   * Finds the highest-similarity path from `skill` to all reachable nodes.
   * Time complexity: O((V + E) log V) — fast on our ~130-node graph.
   */
  getAllReachable(skill: string): Map<string, SkillSimilarity> {
    const origin = this.resolve(this.norm(skill));
    const result = new Map<string, SkillSimilarity>();
    result.set(origin, { score: 1.0, path: [skill], hops: 0, edgeType: 'SYNONYM' });

    type QItem = { node: string; score: number; path: string[]; hops: number; edgeType: EdgeType };
    const queue: QItem[] = [{ node: origin, score: 1.0, path: [skill], hops: 0, edgeType: 'SYNONYM' }];
    const bestScore = new Map<string, number>();
    bestScore.set(origin, 1.0);

    while (queue.length > 0) {
      // Greedy: expand highest-score node first (approximates Dijkstra for max-product)
      queue.sort((a, b) => b.score - a.score);
      const cur = queue.shift()!;

      if (cur.hops >= MAX_HOPS) continue;
      // Prune: if a better path to cur.node was already found, skip
      if ((bestScore.get(cur.node) ?? 0) > cur.score + 1e-9) continue;

      const neighbors = this.adj.get(cur.node);
      if (!neighbors) continue;

      for (const [neighbor, edge] of neighbors) {
        const decay = DEPTH_DECAY[cur.hops + 1] ?? 0.60;
        const newScore = cur.score * edge.weight * decay;
        if (newScore < MIN_SCORE) continue;

        const prevBest = bestScore.get(neighbor) ?? 0;
        if (newScore > prevBest) {
          bestScore.set(neighbor, newScore);
          const newPath = [...cur.path, neighbor];
          result.set(neighbor, { score: newScore, path: newPath, hops: cur.hops + 1, edgeType: edge.type });
          queue.push({ node: neighbor, score: newScore, path: newPath, hops: cur.hops + 1, edgeType: edge.type });
        }
      }
    }

    return result;
  }

  /**
   * Point similarity between two skills. Wraps getAllReachable with target lookup.
   */
  getSimilarity(skillA: string, skillB: string): SkillSimilarity {
    const nb = this.resolve(this.norm(skillB));
    const reach = this.getAllReachable(skillA);
    return reach.get(nb) ?? { score: 0, path: [], hops: -1, edgeType: 'SYNONYM' };
  }

  /**
   * Get all direct IMPLIES neighbors (for student skill expansion).
   */
  getImplied(skill: string): { name: string; score: number }[] {
    const n = this.resolve(this.norm(skill));
    const neighbors = this.adj.get(n);
    if (!neighbors) return [];
    const out: { name: string; score: number }[] = [];
    for (const [neighbor, edge] of neighbors) {
      if (edge.type === 'IMPLIES' || edge.type === 'SYNONYM') {
        out.push({ name: neighbor, score: edge.weight });
      }
    }
    return out;
  }
}

// ─────────────────────────────────────────────
// GRAPH BUILDER — all skill nodes and edges
// ─────────────────────────────────────────────

function buildSkillGraph(): SkillKnowledgeGraph {
  const g = new SkillKnowledgeGraph();

  // ── Register canonical skills with aliases ───────────────────────────────
  // (aliases resolve to canonical during lookup)

  // Languages
  g.skill('python',      ['py']);
  g.skill('javascript',  ['js', 'ecmascript', 'es6', 'es2015']);
  g.skill('typescript',  ['ts']);
  g.skill('java',        []);
  g.skill('c++',         ['cpp', 'c plus plus']);
  g.skill('c#',          ['csharp', 'dotnet csharp', 'c sharp']);
  g.skill('go',          ['golang']);
  g.skill('rust',        []);
  g.skill('kotlin',      []);
  g.skill('scala',       []);
  g.skill('swift',       []);
  g.skill('ruby',        []);
  g.skill('php',         []);
  g.skill('r',           ['r language', 'r programming']);
  g.skill('dart',        []);
  g.skill('shell',       ['bash', 'shell scripting', 'bash scripting']);
  g.skill('matlab',      []);

  // Web Frontend
  g.skill('react',       ['reactjs', 'react.js', 'react js']);
  g.skill('vue',         ['vuejs', 'vue.js', 'vue js']);
  g.skill('angular',     ['angularjs', 'angular js']);
  g.skill('svelte',      []);
  g.skill('next.js',     ['nextjs', 'next js']);
  g.skill('nuxt.js',     ['nuxtjs', 'nuxt js']);
  g.skill('gatsby',      []);
  g.skill('html',        ['html5']);
  g.skill('css',         ['css3']);
  g.skill('tailwind',    ['tailwindcss', 'tailwind css']);
  g.skill('redux',       ['redux toolkit', 'rtk']);
  g.skill('webpack',     []);
  g.skill('vite',        []);

  // Web Backend
  g.skill('node.js',     ['nodejs', 'node js', 'node']);
  g.skill('express',     ['express.js', 'expressjs']);
  g.skill('nestjs',      ['nest.js', 'nest js']);
  g.skill('fastapi',     ['fast api']);
  g.skill('flask',       []);
  g.skill('django',      []);
  g.skill('spring boot', ['springboot', 'spring-boot']);
  g.skill('rails',       ['ruby on rails', 'ror']);
  g.skill('laravel',     []);
  g.skill('asp.net',     ['aspnet', 'asp net', '.net core', 'dotnet core']);
  g.skill('fastify',     []);
  g.skill('koa',         []);
  g.skill('gin',         ['gin gonic']);

  // Databases
  g.skill('postgresql',  ['postgres', 'pg']);
  g.skill('mysql',       []);
  g.skill('sqlite',      []);
  g.skill('sql server',  ['mssql', 'microsoft sql server']);
  g.skill('oracle',      ['oracle db', 'oracle database']);
  g.skill('mongodb',     ['mongo']);
  g.skill('redis',       []);
  g.skill('cassandra',   ['apache cassandra']);
  g.skill('dynamodb',    ['amazon dynamodb']);
  g.skill('firestore',   ['cloud firestore', 'firebase firestore']);
  g.skill('elasticsearch', ['elastic search']);
  g.skill('opensearch',  []);
  g.skill('neo4j',       ['graph database', 'neo4j graph db']);
  g.skill('bigquery',    ['google bigquery']);
  g.skill('snowflake',   []);
  g.skill('pinecone',    ['vector database', 'vector db']);

  // ML / AI
  g.skill('tensorflow',  ['tf']);
  g.skill('pytorch',     ['torch']);
  g.skill('keras',       []);
  g.skill('scikit-learn', ['sklearn', 'scikit learn']);
  g.skill('xgboost',     []);
  g.skill('lightgbm',    ['lgbm']);
  g.skill('catboost',    []);
  g.skill('pandas',      []);
  g.skill('numpy',       []);
  g.skill('matplotlib',  []);
  g.skill('hugging face', ['huggingface', 'hf transformers']);
  g.skill('langchain',   ['lang chain']);
  g.skill('machine learning', ['ml']);
  g.skill('deep learning',    ['dl']);
  g.skill('nlp',         ['natural language processing']);
  g.skill('computer vision',  ['cv', 'image processing']);
  g.skill('data science',     []);
  g.skill('data analysis',    ['data analytics']);
  g.skill('mlops',       []);
  g.skill('llm',         ['large language model', 'large language models']);

  // Cloud & DevOps
  g.skill('aws',         ['amazon web services', 'amazon aws']);
  g.skill('gcp',         ['google cloud', 'google cloud platform']);
  g.skill('azure',       ['microsoft azure', 'azure cloud']);
  g.skill('docker',      []);
  g.skill('kubernetes',  ['k8s']);
  g.skill('terraform',   []);
  g.skill('ansible',     []);
  g.skill('helm',        ['helm charts']);
  g.skill('github actions', ['gh actions']);
  g.skill('gitlab ci',   ['gitlab ci/cd', 'gitlab pipeline']);
  g.skill('jenkins',     []);
  g.skill('circleci',    ['circle ci']);
  g.skill('ci/cd',       ['cicd', 'ci cd']);
  g.skill('devops',      []);
  g.skill('infrastructure as code', ['iac', 'infra as code']);
  g.skill('kafka',       ['apache kafka']);
  g.skill('rabbitmq',    ['rabbit mq']);

  // Testing
  g.skill('jest',        []);
  g.skill('mocha',       []);
  g.skill('vitest',      []);
  g.skill('cypress',     []);
  g.skill('playwright',  []);
  g.skill('pytest',      []);
  g.skill('selenium',    []);

  // Data Engineering
  g.skill('spark',       ['apache spark']);
  g.skill('pyspark',     []);
  g.skill('hadoop',      ['apache hadoop', 'hdfs']);
  g.skill('airflow',     ['apache airflow']);
  g.skill('dbt',         ['data build tool']);
  g.skill('tableau',     []);
  g.skill('power bi',    ['powerbi', 'microsoft power bi']);
  g.skill('looker',      []);

  // Mobile
  g.skill('flutter',     []);
  g.skill('react native', ['rn', 'react-native']);
  g.skill('android',     ['android development']);
  g.skill('ios',         ['ios development']);
  g.skill('jetpack compose', ['compose android']);
  g.skill('swiftui',     ['swift ui']);

  // Security
  g.skill('cybersecurity', ['cyber security', 'information security', 'infosec']);
  g.skill('penetration testing', ['pentesting', 'pen testing', 'ethical hacking']);

  // Tools
  g.skill('git',         ['version control']);
  g.skill('graphql',     ['graph ql']);
  g.skill('rest api',    ['restful', 'restful api', 'rest']);
  g.skill('grpc',        ['gRPC']);
  g.skill('linux',       ['ubuntu', 'unix']);
  g.skill('agile',       ['scrum', 'agile methodology', 'agile scrum']);

  // ── SYNONYM edges (exact equivalents) ───────────────────────────────────
  g.synonym('go',         'golang');
  g.synonym('postgresql', 'postgres');
  g.synonym('kubernetes', 'k8s');
  g.synonym('scikit-learn', 'sklearn');
  g.synonym('javascript', 'js');
  g.synonym('typescript', 'ts');
  g.synonym('react',      'reactjs');
  g.synonym('node.js',    'nodejs');
  g.synonym('aws',        'amazon web services');
  g.synonym('gcp',        'google cloud');
  g.synonym('spring boot', 'springboot');
  g.synonym('rest api',   'restful');
  g.synonym('pyspark',    'spark');   // Practical synonym for skill matching

  // ── IMPLIES edges (directed: having A strongly implies knowing B) ────────
  // Frontend Frameworks → Languages
  g.implies('react',       'javascript', 0.92);
  g.implies('react',       'html', 0.80);
  g.implies('react',       'css', 0.75);
  g.implies('vue',         'javascript', 0.90);
  g.implies('vue',         'html', 0.78);
  g.implies('angular',     'typescript', 0.90);
  g.implies('angular',     'javascript', 0.82);
  g.implies('angular',     'html', 0.78);
  g.implies('svelte',      'javascript', 0.85);
  g.implies('next.js',     'react', 0.92);
  g.implies('next.js',     'javascript', 0.90);
  g.implies('nuxt.js',     'vue', 0.90);
  g.implies('nuxt.js',     'javascript', 0.88);
  g.implies('redux',       'react', 0.82);
  g.implies('redux',       'javascript', 0.85);

  // Backend Frameworks → Languages
  g.implies('django',      'python', 0.92);
  g.implies('fastapi',     'python', 0.92);
  g.implies('flask',       'python', 0.90);
  g.implies('express',     'node.js', 0.92);
  g.implies('express',     'javascript', 0.88);
  g.implies('nestjs',      'node.js', 0.90);
  g.implies('nestjs',      'typescript', 0.85);
  g.implies('spring boot', 'java', 0.92);
  g.implies('rails',       'ruby', 0.92);
  g.implies('laravel',     'php', 0.92);
  g.implies('fastify',     'node.js', 0.90);
  g.implies('koa',         'node.js', 0.88);
  g.implies('gin',         'go', 0.92);
  g.implies('asp.net',     'c#', 0.90);

  // ML Libs → Python
  g.implies('tensorflow',  'python', 0.85);
  g.implies('pytorch',     'python', 0.85);
  g.implies('keras',       'tensorflow', 0.90);
  g.implies('keras',       'python', 0.85);
  g.implies('pandas',      'python', 0.88);
  g.implies('numpy',       'python', 0.85);
  g.implies('scikit-learn','python', 0.85);
  g.implies('matplotlib',  'python', 0.85);
  g.implies('xgboost',     'python', 0.80);
  g.implies('lightgbm',    'python', 0.80);
  g.implies('pyspark',     'python', 0.85);
  g.implies('pyspark',     'spark', 0.90);

  // ML Frameworks → ML Domains
  g.implies('tensorflow',  'deep learning', 0.85);
  g.implies('tensorflow',  'machine learning', 0.80);
  g.implies('pytorch',     'deep learning', 0.85);
  g.implies('pytorch',     'machine learning', 0.80);
  g.implies('scikit-learn','machine learning', 0.82);
  g.implies('hugging face','nlp', 0.88);
  g.implies('hugging face','machine learning', 0.80);
  g.implies('langchain',   'llm', 0.88);
  g.implies('langchain',   'python', 0.85);
  g.implies('langchain',   'machine learning', 0.72);

  // Data Analysis Tools → Domains
  g.implies('pandas',      'data analysis', 0.78);
  g.implies('pandas',      'data science', 0.68);
  g.implies('numpy',       'data analysis', 0.72);
  g.implies('matplotlib',  'data analysis', 0.70);
  g.implies('tableau',     'data analysis', 0.75);
  g.implies('power bi',    'data analysis', 0.75);

  // DevOps Tools → Domains
  g.implies('docker',      'devops', 0.72);
  g.implies('kubernetes',  'devops', 0.78);
  g.implies('kubernetes',  'docker', 0.80);
  g.implies('terraform',   'infrastructure as code', 0.92);
  g.implies('terraform',   'devops', 0.70);
  g.implies('ansible',     'devops', 0.72);
  g.implies('ansible',     'infrastructure as code', 0.78);
  g.implies('helm',        'kubernetes', 0.85);
  g.implies('github actions', 'ci/cd', 0.88);
  g.implies('gitlab ci',   'ci/cd', 0.88);
  g.implies('jenkins',     'ci/cd', 0.85);
  g.implies('circleci',    'ci/cd', 0.82);
  g.implies('kafka',       'data engineering', 0.72);

  // Database → SQL / Category
  g.implies('postgresql',  'sql', 0.90);
  g.implies('mysql',       'sql', 0.90);
  g.implies('sqlite',      'sql', 0.85);
  g.implies('sql server',  'sql', 0.88);
  g.implies('oracle',      'sql', 0.85);
  g.implies('mongodb',     'nosql', 0.88);  // nosql is implied by mongodb knowledge

  // Data Engineering → Domains
  g.implies('spark',       'data engineering', 0.78);
  g.implies('hadoop',      'data engineering', 0.75);
  g.implies('airflow',     'data engineering', 0.72);
  g.implies('dbt',         'data engineering', 0.70);
  g.implies('kafka',       'data engineering', 0.72);

  // Mobile → Language
  g.implies('flutter',     'dart', 0.92);
  g.implies('react native','javascript', 0.88);
  g.implies('android',     'kotlin', 0.82);
  g.implies('android',     'java', 0.75);
  g.implies('ios',         'swift', 0.92);
  g.implies('jetpack compose', 'kotlin', 0.90);
  g.implies('swiftui',     'swift', 0.92);

  // Test Frameworks → Languages
  g.implies('jest',        'javascript', 0.82);
  g.implies('jest',        'typescript', 0.78);
  g.implies('vitest',      'javascript', 0.82);
  g.implies('cypress',     'javascript', 0.78);
  g.implies('playwright',  'javascript', 0.75);
  g.implies('pytest',      'python', 0.82);

  // ── SUBSTITUTE edges (bidirectional: A ↔ B as job requirement substitutes) ──
  // ML Frameworks (high interchangeability)
  g.sub('tensorflow', 'pytorch',       0.88);
  g.sub('tensorflow', 'keras',         0.85);
  g.sub('pytorch',    'keras',         0.80);
  g.sub('scikit-learn','xgboost',      0.72);
  g.sub('xgboost',    'lightgbm',      0.82);
  g.sub('xgboost',    'catboost',      0.78);
  g.sub('lightgbm',   'catboost',      0.78);
  g.sub('hugging face','langchain',    0.60);

  // Relational Databases
  g.sub('postgresql', 'mysql',         0.82);
  g.sub('postgresql', 'sqlite',        0.72);
  g.sub('postgresql', 'sql server',    0.78);
  g.sub('postgresql', 'oracle',        0.72);
  g.sub('mysql',      'sqlite',        0.75);
  g.sub('mysql',      'sql server',    0.78);

  // NoSQL Databases
  g.sub('mongodb',    'cassandra',     0.62);
  g.sub('mongodb',    'dynamodb',      0.68);
  g.sub('mongodb',    'firestore',     0.70);
  g.sub('mongodb',    'couchdb',       0.75);
  g.sub('redis',      'memcached',     0.82);
  g.sub('elasticsearch','opensearch',  0.90);

  // Cloud Platforms
  g.sub('aws',        'gcp',           0.72);
  g.sub('aws',        'azure',         0.75);
  g.sub('gcp',        'azure',         0.70);

  // Web Frontend Frameworks
  g.sub('react',      'vue',           0.70);
  g.sub('react',      'angular',       0.65);
  g.sub('react',      'svelte',        0.58);
  g.sub('vue',        'angular',       0.62);
  g.sub('vue',        'svelte',        0.60);
  g.sub('next.js',    'nuxt.js',       0.78);
  g.sub('next.js',    'gatsby',        0.68);

  // Web Backend Frameworks
  g.sub('fastapi',    'flask',         0.80);
  g.sub('fastapi',    'django',        0.70);
  g.sub('flask',      'django',        0.75);
  g.sub('express',    'nestjs',        0.72);
  g.sub('express',    'fastify',       0.78);
  g.sub('express',    'koa',           0.75);
  g.sub('spring boot','nestjs',        0.55);  // different language, same role
  g.sub('fastapi',    'express',       0.58);  // different language, same role

  // Languages (same-family)
  g.sub('javascript', 'typescript',    0.85);
  g.sub('java',       'kotlin',        0.78);
  g.sub('java',       'c#',            0.62);
  g.sub('java',       'scala',         0.62);
  g.sub('python',     'r',             0.62);
  g.sub('c++',        'c',             0.72);
  g.sub('c++',        'rust',          0.58);
  g.sub('go',         'rust',          0.58);
  g.sub('go',         'java',          0.55);

  // CI/CD Tools
  g.sub('github actions', 'gitlab ci',  0.85);
  g.sub('github actions', 'jenkins',    0.72);
  g.sub('github actions', 'circleci',   0.78);
  g.sub('jenkins',    'circleci',       0.70);
  g.sub('gitlab ci',  'circleci',       0.72);

  // Container / Orchestration
  g.sub('docker',     'podman',         0.82);
  g.sub('kubernetes', 'nomad',          0.65);

  // IaC
  g.sub('terraform',  'pulumi',         0.78);
  g.sub('terraform',  'ansible',        0.62);

  // Data Streaming
  g.sub('kafka',      'rabbitmq',       0.65);

  // Big Data
  g.sub('spark',      'hadoop',         0.72);
  g.sub('airflow',    'prefect',        0.78);
  g.sub('dbt',        'airflow',        0.60);

  // BI Tools
  g.sub('tableau',    'power bi',       0.82);
  g.sub('tableau',    'looker',         0.72);
  g.sub('power bi',   'looker',         0.72);

  // API paradigms
  g.sub('rest api',   'graphql',        0.68);
  g.sub('rest api',   'grpc',           0.60);
  g.sub('graphql',    'grpc',           0.58);

  // Testing Frameworks
  g.sub('jest',       'mocha',          0.80);
  g.sub('jest',       'vitest',         0.85);
  g.sub('jest',       'jasmine',        0.78);
  g.sub('cypress',    'playwright',     0.82);
  g.sub('cypress',    'selenium',       0.72);
  g.sub('pytest',     'unittest',       0.85);

  // Mobile
  g.sub('flutter',    'react native',   0.70);
  g.sub('android',    'ios',            0.55);

  return g;
}

// ─────────────────────────────────────────────
// MODULE-LEVEL SINGLETON (built once at import)
// ─────────────────────────────────────────────

export const SKILL_GRAPH = buildSkillGraph();

// ─────────────────────────────────────────────
// JOB-SKILL REACHABILITY CACHE
// Caches getAllReachable() results keyed by normalized skill name.
// Safe because the graph is static (never mutated after build).
// ─────────────────────────────────────────────

const REACH_CACHE = new Map<string, Map<string, SkillSimilarity>>();

export function getJobSkillReach(jobSkill: string): Map<string, SkillSimilarity> {
  const key = jobSkill.toLowerCase().trim();
  if (!REACH_CACHE.has(key)) {
    REACH_CACHE.set(key, SKILL_GRAPH.getAllReachable(jobSkill));
  }
  return REACH_CACHE.get(key)!;
}
