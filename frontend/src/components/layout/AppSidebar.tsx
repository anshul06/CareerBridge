import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import type { Role } from '@/types';
import {
  LayoutDashboard, User, Trophy, FileText, Briefcase, CheckCircle,
  ClipboardList, BookOpen, Building2, Settings, MessageSquare,
  Users, ChevronLeft, ChevronRight, Brain, BarChart3, Sparkles,
  Target, Search, PieChart, X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const NAV_CONFIG: Record<Role, NavSection[]> = {
  STUDENT: [
    {
      items: [
        { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
        { label: 'My Profile', href: '/student/profile', icon: User },
      ],
    },
    {
      title: 'Career Assets',
      items: [
        { label: 'Achievements', href: '/student/achievements', icon: Trophy },
        { label: 'Resume', href: '/student/resume', icon: FileText },
      ],
    },
    {
      title: 'Opportunities',
      items: [
        { label: 'Browse Jobs', href: '/student/jobs', icon: Briefcase },
        { label: 'Eligibility', href: '/student/eligibility', icon: CheckCircle },
        { label: 'Applications', href: '/student/applications', icon: ClipboardList },
      ],
    },
    {
      title: 'Learn',
      items: [
        { label: 'Resources', href: '/student/resources', icon: BookOpen },
      ],
    },
  ],
  ADMIN: [
    {
      items: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Management',
      items: [
        { label: 'Students', href: '/admin/students', icon: Users },
        { label: 'Companies', href: '/admin/companies', icon: Building2 },
        { label: 'Jobs', href: '/admin/jobs', icon: Briefcase },
      ],
    },
    {
      title: 'Intelligence',
      items: [
        { label: 'AI Matching', href: '/admin/matching', icon: Brain },
        { label: 'Communications', href: '/admin/communications', icon: MessageSquare },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ],
  RECRUITER: [
    {
      items: [
        { label: 'Dashboard', href: '/recruiter/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Hiring',
      items: [
        { label: 'Company Profile', href: '/recruiter/company', icon: Building2 },
        { label: 'Job Postings', href: '/recruiter/jobs', icon: Briefcase },
        { label: 'JD Parser', href: '/recruiter/jd-parser', icon: Search },
      ],
    },
    {
      title: 'Candidates',
      items: [
        { label: 'Top Matches', href: '/recruiter/matches', icon: Target },
        { label: 'Shortlist', href: '/recruiter/shortlist', icon: ClipboardList },
      ],
    },
  ],
};

interface AppSidebarProps {
  role: Role;
}

export default function AppSidebar({ role }: AppSidebarProps) {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed, sidebarOpen, setSidebarOpen } = useUIStore();
  const sections = NAV_CONFIG[role] || [];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-brand-oxford/10', sidebarCollapsed && 'justify-center px-2')}>
        <div className="flex-shrink-0 w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-brand-tan-300" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <div className="text-sm font-bold text-brand-oxford leading-none">DSU CareerBridge</div>
            <div className="text-[10px] text-brand-oxford/50 mt-0.5 uppercase tracking-wider">
              {role === 'STUDENT' ? 'Student Portal' : role === 'ADMIN' ? 'Admin Console' : 'Recruiter Portal'}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {sections.map((section, si) => (
          <div key={si} className={cn('mb-4', si > 0 && 'mt-2')}>
            {section.title && !sidebarCollapsed && (
              <div className="px-3 mb-1.5 text-[10px] font-semibold text-brand-oxford/40 uppercase tracking-widest">
                {section.title}
              </div>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                        'text-brand-oxford/60 hover:text-brand-oxford hover:bg-brand-tan-50',
                        isActive && 'bg-brand-oxford text-white hover:bg-brand-oxford hover:text-white shadow-sm',
                        sidebarCollapsed && 'justify-center px-2',
                      )
                    }
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <item.icon className="w-4.5 h-4.5 flex-shrink-0" strokeWidth={1.75} />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {!sidebarCollapsed && item.badge && (
                      <span className="ml-auto text-[10px] bg-brand-tan-400 text-white rounded-full px-1.5 py-0.5 font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className={cn('border-t border-brand-oxford/10 p-3', sidebarCollapsed && 'px-2')}>
        <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-full bg-brand-tan-200 border-2 border-brand-tan-400 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-brand-oxford">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-brand-oxford truncate">{user?.email}</div>
              <div className="text-[10px] text-brand-oxford/40 capitalize">{role.toLowerCase()}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-white border-r border-border shadow-sidebar h-screen sticky top-0 transition-all duration-300 flex-shrink-0',
          sidebarCollapsed ? 'w-14' : 'w-56',
        )}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 md:hidden flex flex-col shadow-2xl"
            >
              <div className="absolute right-3 top-4">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
