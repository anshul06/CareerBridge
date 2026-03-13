import { motion } from 'framer-motion';
import { BookOpen, Code, FileText, Video, ExternalLink, Star } from 'lucide-react';
import SectionCard from '@/components/shared/SectionCard';
import { cn } from '@/lib/utils';

const RESOURCES = [
  {
    category: 'Interview Prep',
    icon: Code,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    items: [
      { title: 'LeetCode Top 150 — Study Plan', type: 'Practice', link: '#', starred: true },
      { title: 'System Design Interview Guide', type: 'Guide', link: '#', starred: true },
      { title: 'DSA Masterclass by Striver', type: 'Video Series', link: '#', starred: false },
      { title: 'Behavioral Interview STAR Method', type: 'Guide', link: '#', starred: false },
    ],
  },
  {
    category: 'Resume & Career',
    icon: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    items: [
      { title: 'ATS-Optimized Resume Templates', type: 'Template', link: '#', starred: true },
      { title: 'LinkedIn Profile Optimization Guide', type: 'Guide', link: '#', starred: false },
      { title: 'Writing Powerful Bullet Points', type: 'Article', link: '#', starred: false },
    ],
  },
  {
    category: 'Company-Specific',
    icon: Star,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    items: [
      { title: 'Google L3 Interview Preparation', type: 'Guide', link: '#', starred: true },
      { title: 'Amazon Leadership Principles Deep Dive', type: 'Guide', link: '#', starred: false },
      { title: 'Infosys & TCS Aptitude Questions', type: 'Practice', link: '#', starred: false },
      { title: 'Wipro & HCL Assessment Patterns', type: 'Guide', link: '#', starred: false },
    ],
  },
  {
    category: 'Placement Cell Documents',
    icon: BookOpen,
    color: 'text-green-600',
    bg: 'bg-green-50',
    items: [
      { title: 'Placement Guidelines 2025-26', type: 'PDF', link: '#', starred: false },
      { title: 'CGPA & Eligibility Criteria FAQ', type: 'Document', link: '#', starred: false },
      { title: 'Company Visit Schedule', type: 'Schedule', link: '#', starred: false },
    ],
  },
];

const TYPE_COLORS: Record<string, string> = {
  Guide: 'bg-blue-50 text-blue-700',
  Practice: 'bg-purple-50 text-purple-700',
  Template: 'bg-green-50 text-green-700',
  PDF: 'bg-red-50 text-red-600',
  Article: 'bg-gray-100 text-gray-600',
  'Video Series': 'bg-amber-50 text-amber-700',
  Schedule: 'bg-brand-oxford/8 text-brand-oxford',
  Document: 'bg-gray-100 text-gray-600',
};

export default function StudentResources() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-brand-oxford">Resources</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Curated guides, prep materials, and placement documents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {RESOURCES.map((section, si) => (
          <motion.div
            key={si}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.08 }}
          >
            <SectionCard
              title={section.category}
              icon={section.icon}
            >
              <div className="space-y-2.5">
                {section.items.map((item, ii) => (
                  <a
                    key={ii}
                    href={item.link}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50/80 transition-colors group"
                  >
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', section.bg)}>
                      <section.icon className={cn('w-3.5 h-3.5', section.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate group-hover:text-brand-oxford transition-colors">
                        {item.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                      <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', TYPE_COLORS[item.type] ?? 'bg-gray-100 text-gray-600')}>
                        {item.type}
                      </span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </a>
                ))}
              </div>
            </SectionCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
