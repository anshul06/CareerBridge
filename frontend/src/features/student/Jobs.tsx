import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Briefcase } from 'lucide-react';
import JobCard from '@/components/shared/JobCard';
import EmptyState from '@/components/shared/EmptyState';
import { MOCK_JOBS, MOCK_MATCH_RESULTS } from '@/lib/mock-data';
import { useJobs, useApplyToJob } from '@/hooks/api';
import { cn } from '@/lib/utils';

const FILTERS = ['All', 'High Match', 'Eligible', 'New', 'Internship', 'Full Time'];

export default function StudentJobs() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const { data: liveJobs } = useJobs({ status: 'OPEN' });
  const applyMutation = useApplyToJob();

  const allJobs = liveJobs ?? MOCK_JOBS;

  const jobsWithMatch = allJobs.map(job => {
    const match = MOCK_MATCH_RESULTS.find(m => m.jobId === job.id);
    return { job, matchScore: match?.overallMatchPercentage, eligibility: match?.eligibilityStatus };
  });

  const filtered = jobsWithMatch.filter(({ job }) => {
    const q = search.toLowerCase();
    const matchesSearch = job.title?.toLowerCase().includes(q) || job.company?.name?.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (activeFilter === 'Internship') return job.jobType === 'INTERNSHIP';
    if (activeFilter === 'Full Time') return job.jobType === 'FULL_TIME';
    if (activeFilter === 'High Match') return (MOCK_MATCH_RESULTS.find(m => m.jobId === job.id)?.overallMatchPercentage ?? 0) >= 75;
    if (activeFilter === 'Eligible') return MOCK_MATCH_RESULTS.find(m => m.jobId === job.id)?.eligibilityStatus === 'ELIGIBLE';
    return true;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-brand-oxford">Job Opportunities</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {allJobs.length} open positions · Sorted by match score
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs, companies..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white outline-none focus:border-brand-oxford focus:ring-2 focus:ring-brand-oxford/10 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-muted-foreground border border-border bg-white px-4 py-2.5 rounded-xl hover:border-brand-oxford/30 transition-colors">
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              'text-xs font-semibold px-3 py-1.5 rounded-full border transition-all',
              activeFilter === f
                ? 'bg-brand-oxford text-white border-brand-oxford'
                : 'bg-white text-muted-foreground border-border hover:border-brand-oxford/30',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs found" description="Try a different search or filter." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(({ job, matchScore, eligibility }, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <JobCard
                job={job}
                matchScore={matchScore}
                eligibility={eligibility}
                onApply={() => applyMutation.mutate(job.id)}
                onClick={() => {}}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
