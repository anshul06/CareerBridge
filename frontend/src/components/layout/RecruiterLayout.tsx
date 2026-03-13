import { Outlet, useLocation } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '/recruiter/dashboard': { title: 'Recruiter Dashboard', subtitle: 'Hiring overview and candidate insights' },
  '/recruiter/company': { title: 'Company Profile', subtitle: 'Manage your company information' },
  '/recruiter/jobs': { title: 'Job Postings', subtitle: 'Manage your campus job listings' },
  '/recruiter/jd-parser': { title: 'JD Parser', subtitle: 'Upload or paste JD to extract skills and rules' },
  '/recruiter/matches': { title: 'Top Matches', subtitle: 'AI-ranked student matches for your jobs' },
  '/recruiter/shortlist': { title: 'Shortlist', subtitle: 'Review and finalize your candidate shortlist' },
};

export default function RecruiterLayout() {
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] ?? { title: 'Recruiter Portal' };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-tan-50">
      <AppSidebar role="RECRUITER" />
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
