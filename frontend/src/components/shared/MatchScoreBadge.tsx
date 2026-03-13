import { cn, getMatchBg } from '@/lib/utils';

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showBar?: boolean;
  className?: string;
}

export default function MatchScoreBadge({ score, size = 'md', showBar, className }: MatchScoreBadgeProps) {
  const colorClass = getMatchBg(score);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-semibold',
    md: 'text-sm px-2.5 py-1 font-bold',
    lg: 'text-lg px-3 py-1.5 font-black',
  };

  return (
    <div className={cn('flex flex-col items-end gap-1', className)}>
      <span className={cn('rounded-full', colorClass, sizeClasses[size])}>
        {score}%
      </span>
      {showBar && (
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              score >= 70 ? 'bg-match-high' : score >= 40 ? 'bg-match-medium' : 'bg-match-low',
            )}
            style={{ width: `${score}%` }}
          />
        </div>
      )}
    </div>
  );
}
