import { Outlet, useLocation } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '/admin/dashboard': { title: 'Admin Dashboard', subtitle: 'Placement cell overview and analytics' },
  '/admin/students': { title: 'Student Directory', subtitle: 'Browse and manage all registered students' },
  '/admin/companies': { title: 'Companies', subtitle: 'Manage company profiles and recruiters' },
  '/admin/jobs': { title: 'Job Management', subtitle: 'Create, manage, and parse job descriptions' },
  '/admin/matching': { title: 'AI Matching Engine', subtitle: 'Run and review student-job match results' },
  '/admin/communications': { title: 'Communications', subtitle: 'Announcements and messaging' },
  '/admin/settings': { title: 'Settings', subtitle: 'Platform configuration and defaults' },
};

export default function AdminLayout() {
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] ?? { title: 'Admin Console' };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-tan-50">
      <AppSidebar role="ADMIN" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader title={page.title} subtitle={page.subtitle} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
