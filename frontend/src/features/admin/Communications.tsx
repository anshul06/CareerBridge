import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Users, Building2, Sparkles, Clock } from 'lucide-react';
import SectionCard from '@/components/shared/SectionCard';
import { cn } from '@/lib/utils';

const TEMPLATES = [
  { id: 'deadline', label: 'Deadline Reminder', preview: 'Hi {name}, the application deadline for {company} is {days} days away.' },
  { id: 'shortlist', label: 'Shortlist Notification', preview: 'Congratulations! You have been shortlisted for {role} at {company}.' },
  { id: 'interview', label: 'Interview Invitation', preview: 'You have an interview scheduled with {company} on {date} at {time}.' },
  { id: 'offer', label: 'Offer Letter', preview: 'We are pleased to inform you that {company} has extended an offer for {role}.' },
];

const SENT = [
  { subject: 'Application Deadline Reminder — TCS Digital', recipients: 12, status: 'Sent', time: '2h ago' },
  { subject: 'Shortlist Notification — Google SWE Intern', recipients: 8, status: 'Sent', time: '1d ago' },
  { subject: 'Interview Schedule — Amazon SDE', recipients: 5, status: 'Sent', time: '3d ago' },
];

export default function AdminCommunications() {
  const [tab, setTab] = useState<'compose' | 'sent'>('compose');
  const [target, setTarget] = useState<'all' | 'eligible' | 'company'>('all');
  const [template, setTemplate] = useState('');
  const [message, setMessage] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setMessage('Dear Student,\n\nThis is a reminder that the application deadline for TCS Digital is approaching in 3 days. Please ensure you have submitted your application at your earliest convenience.\n\nBest regards,\nDSU Placement Cell');
      setGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-brand-oxford">Communications</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Send notifications and bulk emails to students</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl w-fit">
        {([['compose', 'Compose'], ['sent', 'Sent']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'text-xs font-semibold px-4 py-1.5 rounded-lg transition-all',
              tab === id ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'compose' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <SectionCard title="Compose Message" icon={Send}>
              <div className="space-y-4">
                {/* Recipients */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-2">Recipients</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'all', label: 'All Students', icon: Users },
                      { id: 'eligible', label: 'Eligible Only', icon: Users },
                      { id: 'company', label: 'By Company', icon: Building2 },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setTarget(opt.id as any)}
                        className={cn(
                          'flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border-2 text-xs font-semibold transition-all',
                          target === opt.id
                            ? 'border-brand-oxford bg-brand-oxford/5 text-brand-oxford'
                            : 'border-border text-muted-foreground hover:border-brand-oxford/30',
                        )}
                      >
                        <opt.icon className="w-4 h-4" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Subject</label>
                  <input
                    type="text"
                    placeholder="Notification subject..."
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-white outline-none focus:border-brand-oxford transition-all"
                  />
                </div>

                {/* Message */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-foreground">Message</label>
                    <button
                      onClick={handleGenerate}
                      className="flex items-center gap-1 text-[11px] font-semibold text-brand-oxford hover:underline"
                    >
                      <Sparkles className="w-3 h-3" />
                      {generating ? 'Generating...' : 'Generate with AI'}
                    </button>
                  </div>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={6}
                    placeholder="Type your message or use AI to generate..."
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-white outline-none focus:border-brand-oxford transition-all resize-none"
                  />
                </div>

                <button className="w-full bg-brand-oxford text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-oxford/90 transition-colors">
                  <Send className="w-4 h-4" /> Send Notification
                </button>
              </div>
            </SectionCard>
          </div>

          {/* Templates */}
          <SectionCard title="Templates" icon={Bell}>
            <div className="space-y-2.5">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setMessage(t.preview)}
                  className={cn(
                    'w-full text-left p-3 rounded-xl border transition-all',
                    template === t.id ? 'border-brand-oxford bg-brand-oxford/5' : 'border-border hover:border-brand-oxford/30',
                  )}
                >
                  <p className="text-xs font-semibold text-foreground">{t.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{t.preview}</p>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      ) : (
        <SectionCard title="Sent Messages" icon={Clock}>
          <div className="space-y-3">
            {SENT.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-border"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{m.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.recipients} recipients · {m.time}</p>
                </div>
                <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 flex-shrink-0">
                  {m.status}
                </span>
              </motion.div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
