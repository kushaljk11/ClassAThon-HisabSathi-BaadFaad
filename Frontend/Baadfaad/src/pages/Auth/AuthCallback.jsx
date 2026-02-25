/**
 * @fileoverview Google OAuth Callback Handler
 * @description Receives the token and user data from the Google OAuth redirect
 *              URL query parameters, persists them via AuthContext's `login()`,
 *              and redirects to the dashboard. Uses a `hasProcessed` ref to
 *              prevent double-processing in React StrictMode.
 *
 * @module pages/auth/AuthCallback
 */
import React, { useEffect, useContext, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple processing
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    try {
      const token = searchParams.get('token');
      const userJson = searchParams.get('user');

      if (token && userJson) {
        const user = JSON.parse(decodeURIComponent(userJson));
        const pendingFullName = localStorage.getItem('pendingFullName');
        const mergedUser = pendingFullName
          ? { ...user, name: pendingFullName }
          : user;

        localStorage.removeItem('pendingFullName');
        login(mergedUser, token);
        navigate('/split/create', { replace: true });
      } else {
        localStorage.removeItem('pendingFullName');
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Error processing auth callback:', error);
      localStorage.removeItem('pendingFullName');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Authenticating...</p>
    </div>
  );
};

export default AuthCallback;
