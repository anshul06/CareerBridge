import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, BrainCircuit, Target, FileText, Users, BarChart3, CheckCircle,
  ArrowRight, GraduationCap, Building2, Shield, Zap, ChevronRight,
} from 'lucide-react';

const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'AI-Powered Matching',
    description: 'Multi-layer matching engine scores candidates on skills, academics, projects, and certifications with full explainability.',
  },
  {
    icon: FileText,
    title: 'Smart Resume Builder',
    description: 'Generate, enhance, and tailor resumes to specific JDs using GPT-4o. Extract skills automatically from any resume.',
  },
  {
    icon: Target,
    title: 'Eligibility Engine',
    description: 'Automatically gate students by CGPA, backlogs, branch, and graduation year — eliminating manual screening.',
  },
  {
    icon: BarChart3,
    title: 'Placement Analytics',
    description: 'Real-time dashboards for placement cells: track offers, match rates, skill gaps, and company engagement.',
  },
  {
    icon: Users,
    title: 'Recruiter Workspace',
    description: 'JD parser, ranked candidate matches, one-click shortlisting, and collaborative hiring workflows.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description: 'Three distinct portals — Student, Admin, and Recruiter — each with tailored workflows and permissions.',
  },
];

const HOW_IT_WORKS = [
  { role: 'Students', color: 'bg-brand-oxford', steps: ['Upload resume or build with AI', 'Skills extracted automatically', 'Browse matched jobs with score', 'Apply with one click'] },
  { role: 'Placement Cell', color: 'bg-brand-tan-600', steps: ['Onboard companies and post JDs', 'AI matches students to jobs', 'Generate ranked shortlists', 'Track offers and analytics'] },
  { role: 'Recruiters', color: 'bg-green-600', steps: ['Upload job description (PDF/text)', 'AI parses requirements instantly', 'Review ranked, eligible candidates', 'Shortlist and schedule interviews'] },
];

const STATS = [
  { value: '98%', label: 'Matching accuracy' },
  { value: '3×', label: 'Faster shortlisting' },
  { value: '500+', label: 'Skills taxonomy' },
  { value: '<2s', label: 'Match computation' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-oxford flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-tan-300" />
            </div>
            <span className="font-bold text-brand-oxford text-sm">DSU CareerBridge</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Login</Link>
            <Link
              to="/login"
              className="text-sm font-semibold bg-brand-oxford text-white px-4 py-1.5 rounded-lg hover:bg-brand-oxford/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-brand-oxford/6 text-brand-oxford text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
          >
            <Zap className="w-3.5 h-3.5" />
            Powered by GPT-4o · Built for campus placements
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-brand-oxford leading-tight tracking-tight mb-6"
          >
            AI-Powered Campus<br />
            <span className="text-brand-tan-600">Placement Platform</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            DSU CareerBridge connects students, placement cells, and recruiters through intelligent skill matching,
            AI resume tools, and automated eligibility screening — eliminating manual effort from campus hiring.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to="/login"
              className="flex items-center gap-2 bg-brand-oxford text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-oxford/90 transition-all shadow-lg shadow-brand-oxford/20"
            >
              Explore Demo <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works" className="flex items-center gap-2 text-sm font-semibold text-brand-oxford hover:text-brand-oxford/80 transition-colors">
              See how it works <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-brand-oxford">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <p className="text-3xl font-black text-brand-tan-300">{s.value}</p>
              <p className="text-xs text-white/60 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-brand-oxford mb-3">Everything campus hiring needs</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">A unified platform with AI at every step — from resume parsing to ranked shortlists.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white border border-border rounded-2xl p-6 hover:shadow-md hover:border-brand-oxford/20 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-oxford/8 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-brand-oxford" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-brand-oxford mb-3">Built for every stakeholder</h2>
            <p className="text-muted-foreground text-sm">Three distinct workflows, one unified platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-border shadow-card overflow-hidden"
              >
                <div className={`${r.color} px-5 py-4`}>
                  <p className="text-sm font-bold text-white">{r.role}</p>
                </div>
                <div className="p-5 space-y-3">
                  {r.steps.map((step, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand-oxford/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-brand-oxford">{j + 1}</span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Role portals */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-brand-oxford mb-3">Try the demo</h2>
            <p className="text-muted-foreground text-sm">Explore any role with pre-loaded demo credentials.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { role: 'Student', icon: GraduationCap, desc: 'Browse jobs, manage resume, track applications', color: 'border-brand-oxford/30 hover:border-brand-oxford' },
              { role: 'Admin', icon: Shield, desc: 'Manage placements, run AI matching, analytics', color: 'border-brand-tan-400 hover:border-brand-tan-500' },
              { role: 'Recruiter', icon: Building2, desc: 'Parse JDs, review matches, shortlist candidates', color: 'border-green-300 hover:border-green-500' },
            ].map((p, i) => (
              <Link key={i} to="/login">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`bg-white border-2 ${p.color} rounded-2xl p-6 text-center cursor-pointer hover:shadow-md transition-all`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-oxford/6 flex items-center justify-center mx-auto mb-3">
                    <p.icon className="w-6 h-6 text-brand-oxford" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-bold text-foreground mb-1">{p.role} Portal</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                  <div className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-brand-oxford">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-brand-oxford">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-6 h-6 text-brand-tan-300" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Ready to modernize campus hiring?</h2>
          <p className="text-white/60 text-sm mb-8">Sign in and explore the full AI-powered platform with realistic demo data.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-brand-tan-400 text-brand-oxford font-bold px-8 py-3.5 rounded-xl hover:bg-brand-tan-300 transition-colors"
          >
            Open Platform <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-brand-oxford flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-brand-tan-300" />
            </div>
            <span className="text-xs font-bold text-brand-oxford">DSU CareerBridge</span>
          </div>
          <p className="text-xs text-muted-foreground">Dayananda Sagar University · AI-Powered Placement Platform</p>
        </div>
      </footer>
    </div>
  );
}
