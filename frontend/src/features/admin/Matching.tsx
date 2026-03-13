import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, RefreshCw, Target, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';
import SectionCard from '@/components/shared/SectionCard';
import MatchScoreBadge from '@/components/shared/MatchScoreBadge';
import EligibilityBadge from '@/components/shared/EligibilityBadge';
import SkillChip from '@/components/shared/SkillChip';
import { MOCK_MATCH_RESULTS, MOCK_JOBS } from '@/lib/mock-data';
import { useAdminJobs, useAdminRunMatching, useMatchResults } from '@/hooks/api';
import { cn } from '@/lib/utils';

function ScoreBar({ label, value, color = 'bg-brand-oxford' }: { label: string; value: number; color?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold text-foreground">{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn('h-full rounded-full', color)}
        />
      </div>
    </div>
  );
}

function ScoreBreakdown({ match }: { match: any }) {
  const scores = [
    { label: 'Required Skills', value: match.requiredSkillCoverage ?? 0, color: 'bg-brand-oxford' },
    { label: 'Preferred Skills', value: match.preferredSkillCoverage ?? 0, color: 'bg-blue-400' },
    { label: 'Academic Fit', value: match.academicFit ?? 0, color: 'bg-green-500' },
    { label: 'Project Relevance', value: match.projectRelevance ?? 0, color: 'bg-amber-500' },
    { label: 'Certifications', value: match.certificationRelevance ?? 0, color: 'bg-purple-500' },
    { label: 'Semantic Match', value: match.semanticSimilarity ?? 0, color: 'bg-teal-500' },
  ];

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-3">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Score Breakdown</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
        {scores.map((s, i) => <ScoreBar key={i} {...s} />)}
      </div>

      {/* Reason summary */}
      {match.reasonSummary && (
        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
          <p className="text-[11px] font-semibold text-foreground mb-0.5">AI Recommendation</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{match.reasonSummary}</p>
        </div>
      )}

      {match.matchedSkills && match.matchedSkills.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">Matched Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {(match.matchedSkills as any[]).map((s, i) => (
              <SkillChip key={i} name={s.skillName} variant="matched" size="sm" />
            ))}
          </div>
        </div>
      )}
      {match.missingSkills && match.missingSkills.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">Missing Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {(match.missingSkills as string[]).map((s, i) => (
              <SkillChip key={i} name={s} variant="missing" size="sm" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchRow({ match }: { match: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-border p-4 hover:border-brand-oxford/20 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-oxford/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-brand-oxford">{match.studentProfile?.firstName?.charAt(0) ?? 'S'}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">{match.studentProfile ? `${match.studentProfile.firstName} ${match.studentProfile.lastName}` : 'Student'}</p>
          <p className="text-xs text-muted-foreground">{match.job?.title} · {match.job?.company?.name}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <EligibilityBadge status={match.eligibilityStatus} />
          <MatchScoreBadge score={match.overallMatchPercentage} size="sm" />
          <button onClick={() => setExpanded(v => !v)} className="text-muted-foreground hover:text-foreground">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {expanded && <ScoreBreakdown match={match} />}
    </motion.div>
  );
}

export default function AdminMatching() {
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [ran, setRan] = useState(false);

  const { data: liveJobs } = useAdminJobs();
  const runMatchingMutation = useAdminRunMatching();
  const { data: liveResults } = useMatchResults(selectedJob !== 'all' ? selectedJob : '');

  const allJobs = liveJobs ?? MOCK_JOBS;
  const allMatches = (selectedJob !== 'all' && liveResults ? liveResults : null) ?? MOCK_MATCH_RESULTS;

  const handleRun = () => {
    if (selectedJob === 'all') return;
    runMatchingMutation.mutate(selectedJob, { onSuccess: () => setRan(true) });
    if (!runMatchingMutation.isPending) setRan(false);
  };

  const filtered = selectedJob === 'all'
    ? allMatches
    : allMatches.filter(m => m.jobId === selectedJob);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-brand-oxford">AI Matching Engine</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Run batch matching and explore explainable match results</p>
      </div>

      {/* Run controls */}
      <SectionCard title="Run Matching" icon={Sparkles}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Select Job</label>
            <select
              value={selectedJob}
              onChange={e => setSelectedJob(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-white outline-none focus:border-brand-oxford transition-all"
            >
              <option value="all">All Jobs</option>
              {allJobs.map(j => (
                <option key={j.id} value={j.id}>{j.title} — {j.company?.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRun}
              disabled={runMatchingMutation.isPending || selectedJob === 'all'}
              className="flex items-center gap-2 bg-brand-oxford text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-60 transition-opacity"
            >
              {runMatchingMutation.isPending
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Running...</>
                : <><Play className="w-4 h-4" /> Run AI Matching</>
              }
            </button>
          </div>
        </div>
        {ran && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-2.5 rounded-xl border border-green-200"
          >
            <CheckCircle className="w-4 h-4" />
            Matching complete — {MOCK_MATCH_RESULTS.length} results computed
          </motion.div>
        )}
      </SectionCard>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Matches', value: filtered.length },
          { label: 'High Matches (≥70%)', value: filtered.filter(m => m.overallMatchPercentage >= 70).length },
          { label: 'Eligible', value: filtered.filter(m => m.eligibilityStatus === 'ELIGIBLE').length },
          { label: 'Avg Score', value: `${Math.round(filtered.reduce((s, m) => s + m.overallMatchPercentage, 0) / (filtered.length || 1))}%` },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-border shadow-card p-4 text-center">
            <p className="text-xl font-black text-brand-oxford">{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Match results */}
      <SectionCard title="Match Results" subtitle="Click any row to expand score breakdown" icon={Target}>
        <div className="space-y-2.5">
          {filtered.map(match => (
            <MatchRow key={match.id} match={match} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
