
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import ParticleBackground from '../Layout/ParticleBackground';
import InstallButton from '../PWA/InstallButton';
import UpdatePrompt from '../PWA/UpdatePrompt';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-mart-dark">
        <ParticleBackground />
        <div className="flex items-center justify-center h-full">
          <p className="text-white text-xl font-orbitron">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Outlet />
      <InstallButton />
      <UpdatePrompt />
    </>
  );
};

export default ProtectedRoute;
