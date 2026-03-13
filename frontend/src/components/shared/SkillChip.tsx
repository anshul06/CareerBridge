import { cn, getConfidenceColor } from '@/lib/utils';
import type { SkillConfidence } from '@/types';
import { X } from 'lucide-react';

interface SkillChipProps {
  name: string;
  confidence?: SkillConfidence;
  variant?: 'default' | 'outline' | 'solid' | 'matched' | 'missing';
  size?: 'sm' | 'md';
  onRemove?: () => void;
  className?: string;
}

export default function SkillChip({
  name, confidence, variant = 'default', size = 'sm', onRemove, className,
}: SkillChipProps) {
  const baseClass = cn(
    'inline-flex items-center gap-1 font-medium rounded-full border',
    size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
    {
      default: confidence
        ? getConfidenceColor(confidence)
        : 'bg-brand-oxford/8 text-brand-oxford border-brand-oxford/15',
      outline: 'bg-transparent border-border text-foreground',
      solid: 'bg-brand-oxford text-white border-brand-oxford',
      matched: 'bg-green-50 text-green-700 border-green-200',
      missing: 'bg-red-50 text-red-600 border-red-200',
    }[variant],
    className,
  );

  return (
    <span className={baseClass}>
      {confidence && variant === 'default' && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full flex-shrink-0',
          confidence === 'HIGH' ? 'bg-brand-oxford' : confidence === 'MEDIUM' ? 'bg-brand-tan-500' : 'bg-gray-400',
        )} />
      )}
      {name}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 hover:opacity-70">
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
