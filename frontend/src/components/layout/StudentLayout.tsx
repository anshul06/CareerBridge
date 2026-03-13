import { Outlet, useLocation } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '/student/dashboard': { title: 'Dashboard', subtitle: 'Overview of your placement journey' },
  '/student/profile': { title: 'My Profile', subtitle: 'Manage your academic & personal details' },
  '/student/achievements': { title: 'Achievements & Projects', subtitle: 'Certifications, projects, internships and more' },
  '/student/resume': { title: 'Resume Centre', subtitle: 'Build, enhance, and tailor your resume with AI' },
  '/student/jobs': { title: 'Job Opportunities', subtitle: 'Browse and apply to placement drives' },
  '/student/eligibility': { title: 'Eligibility Checker', subtitle: 'See which jobs you qualify for' },
  '/student/applications': { title: 'My Applications', subtitle: 'Track your placement applications' },
  '/student/resources': { title: 'Resources', subtitle: 'Prep materials and interview guides' },
};

export default function StudentLayout() {
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] ?? { title: 'DSU CareerBridge' };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-tan-50">
      <AppSidebar role="STUDENT" />
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
