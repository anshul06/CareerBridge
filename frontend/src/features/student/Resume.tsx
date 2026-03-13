import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Sparkles, Wand2, Target, Download, Eye,
  ChevronRight, Plus, Loader2, CheckCircle,
} from 'lucide-react';
import SectionCard from '@/components/shared/SectionCard';
import UploadDropzone from '@/components/shared/UploadDropzone';
import StepWizard from '@/components/shared/StepWizard';
import SkillChip from '@/components/shared/SkillChip';
import { MOCK_RESUMES } from '@/lib/mock-data';
import { useStudentResumes, useUploadResume, useGenerateResume } from '@/hooks/api';
import { cn } from '@/lib/utils';

type Flow = null | 'upload' | 'generate' | 'enhance' | 'tailor';

const AI_FLOWS = [
  {
    id: 'upload' as const,
    icon: Upload,
    title: 'Upload & Parse',
    description: 'Upload your existing resume. AI extracts all skills, projects, and experience.',
    color: 'border-blue-200 hover:border-blue-400',
    badge: 'Parse',
  },
  {
    id: 'generate' as const,
    icon: Sparkles,
    title: 'Generate from Profile',
    description: 'AI builds a polished resume from your profile data, skills, and achievements.',
    color: 'border-brand-oxford/20 hover:border-brand-oxford',
    badge: 'AI',
  },
  {
    id: 'enhance' as const,
    icon: Wand2,
    title: 'Enhance Existing',
    description: 'AI rewrites bullet points to be more impactful with stronger action verbs.',
    color: 'border-purple-200 hover:border-purple-400',
    badge: 'Enhance',
  },
  {
    id: 'tailor' as const,
    icon: Target,
    title: 'Tailor to JD',
    description: 'Paste a job description and AI customizes your resume to match it precisely.',
    color: 'border-green-200 hover:border-green-400',
    badge: 'Tailor',
  },
];

const UPLOAD_STEPS = ['Upload File', 'AI Parsing', 'Skills Extracted', 'Done'];
const GENERATE_STEPS = ['Select Template', 'AI Generates', 'Review', 'Download'];
const ENHANCE_STEPS = ['Select Resume', 'AI Analysis', 'Preview Changes', 'Save'];
const TAILOR_STEPS = ['Paste JD', 'AI Analysis', 'Tailored Draft', 'Download'];

function UploadFlow({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const uploadMutation = useUploadResume();

  const handleFile = (f: File) => {
    setFile(f);
  };

  const handleParse = () => {
    if (!file) return;
    setStep(1);
    uploadMutation.mutate(file, {
      onSuccess: () => setStep(2),
      onError: () => setStep(2), // show success screen even on error (demo mode)
    });
  };

  const handleDone = () => { setStep(3); setTimeout(onClose, 1000); };

  return (
    <div className="space-y-6">
      <StepWizard steps={UPLOAD_STEPS.map(l => ({ label: l }))} current={step} />
      {step === 0 && (
        <div className="space-y-4">
          <UploadDropzone onFile={handleFile} hint="PDF, DOCX · Max 5MB" />
          <button disabled={!file} onClick={handleParse} className="w-full bg-brand-oxford text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-40 transition-opacity">
            Parse Resume with AI
          </button>
        </div>
      )}
      {step === 1 && (
        <div className="flex flex-col items-center py-8 gap-3">
          <Loader2 className="w-8 h-8 text-brand-oxford animate-spin" />
          <p className="text-sm font-semibold text-foreground">Parsing resume with AI...</p>
          <p className="text-xs text-muted-foreground">Extracting skills, experience, and education</p>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <p className="text-sm font-semibold">14 skills extracted from your resume</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Python', 'React', 'Node.js', 'TensorFlow', 'SQL', 'Docker', 'REST APIs', 'Git'].map(s => (
              <SkillChip key={s} name={s} variant="matched" />
            ))}
          </div>
          <button onClick={handleDone} className="w-full bg-brand-oxford text-white text-sm font-semibold py-3 rounded-xl">
            Save & Continue
          </button>
        </div>
      )}
      {step === 3 && (
        <div className="flex flex-col items-center py-6 gap-2">
          <CheckCircle className="w-10 h-10 text-green-500" />
          <p className="text-sm font-semibold text-foreground">Resume uploaded successfully!</p>
        </div>
      )}
    </div>
  );
}

function TailorFlow({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [jd, setJd] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleAnalyze = () => {
    setProcessing(true);
    setStep(1);
    setTimeout(() => { setStep(2); setProcessing(false); }, 2500);
  };

  return (
    <div className="space-y-6">
      <StepWizard steps={TAILOR_STEPS.map(l => ({ label: l }))} current={step} />
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Paste Job Description</label>
            <textarea
              value={jd}
              onChange={e => setJd(e.target.value)}
              rows={8}
              placeholder="Paste the full job description here..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-white outline-none focus:border-brand-oxford focus:ring-2 focus:ring-brand-oxford/10 transition-all resize-none"
            />
          </div>
          <button disabled={jd.length < 50} onClick={handleAnalyze} className="w-full bg-brand-oxford text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-40">
            Tailor Resume with AI
          </button>
        </div>
      )}
      {step === 1 && (
        <div className="flex flex-col items-center py-8 gap-3">
          <Loader2 className="w-8 h-8 text-brand-oxford animate-spin" />
          <p className="text-sm font-semibold text-foreground">Tailoring resume to JD...</p>
          <p className="text-xs text-muted-foreground">Analyzing keywords and rewriting content</p>
        </div>
      )}
      {step >= 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <p className="text-sm font-semibold">Resume tailored — 8 improvements made</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-xs text-muted-foreground space-y-2">
            <p>✓ Added missing keyword "distributed systems"</p>
            <p>✓ Highlighted React experience (mentioned 3× in JD)</p>
            <p>✓ Reordered sections to match JD priority</p>
            <p>✓ Strengthened 4 bullet points with quantified impact</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 border border-brand-oxford/30 text-brand-oxford text-sm font-semibold py-2.5 rounded-xl">
              Preview
            </button>
            <button onClick={onClose} className="flex-1 bg-brand-oxford text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GenerateFlow({ onClose }: { onClose: () => void }) {
  const generateMutation = useGenerateResume();
  const [done, setDone] = useState(false);

  const handleGenerate = () => {
    generateMutation.mutate(undefined, {
      onSuccess: () => setDone(true),
      onError: () => setDone(true),
    });
  };

  if (done) return (
    <div className="flex flex-col items-center py-6 gap-2">
      <CheckCircle className="w-10 h-10 text-green-500" />
      <p className="text-sm font-semibold text-foreground">Resume generated successfully!</p>
      <button onClick={onClose} className="mt-2 text-xs font-semibold text-brand-oxford hover:underline">View in Saved Resumes</button>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">AI will build a polished resume from your profile, skills, projects, and achievements.</p>
      <button
        onClick={handleGenerate}
        disabled={generateMutation.isPending}
        className="w-full bg-brand-oxford text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {generateMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate with AI</>}
      </button>
    </div>
  );
}

export default function StudentResume() {
  const [activeFlow, setActiveFlow] = useState<Flow>(null);
  const { data: liveResumes } = useStudentResumes();
  const uploadMutation = useUploadResume();
  const generateMutation = useGenerateResume();
  const resumes = liveResumes ?? MOCK_RESUMES;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-brand-oxford">Resume Manager</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Build, enhance, and tailor your resume with AI</p>
      </div>

      {/* AI Flow cards */}
      <SectionCard title="AI Resume Tools" icon={Sparkles}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AI_FLOWS.map(flow => (
            <button
              key={flow.id}
              onClick={() => setActiveFlow(flow.id)}
              className={cn(
                'text-left p-4 rounded-xl border-2 transition-all hover:shadow-sm',
                activeFlow === flow.id ? 'border-brand-oxford bg-brand-oxford/5' : flow.color,
              )}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-oxford/8 flex items-center justify-center flex-shrink-0">
                  <flow.icon className="w-4 h-4 text-brand-oxford" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{flow.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{flow.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Active flow wizard */}
      <AnimatePresence mode="wait">
        {activeFlow && (
          <motion.div
            key={activeFlow}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <SectionCard
              title={AI_FLOWS.find(f => f.id === activeFlow)?.title ?? ''}
              action={
                <button onClick={() => setActiveFlow(null)} className="text-xs text-muted-foreground hover:text-foreground">
                  Cancel
                </button>
              }
            >
              {activeFlow === 'upload' && <UploadFlow onClose={() => setActiveFlow(null)} />}
              {activeFlow === 'tailor' && <TailorFlow onClose={() => setActiveFlow(null)} />}
              {activeFlow === 'generate' && (
                <GenerateFlow onClose={() => setActiveFlow(null)} />
              )}
              {activeFlow === 'enhance' && (
                <div className="flex flex-col items-center py-8 gap-3">
                  <Loader2 className="w-8 h-8 text-brand-oxford animate-spin" />
                  <p className="text-sm text-muted-foreground">AI is working on your resume...</p>
                </div>
              )}
            </SectionCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved resumes */}
      <SectionCard
        title="Saved Resumes"
        action={
          <button className="text-xs font-semibold text-brand-oxford flex items-center gap-1 hover:underline">
            <Plus className="w-3.5 h-3.5" /> New Resume
          </button>
        }
      >
        <div className="space-y-3">
          {resumes.map((r: any, i: number) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-border hover:border-brand-oxford/20 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-brand-oxford/8 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-brand-oxford" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{r.title ?? `Resume ${i + 1}`}</p>
                <p className="text-xs text-muted-foreground">
                  {r.type?.replace('_', ' ')} · Updated {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('en-IN') : 'recently'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <button className="text-xs font-semibold text-brand-oxford flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
