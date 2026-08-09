import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppBackground from '../components/AppBackground';
import Logo from '../components/Logo';

function LoadingScreen() {
  return (
    <>
      <AppBackground />
      <div className="loading-screen">
        <Logo size="sm" />
        <div className="spinner" />
      </div>
    </>
  );
}

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
