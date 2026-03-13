import { Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AIInsight {
  message: string;
  action?: string;
  href?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface AIInsightCardProps {
  title?: string;
  insights: AIInsight[];
  className?: string;
}

export default function AIInsightCard({ title = 'AI Suggestions', insights, className }: AIInsightCardProps) {
  return (
    <div className={cn(
      'bg-gradient-to-br from-brand-oxford via-brand-oxford-500 to-brand-oxford-400 rounded-2xl p-5 text-white',
      className,
    )}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-brand-tan-300" />
        </div>
        <span className="text-sm font-semibold text-white/90">{title}</span>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-2.5"
          >
            <div className={cn(
              'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
              insight.priority === 'high' ? 'bg-brand-tan-400' :
              insight.priority === 'medium' ? 'bg-white/60' : 'bg-white/40',
            )} />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/80 leading-relaxed">{insight.message}</p>
              {insight.action && (
                <button className="mt-1 text-[11px] font-semibold text-brand-tan-300 hover:text-brand-tan-200 flex items-center gap-1 transition-colors">
                  {insight.action}
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
