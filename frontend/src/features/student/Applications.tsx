import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, Calendar } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import { MOCK_APPLICATIONS } from '@/lib/mock-data';
import { useStudentApplications } from '@/hooks/api';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  APPLIED: { label: 'Applied', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-400' },
  SHORTLISTED: { label: 'Shortlisted', color: 'bg-indigo-50 text-indigo-700', dot: 'bg-indigo-500' },
  INTERVIEW_SCHEDULED: { label: 'Interview Scheduled', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  SELECTED: { label: 'Offer Received', color: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
  REJECTED: { label: 'Not Selected', color: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
  WITHDRAWN: { label: 'Withdrawn', color: 'bg-gray-50 text-gray-500', dot: 'bg-gray-300' },
};

const TABS = ['All', 'Active', 'Shortlisted', 'Offered', 'Closed'];

export default function StudentApplications() {
  const [activeTab, setActiveTab] = useState('All');

  const { data: liveApps } = useStudentApplications();
  const apps = liveApps ?? MOCK_APPLICATIONS;

  const counts = {
    Active: apps.filter(a => ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED'].includes(a.status)).length,
    Shortlisted: apps.filter(a => a.status === 'SHORTLISTED').length,
    Offered: apps.filter(a => a.status === 'SELECTED').length,
    Closed: apps.filter(a => ['REJECTED', 'WITHDRAWN'].includes(a.status)).length,
  };

  const filtered = activeTab === 'All' ? apps
    : activeTab === 'Active' ? apps.filter(a => ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED'].includes(a.status))
    : activeTab === 'Shortlisted' ? apps.filter(a => a.status === 'SHORTLISTED')
    : activeTab === 'Offered' ? apps.filter(a => a.status === 'SELECTED')
    : apps.filter(a => ['REJECTED', 'WITHDRAWN'].includes(a.status));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-brand-oxford">My Applications</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{apps.length} total applications</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Applied', value: apps.length, icon: FileText, color: 'text-brand-oxford' },
          { label: 'Active', value: counts.Active, icon: Clock, color: 'text-amber-500' },
          { label: 'Shortlisted', value: counts.Shortlisted, icon: CheckCircle, color: 'text-blue-600' },
          { label: 'Offers', value: counts.Offered, icon: CheckCircle, color: 'text-green-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-border shadow-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
              <s.icon className={cn('w-4 h-4', s.color)} />
            </div>
            <div>
              <p className="text-lg font-black text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'text-xs font-semibold px-3 py-1.5 rounded-lg transition-all',
              activeTab === tab ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab}{tab !== 'All' && counts[tab as keyof typeof counts] !== undefined
              ? ` (${counts[tab as keyof typeof counts]})` : ''}
          </button>
        ))}
      </div>

      {/* Applications list */}
      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No applications" description="Applications matching this filter will appear here." />
      ) : (
        <div className="space-y-3">
          {filtered.map((app, i) => {
            const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.PENDING;
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-border shadow-card p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', cfg.dot)} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{app.job?.title ?? 'Job'}</p>
                      <p className="text-xs text-muted-foreground">{app.job?.company?.name}</p>
                      {app.appliedAt && (
                        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full', cfg.color)}>
                      {cfg.label}
                    </span>
                  </div>
                </div>

                {app.notes && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">{app.notes}</p>
                  </div>
                )}

                {app.status === 'INTERVIEW_SCHEDULED' && app.interviewDate && (
                  <div className="mt-3 bg-amber-50 rounded-xl px-3 py-2 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <p className="text-xs font-semibold text-amber-700">
                      Interview on {new Date(app.interviewDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
