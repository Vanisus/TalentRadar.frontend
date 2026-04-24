import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AppShell, Center, Loader } from '@mantine/core';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { CandidateDashboard } from './features/candidate/CandidateDashboard';
import { HRDashboard } from './features/hr/HRDashboard';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { HrVacancyDetailsPage } from './features/hr/vacancies/HrVacancyDetailsPage';
import { HrCandidatePage } from './features/hr/candidates/HrCandidatePage';
import { VacancyPage } from '@/features/candidate/VacancyPage';
import { AppHeader } from '@/widgets/AppHeader/AppHeader';
import { useCurrentUser } from './shared/auth';
import type { UserRole } from './shared/auth';

function ProtectedRoute({ allowedRoles, children }: { allowedRoles: UserRole[]; children?: React.ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <Center sx={{ height: '100vh' }}>
        <Loader />
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppShell header={{ height: 60 }}>
      <AppShell.Header>
        <AppHeader />
      </AppShell.Header>

      <AppShell.Main>
        {children ?? (
          <>
            {user.role === 'candidate' && <CandidateDashboard />}
            {user.role === 'hr' && <HRDashboard />}
            {user.role === 'admin' && <AdminDashboard />}
          </>
        )}
      </AppShell.Main>
    </AppShell>
  );
}


export default function App() {
  const { data: user, isLoading } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && user && (location.pathname === '/login' || location.pathname === '/register')) {
      navigate('/', { replace: true });
    }
  }, [user, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return (
      <Center sx={{ height: '100vh' }}>
        <Loader />
      </Center>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/hr/vacancies/:id"
        element={
          user ? (
            <ProtectedRoute allowedRoles={['hr', 'admin']}>
              <HrVacancyDetailsPage />
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/hr/candidates/:id"
        element={
          user ? (
            <ProtectedRoute allowedRoles={['hr', 'admin']}>
              <HrCandidatePage />
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/candidate/vacancies/:id" element={<VacancyPage />} />

      <Route
        path="/"
        element={
          user ? (
            <ProtectedRoute allowedRoles={['candidate', 'hr', 'admin']} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="*"
        element={
          <Center sx={{ height: '100vh' }}>
            <Navigate to="/" replace />
          </Center>
        }
      />
    </Routes>
  );
}
