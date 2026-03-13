import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export default function SectionCard({
  title, subtitle, icon: Icon, action, children,
  className, bodyClassName, noPadding,
}: SectionCardProps) {
  return (
    <div className={cn('bg-white rounded-2xl border border-border shadow-card', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-brand-oxford/8 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-brand-oxford" strokeWidth={1.75} />
              </div>
            )}
            <div className="min-w-0">
              {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="flex-shrink-0 ml-3">{action}</div>}
        </div>
      )}
      <div className={cn(!noPadding && 'p-5', bodyClassName)}>{children}</div>
    </div>
  );
}
