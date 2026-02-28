import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useMemo } from 'react';

/**
 * ProtectedRoute component - Prevents unauthorized access to protected pages
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-400 border-r-transparent"></div>
          <p className="mt-4 text-zinc-100">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow unauthenticated access for session join URLs
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const pathname = location.pathname || '';

  // Consider explicit session join path or legacy split paths with ?type=session as public
  const isPublicSessionLink = pathname === '/session/join' || ((pathname === '/split/ready' || pathname === '/split/join' || pathname === '/split/joined') && searchParams.get('type') === 'session');

  if (!isAuthenticated && !isPublicSessionLink) {
    // Redirect to login, preserving the intended location for post-login redirect
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;
