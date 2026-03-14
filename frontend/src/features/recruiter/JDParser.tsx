import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import SectionCard from '@/components/shared/SectionCard';
import UploadDropzone from '@/components/shared/UploadDropzone';
import SkillChip from '@/components/shared/SkillChip';
import { parseJobDescriptionSkills } from '@/lib/resume-parser';
import { cn } from '@/lib/utils';

interface ParsedJD {
  title: string;
  company: string;
  location: string;
  employmentType: string;
  ctcRange: string;
  minCGPA: number;
  branches: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  experience: string;
  summary: string;
}

const JD_METADATA_DEFAULTS: Omit<ParsedJD, 'requiredSkills' | 'preferredSkills'> = {
  title: 'Software Engineer',
  company: '—',
  location: '—',
  employmentType: 'Full Time',
  ctcRange: '—',
  minCGPA: 0,
  branches: [],
  experience: 'Fresher / 0–2 years',
  summary: '',
};

export default function RecruiterJDParser() {
  const [mode, setMode] = useState<'upload' | 'paste'>('paste');
  const [jdText, setJdText] = useState('');
  const [parsed, setParsed] = useState<ParsedJD | null>(null);
  const [parsing, setParsing] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (f.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (ev) => setJdText((ev.target?.result as string) ?? '');
      reader.readAsText(f);
    }
  }, []);

  const handleParse = () => {
    if (!jdText.trim()) return;
    setParsing(true);
    setTimeout(() => {
      const { requiredSkills, preferredSkills } = parseJobDescriptionSkills(jdText);
      setParsed({ ...JD_METADATA_DEFAULTS, requiredSkills, preferredSkills });
      setParsing(false);
    }, 400);
  };

  const handleReset = () => {
    setParsed(null);
    setJdText('');
    setParsing(false);
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
                accept=".txt"
                onFile={handleFile}
                hint="TXT · Max 5MB"
              />
            )}

            <button
              onClick={handleParse}
              disabled={parsing || jdText.length < 50}
              className="flex items-center gap-2 bg-brand-oxford text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-40 transition-opacity"
            >
              {parsing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Parsing...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Extract Skills</>
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
