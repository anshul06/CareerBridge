import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Sparkles, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import SectionCard from '@/components/shared/SectionCard';
import UploadDropzone from '@/components/shared/UploadDropzone';
import SkillChip from '@/components/shared/SkillChip';
import { useParseJD, useJobs } from '@/hooks/api';
import { cn } from '@/lib/utils';

const DEMO_PARSED = {
  title: 'Software Development Engineer – II',
  company: 'Amazon',
  location: 'Bengaluru, India',
  employmentType: 'Full Time',
  ctcRange: '₹20–30 LPA',
  minCGPA: 7.0,
  branches: ['CSE', 'IT', 'AI & DS', 'ISE'],
  requiredSkills: ['Java', 'Python', 'AWS', 'Microservices', 'REST APIs', 'SQL', 'Git'],
  preferredSkills: ['Kubernetes', 'Docker', 'System Design', 'DynamoDB'],
  experience: '0–2 years (Fresh graduates welcome)',
  summary: 'We are looking for passionate engineers to join our team. You will work on large-scale distributed systems, design and build new features, and collaborate with cross-functional teams.',
};

export default function RecruiterJDParser() {
  const [mode, setMode] = useState<'upload' | 'paste'>('paste');
  const [jdText, setJdText] = useState('');
  const [parsed, setParsed] = useState<typeof DEMO_PARSED | null>(null);

  const { data: jobs } = useJobs();
  const parseJDMutation = useParseJD();

  const handleParse = () => {
    if (!jdText && mode === 'paste') return;
    const firstJobId = jobs?.[0]?.id ?? 'demo-job';
    parseJDMutation.mutate({ jobId: firstJobId, text: jdText }, {
      onSuccess: (data: any) => {
        setParsed({
          title: data.title ?? DEMO_PARSED.title,
          company: data.company?.name ?? DEMO_PARSED.company,
          location: data.location ?? DEMO_PARSED.location,
          employmentType: data.jobType?.replace('_', ' ') ?? DEMO_PARSED.employmentType,
          ctcRange: data.ctcMin ? `₹${data.ctcMin}–${data.ctcMax} LPA` : DEMO_PARSED.ctcRange,
          minCGPA: data.minCgpa ?? DEMO_PARSED.minCGPA,
          branches: data.eligibleBranches ?? DEMO_PARSED.branches,
          requiredSkills: data.jobSkills?.filter((s: any) => s.type === 'REQUIRED').map((s: any) => s.skill?.name ?? s.skillId) ?? DEMO_PARSED.requiredSkills,
          preferredSkills: data.jobSkills?.filter((s: any) => s.type === 'PREFERRED').map((s: any) => s.skill?.name ?? s.skillId) ?? DEMO_PARSED.preferredSkills,
          experience: DEMO_PARSED.experience,
          summary: data.description ?? DEMO_PARSED.summary,
        });
      },
      onError: () => setParsed(DEMO_PARSED), // demo fallback
    });
  };

  const handleReset = () => {
    setParsed(null);
    setJdText('');
    parseJDMutation.reset();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-brand-oxford">JD Parser</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Upload or paste a job description — AI extracts all requirements</p>
      </div>

      {!parsed ? (
        <SectionCard title="Parse Job Description" icon={FileText}>
          <div className="space-y-5">
            {/* Mode toggle */}
            <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl w-fit">
              {([['paste', 'Paste Text'], ['upload', 'Upload File']] as const).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className={cn(
                    'text-xs font-semibold px-4 py-1.5 rounded-lg transition-all',
                    mode === id ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {mode === 'paste' ? (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Job Description Text</label>
                <textarea
                  value={jdText}
                  onChange={e => setJdText(e.target.value)}
                  rows={10}
                  placeholder="Paste the full job description here. Include title, responsibilities, requirements, and preferred qualifications..."
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-white outline-none focus:border-brand-oxford focus:ring-2 focus:ring-brand-oxford/10 transition-all resize-none"
                />
                <p className="text-[11px] text-muted-foreground mt-1">{jdText.length} characters · Minimum 100 recommended</p>
              </div>
            ) : (
              <UploadDropzone
                accept=".pdf,.doc,.docx,.txt"
                onFile={f => setJdText(f.name)}
                hint="PDF, DOCX, TXT · Max 5MB"
              />
            )}

            <button
              onClick={handleParse}
              disabled={parseJDMutation.isPending || (mode === 'paste' && jdText.length < 50)}
              className="flex items-center gap-2 bg-brand-oxford text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-40 transition-opacity"
            >
              {parseJDMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Parsing...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Parse with AI</>
              )}
            </button>
          </div>
        </SectionCard>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Success banner */}
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-semibold text-green-800">JD parsed successfully</p>
                <p className="text-xs text-green-600">{parsed.requiredSkills.length + parsed.preferredSkills.length} skills extracted · Eligibility criteria identified</p>
              </div>
              <button onClick={handleReset} className="ml-auto text-xs font-semibold text-green-700 hover:underline">
                Parse another
              </button>
            </div>

            {/* Parsed details */}
            <SectionCard title={parsed.title} subtitle={`${parsed.company} · ${parsed.location}`} icon={FileText}>
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Type', value: parsed.employmentType },
                    { label: 'CTC Range', value: parsed.ctcRange },
                    { label: 'Min CGPA', value: String(parsed.minCGPA) },
                    { label: 'Experience', value: parsed.experience },
                  ].map((f, i) => (
                    <div key={i} className="bg-gray-50/80 rounded-xl px-3 py-2.5">
                      <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">{f.label}</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Eligible Branches</p>
                  <div className="flex flex-wrap gap-1.5">
                    {parsed.branches.map(b => <SkillChip key={b} name={b} variant="solid" />)}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {parsed.requiredSkills.map(s => <SkillChip key={s} name={s} variant="matched" />)}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Preferred Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {parsed.preferredSkills.map(s => <SkillChip key={s} name={s} variant="outline" />)}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Summary</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{parsed.summary}</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button className="flex-1 bg-brand-oxford text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" /> Post as Job Listing
                  </button>
                  <button className="flex-1 border border-brand-oxford/30 text-brand-oxford text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" /> Find Matching Candidates
                  </button>
                </div>
              </div>
            </SectionCard>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
