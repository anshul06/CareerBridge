import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, Info, GraduationCap } from 'lucide-react';
import SectionCard from '@/components/shared/SectionCard';
import EligibilityBadge from '@/components/shared/EligibilityBadge';
import { MOCK_MATCH_RESULTS, MOCK_JOBS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function StudentEligibility() {
  const checks = [
    { label: 'CGPA', value: '8.45', required: '≥ 7.0', pass: true },
    { label: 'Active Backlogs', value: '0', required: '0 backlogs', pass: true },
    { label: 'Branch', value: 'CSE', required: 'CSE / AI&DS / IT', pass: true },
    { label: 'Graduation Year', value: '2026', required: '2026', pass: true },
  ];

  const jobEligibility = MOCK_JOBS.map(job => {
    const match = MOCK_MATCH_RESULTS.find(m => m.jobId === job.id);
    return { job, status: match?.eligibilityStatus ?? 'INELIGIBLE', reasons: match?.eligibilityReasons ?? [] };
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-black text-brand-oxford">Eligibility Status</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your current placement eligibility based on academic criteria</p>
      </div>

      {/* Overall status */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5"
      >
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div>
            <p className="text-base font-black text-green-800">You are Placement Eligible</p>
            <p className="text-xs text-green-600 mt-0.5">All criteria passed · Eligible for 12 open positions</p>
          </div>
        </div>
      </motion.div>

      {/* Criteria checks */}
      <SectionCard title="Eligibility Criteria" icon={GraduationCap}>
        <div className="space-y-3">
          {checks.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80"
            >
              <div className="flex items-center gap-3">
                {c.pass
                  ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                }
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.label}</p>
                  <p className="text-xs text-muted-foreground">Required: {c.required}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn('text-sm font-bold', c.pass ? 'text-green-700' : 'text-red-600')}>{c.value}</p>
                <span className={cn('text-[11px] font-semibold', c.pass ? 'text-green-600' : 'text-red-500')}>
                  {c.pass ? 'Passed' : 'Failed'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      {/* Per-job eligibility */}
      <SectionCard title="Eligibility by Job" subtitle="Company-specific criteria may differ">
        <div className="space-y-3">
          {jobEligibility.map(({ job, status, reasons }, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50/80 border border-border"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{job.title}</p>
                <p className="text-xs text-muted-foreground">{job.company?.name}</p>
                {reasons && reasons.length > 0 && (
                  <div className="mt-1.5 space-y-0.5">
                    {reasons.slice(0, 2).map((r: string, j: number) => (
                      <p key={j} className="text-[11px] text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />{r}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <EligibilityBadge status={status as any} />
            </motion.div>
          ))}
        </div>
      </SectionCard>

      {/* Info box */}
      <div className="flex gap-3 bg-brand-oxford/5 border border-brand-oxford/15 rounded-xl p-4">
        <Info className="w-4 h-4 text-brand-oxford flex-shrink-0 mt-0.5" />
        <p className="text-xs text-brand-oxford/80 leading-relaxed">
          Eligibility is automatically computed from your academic record. Contact the placement cell if you believe there is an error.
          Partially eligible students may apply but will be flagged for manual review.
        </p>
      </div>
    </div>
  );
}
