import { cn, getEligibilityColor } from '@/lib/utils';
import type { EligibilityStatus } from '@/types';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface EligibilityBadgeProps {
  status: EligibilityStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const LABELS: Record<EligibilityStatus, string> = {
  ELIGIBLE: 'Eligible',
  PARTIALLY_ELIGIBLE: 'Partially Eligible',
  INELIGIBLE: 'Not Eligible',
};

const ICONS: Record<EligibilityStatus, React.ElementType> = {
  ELIGIBLE: CheckCircle,
  PARTIALLY_ELIGIBLE: AlertCircle,
  INELIGIBLE: XCircle,
};

export default function EligibilityBadge({ status, showIcon = true, size = 'sm', className }: EligibilityBadgeProps) {
  const Icon = ICONS[status];
  const colorClass = getEligibilityColor(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium border',
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        colorClass,
        status === 'ELIGIBLE' ? 'border-green-200' : status === 'PARTIALLY_ELIGIBLE' ? 'border-amber-200' : 'border-red-200',
        className,
      )}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      {LABELS[status]}
    </span>
  );
}
