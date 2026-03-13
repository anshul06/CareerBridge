import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  color?: string; // alias for iconColor (convenience)
  iconBg?: string;
  trend?: { value: number; label?: string; positive?: boolean };
  className?: string;
  onClick?: () => void;
}

export default function StatCard({
  title, value, subtitle, icon: Icon, iconColor, color,
  iconBg = 'bg-brand-oxford/10', trend, className, onClick,
}: StatCardProps) {
  const resolvedIconColor = iconColor ?? color ?? 'text-brand-oxford';
  return (
    <motion.div
      whileHover={onClick ? { y: -2, boxShadow: '0 8px 24px -4px rgba(0,33,71,0.12)' } : {}}
      className={cn(
        'bg-white rounded-2xl border border-border p-5 shadow-card',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn('text-xs font-semibold', (trend.positive ?? trend.value >= 0) ? 'text-match-high' : 'text-match-low')}>
                {(trend.positive ?? trend.value >= 0) ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              {trend.label && <span className="text-xs text-muted-foreground">{trend.label}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-3', iconBg)}>
            <Icon className={cn('w-5 h-5', resolvedIconColor)} strokeWidth={1.75} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
