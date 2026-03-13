import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Plus, Search, MapPin, Clock, Users, ChevronRight } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import SkillChip from '@/components/shared/SkillChip';
import { MOCK_JOBS } from '@/lib/mock-data';
import { useAdminJobs, useAdminRunMatching } from '@/hooks/api';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-green-50 text-green-700 border-green-200',
  CLOSED: 'bg-gray-100 text-gray-600 border-gray-200',
  DRAFT: 'bg-amber-50 text-amber-700 border-amber-200',
  PAUSED: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function AdminJobs() {
  const [search, setSearch] = useState('');

  const { data: liveJobs } = useAdminJobs();
  const runMatchingMutation = useAdminRunMatching();
  const allJobs = liveJobs ?? MOCK_JOBS;

  const filtered = allJobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black text-brand-oxford">Job Listings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{allJobs.length} active positions</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-semibold bg-brand-oxford text-white px-3.5 py-2 rounded-xl">
          <Plus className="w-3.5 h-3.5" /> Post Job
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search jobs..."
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white outline-none focus:border-brand-oxford transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs found" />
      ) : (
        <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50/80">
                  {['Job Title', 'Company', 'Location', 'Type', 'CTC', 'Openings', 'Deadline', 'Status', ''].map((h, i) => (
                    <th key={i} className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 first:pl-5 last:pr-5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((job, i) => (
                  <motion.tr
                    key={job.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 pl-5">
                      <div>
                        <p className="text-sm font-semibold text-foreground whitespace-nowrap">{job.title}</p>
                        {job.jobSkills?.filter(s => s.type === 'REQUIRED').slice(0, 2).map(s => (
                          <SkillChip key={s.skillId} name={s.skill?.name ?? s.skillId} size="sm" className="mt-1 mr-1" />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{job.company?.name}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <MapPin className="w-3 h-3" />{job.location ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {job.jobType?.replace('_', ' ') ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-brand-oxford whitespace-nowrap">
                      {job.ctcMin != null && job.ctcMax != null ? `₹${job.ctcMin}–${job.ctcMax} LPA` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{job._count?.applications ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border', STATUS_COLORS[job.status ?? 'OPEN'] ?? STATUS_COLORS.OPEN)}>
                        {job.status ?? 'OPEN'}
                      </span>
                    </td>
                    <td className="px-4 py-3 pr-5">
                      <button className="text-xs font-semibold text-brand-oxford flex items-center gap-1 hover:underline whitespace-nowrap">
                        Manage <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
