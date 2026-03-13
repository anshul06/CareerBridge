import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
  description?: string;
}

interface StepWizardProps {
  steps: Step[];
  current: number;
  className?: string;
}

export default function StepWizard({ steps, current, className }: StepWizardProps) {
  return (
    <div className={cn('flex items-start gap-0', className)}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all',
                done ? 'bg-brand-oxford border-brand-oxford text-white'
                  : active ? 'bg-white border-brand-oxford text-brand-oxford'
                  : 'bg-white border-gray-200 text-gray-400',
              )}>
                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <div className="text-center">
                <p className={cn('text-[11px] font-semibold', active ? 'text-brand-oxford' : done ? 'text-foreground' : 'text-muted-foreground')}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-[10px] text-muted-foreground">{step.description}</p>
                )}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mt-3.5 mx-2 rounded-full',
                done ? 'bg-brand-oxford' : 'bg-gray-200',
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
