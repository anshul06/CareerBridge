import { useState } from 'react';
import { Settings, GraduationCap, Bell, Shield, Save } from 'lucide-react';
import SectionCard from '@/components/shared/SectionCard';
import { cn } from '@/lib/utils';

const inputClass = 'w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-white outline-none transition-all focus:border-brand-oxford focus:ring-2 focus:ring-brand-oxford/10';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'w-10 h-5.5 rounded-full transition-all relative flex-shrink-0',
        checked ? 'bg-brand-oxford' : 'bg-gray-200',
      )}
      style={{ height: '22px', width: '40px' }}
    >
      <span className={cn(
        'absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-all',
        checked ? 'left-5' : 'left-0.5',
      )} style={{ width: '18px', height: '18px' }} />
    </button>
  );
}

export default function AdminSettings() {
  const [cgpa, setCgpa] = useState('7.0');
  const [backlogs, setBacklogs] = useState('0');
  const [notifyDeadline, setNotifyDeadline] = useState(true);
  const [notifyShortlist, setNotifyShortlist] = useState(true);
  const [autoMatch, setAutoMatch] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-black text-brand-oxford">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Configure placement eligibility rules and notifications</p>
      </div>

      {/* Eligibility */}
      <SectionCard title="Eligibility Criteria" icon={GraduationCap}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Minimum CGPA</label>
              <input value={cgpa} onChange={e => setCgpa(e.target.value)} type="number" step="0.1" min="0" max="10" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Max Active Backlogs</label>
              <input value={backlogs} onChange={e => setBacklogs(e.target.value)} type="number" min="0" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Eligible Branches</label>
            <div className="flex flex-wrap gap-2">
              {['CSE', 'AI & DS', 'IT', 'ISE', 'ECE', 'Mechanical'].map(b => (
                <button
                  key={b}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border bg-brand-oxford/8 text-brand-oxford border-brand-oxford/20"
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Graduation Year</label>
            <input type="number" defaultValue={2026} className={inputClass} style={{ maxWidth: '160px' }} />
          </div>
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Notification Settings" icon={Bell}>
        <div className="space-y-4">
          {[
            { label: 'Deadline Reminders', desc: 'Auto-send reminders 3 days before application deadlines', checked: notifyDeadline, onChange: setNotifyDeadline },
            { label: 'Shortlist Notifications', desc: 'Notify students when shortlisted by a company', checked: notifyShortlist, onChange: setNotifyShortlist },
            { label: 'Auto-run AI Matching', desc: 'Automatically run matching when new jobs are posted', checked: autoMatch, onChange: setAutoMatch },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-gray-50/80">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <Toggle checked={item.checked} onChange={item.onChange} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Platform info */}
      <SectionCard title="Platform" icon={Settings}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Institution Name</label>
            <input defaultValue="Dayananda Sagar University" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Placement Season</label>
            <input defaultValue="2025–26" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Contact Email</label>
            <input defaultValue="placements@dsu.edu.in" className={inputClass} />
          </div>
        </div>
      </SectionCard>

      <button
        onClick={handleSave}
        className={cn(
          'flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all',
          saved ? 'bg-green-500 text-white' : 'bg-brand-oxford text-white hover:bg-brand-oxford/90',
        )}
      >
        <Save className="w-4 h-4" />
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}
