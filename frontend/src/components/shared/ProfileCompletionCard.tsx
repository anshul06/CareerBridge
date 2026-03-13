import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface CompletionStep {
  label: string;
  done: boolean;
  href?: string;
}

interface ProfileCompletionCardProps {
  steps: CompletionStep[];
  className?: string;
}

export default function ProfileCompletionCard({ steps, className }: ProfileCompletionCardProps) {
  const done = steps.filter(s => s.done).length;
  const pct = Math.round((done / steps.length) * 100);

  return (
    <div className={cn('bg-white rounded-2xl border border-border shadow-card p-5', className)}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-foreground">Profile Completion</p>
        <span className={cn(
          'text-sm font-bold',
          pct === 100 ? 'text-green-600' : pct >= 60 ? 'text-amber-500' : 'text-red-500',
        )}>{pct}%</span>
      </div>

      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            pct === 100 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-400' : 'bg-brand-oxford',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="space-y-2">
        {steps.map((step, i) => {
          const inner = (
            <div
              key={i}
              className={cn(
                'flex items-center gap-2.5 group',
                !step.done && step.href && 'cursor-pointer',
              )}
            >
              {step.done
                ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                : <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
              }
              <span className={cn(
                'text-xs flex-1',
                step.done ? 'text-muted-foreground line-through' : 'text-foreground font-medium',
              )}>{step.label}</span>
              {!step.done && step.href && (
                <ChevronRight className="w-3.5 h-3.5 text-brand-oxford opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          );

          return step.href && !step.done
            ? <Link key={i} to={step.href}>{inner}</Link>
            : <div key={i}>{inner}</div>;
        })}
      </div>
    </div>
  );
}
