import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Mail, Trash2, Users } from 'lucide-react';
import SectionCard from '@/components/shared/SectionCard';
import EmptyState from '@/components/shared/EmptyState';
import MatchScoreBadge from '@/components/shared/MatchScoreBadge';
import EligibilityBadge from '@/components/shared/EligibilityBadge';
import { MOCK_MATCH_RESULTS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function RecruiterShortlist() {
  const [shortlisted, setShortlisted] = useState(
    new Set(MOCK_MATCH_RESULTS.slice(0, 3).map(m => m.id)),
  );

  const shortlistedMatches = MOCK_MATCH_RESULTS.filter(m => shortlisted.has(m.id));

  const remove = (id: string) => {
    setShortlisted(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black text-brand-oxford">Shortlist</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{shortlistedMatches.length} candidates shortlisted</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 text-xs font-semibold border border-border bg-white text-foreground px-3.5 py-2 rounded-xl hover:border-brand-oxford/30 transition-colors">
            <Mail className="w-3.5 h-3.5" /> Notify All
          </button>
          <button className="flex items-center gap-1.5 text-xs font-semibold bg-brand-oxford text-white px-3.5 py-2 rounded-xl hover:bg-brand-oxford/90 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {shortlistedMatches.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates shortlisted"
          description="Go to Matches and shortlist candidates to see them here."
        />
      ) : (
        <SectionCard title="Shortlisted Candidates" icon={CheckCircle}>
          <div className="space-y-3">
            {shortlistedMatches.map((match, i) => {
              const profile = match.studentProfile;
              const displayName = profile ? `${profile.firstName} ${profile.lastName}` : 'Student';
              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/80 border border-border hover:border-brand-oxford/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-oxford/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-brand-oxford">
                      {displayName.charAt(0)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.department} · CGPA {profile?.cgpa} · {match.job?.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <EligibilityBadge status={match.eligibilityStatus as any} />
                    <MatchScoreBadge score={match.overallMatchPercentage} size="sm" />
                    <div className="flex gap-1.5">
                      <button className="text-xs font-semibold text-brand-oxford border border-brand-oxford/30 hover:bg-brand-oxford/5 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Contact
                      </button>
                      <button
                        onClick={() => remove(match.id)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Summary stats */}
      {shortlistedMatches.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Avg Match Score', value: `${Math.round(shortlistedMatches.reduce((s, m) => s + m.overallMatchPercentage, 0) / shortlistedMatches.length)}%` },
            { label: 'All Eligible', value: shortlistedMatches.every(m => m.eligibilityStatus === 'ELIGIBLE') ? 'Yes' : 'No' },
            { label: 'Notified', value: '0 / ' + shortlistedMatches.length },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border shadow-card p-4 text-center">
              <p className="text-lg font-black text-brand-oxford">{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
