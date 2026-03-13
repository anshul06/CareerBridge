import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, SlidersHorizontal, Search } from 'lucide-react';
import CandidateMatchCard from '@/components/shared/CandidateMatchCard';
import EmptyState from '@/components/shared/EmptyState';
import { MOCK_MATCH_RESULTS, MOCK_JOBS } from '@/lib/mock-data';
import { useJobs, useJobMatches } from '@/hooks/api';
import { cn } from '@/lib/utils';

export default function RecruiterMatches() {
  const [selectedJob, setSelectedJob] = useState('all');
  const [search, setSearch] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());

  const toggleShortlist = (id: string) => {
    setShortlisted(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const { data: liveJobs } = useJobs();
  const { data: liveMatches } = useJobMatches(selectedJob !== 'all' ? selectedJob : '');

  const allJobs = liveJobs ?? MOCK_JOBS;
  const allMatches = (selectedJob !== 'all' && liveMatches ? liveMatches : null) ?? MOCK_MATCH_RESULTS;

  const filtered = allMatches.filter(m => {
    const matchJob = selectedJob === 'all' || m.jobId === selectedJob;
    const matchScore = m.overallMatchPercentage >= minScore;
    const studentName = m.studentProfile ? `${m.studentProfile.firstName} ${m.studentProfile.lastName}` : '';
    const matchSearch = !search || studentName.toLowerCase().includes(search.toLowerCase());
    return matchJob && matchScore && matchSearch;
  }).sort((a, b) => b.overallMatchPercentage - a.overallMatchPercentage);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-brand-oxford">Candidate Matches</h1>
        <p className="text-sm text-muted-foreground mt-0.5">AI-ranked candidates for your job listings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search candidates..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white outline-none focus:border-brand-oxford transition-all"
          />
        </div>
        <select
          value={selectedJob}
          onChange={e => setSelectedJob(e.target.value)}
          className="text-sm px-3.5 py-2.5 rounded-xl border border-border bg-white outline-none focus:border-brand-oxford transition-all"
        >
          <option value="all">All Jobs</option>
          {allJobs.map(j => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Min score:</span>
          {[0, 50, 70, 85].map(s => (
            <button
              key={s}
              onClick={() => setMinScore(s)}
              className={cn(
                'text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all',
                minScore === s ? 'bg-brand-oxford text-white border-brand-oxford' : 'bg-white text-muted-foreground border-border',
              )}
            >
              {s === 0 ? 'All' : `${s}%+`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 text-sm">
        <span className="text-muted-foreground">{filtered.length} candidates</span>
        <span className="text-green-600 font-semibold">{filtered.filter(m => m.overallMatchPercentage >= 70).length} high matches</span>
        <span className="text-blue-600 font-semibold">{shortlisted.size} shortlisted</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Target} title="No matches found" description="Try adjusting your filters or run AI matching." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((match, i) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <CandidateMatchCard
                match={match}
                onView={() => {}}
                onShortlist={() => toggleShortlist(match.id)}
                isShortlisted={shortlisted.has(match.id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
