import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import type { Role } from '@/types';

// Layouts
import PublicLayout from '@/components/layout/PublicLayout';
import StudentLayout from '@/components/layout/StudentLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import RecruiterLayout from '@/components/layout/RecruiterLayout';

// Public pages
import LandingPage from '@/features/public/LandingPage';
import LoginPage from '@/features/auth/LoginPage';

// Student pages
import StudentDashboard from '@/features/student/Dashboard';
import StudentProfile from '@/features/student/Profile';
import StudentAchievements from '@/features/student/Achievements';
import StudentResume from '@/features/student/Resume';
import StudentJobs from '@/features/student/Jobs';
import StudentEligibility from '@/features/student/Eligibility';
import StudentApplications from '@/features/student/Applications';
import StudentResources from '@/features/student/Resources';

// Admin pages
import AdminDashboard from '@/features/admin/Dashboard';
import AdminStudents from '@/features/admin/Students';
import AdminCompanies from '@/features/admin/Companies';
import AdminJobs from '@/features/admin/Jobs';
import AdminMatching from '@/features/admin/Matching';
import AdminCommunications from '@/features/admin/Communications';
import AdminSettings from '@/features/admin/Settings';

// Recruiter pages
import RecruiterDashboard from '@/features/recruiter/Dashboard';
import RecruiterCompany from '@/features/recruiter/Company';
import RecruiterJobs from '@/features/recruiter/Jobs';
import RecruiterJDParser from '@/features/recruiter/JDParser';
import RecruiterMatches from '@/features/recruiter/Matches';
import RecruiterShortlist from '@/features/recruiter/Shortlist';

// Protected route
function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: Role }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Role-based redirect after login
function RoleRedirect() {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'RECRUITER') return <Navigate to="/recruiter/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Role redirect */}
      <Route path="/app" element={<RoleRedirect />} />

      {/* Student */}
      <Route
        path="/student"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="achievements" element={<StudentAchievements />} />
        <Route path="resume" element={<StudentResume />} />
        <Route path="jobs" element={<StudentJobs />} />
        <Route path="eligibility" element={<StudentEligibility />} />
        <Route path="applications" element={<StudentApplications />} />
        <Route path="resources" element={<StudentResources />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="companies" element={<AdminCompanies />} />
        <Route path="jobs" element={<AdminJobs />} />
        <Route path="matching" element={<AdminMatching />} />
        <Route path="communications" element={<AdminCommunications />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Recruiter */}
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute requiredRole="RECRUITER">
            <RecruiterLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<RecruiterDashboard />} />
        <Route path="company" element={<RecruiterCompany />} />
        <Route path="jobs" element={<RecruiterJobs />} />
        <Route path="jd-parser" element={<RecruiterJDParser />} />
        <Route path="matches" element={<RecruiterMatches />} />
        <Route path="shortlist" element={<RecruiterShortlist />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
