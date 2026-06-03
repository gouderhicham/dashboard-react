import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { ScreenLoader } from '@/components/loaders';
import { MenusProvider } from '@/providers';

import { useAuthContext } from './useAuthContext';

const RequireAuth = () => {
  const { auth, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return <ScreenLoader />;
  }

  if (!auth) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return (
    <MenusProvider>
      <Outlet />
    </MenusProvider>
  );
};

export { RequireAuth };
