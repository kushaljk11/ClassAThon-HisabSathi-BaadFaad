import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
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
        navigate('/dashboard');
      } else {
        localStorage.removeItem('pendingFullName');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error processing auth callback:', error);
      localStorage.removeItem('pendingFullName');
      navigate('/login');
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Authenticating...</p>
    </div>
  );
};

export default AuthCallback;
