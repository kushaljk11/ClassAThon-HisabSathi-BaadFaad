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

    const process = async () => {
      try {
        const token = searchParams.get('token');
        const userJson = searchParams.get('user');

        if (token && userJson) {
          const user = JSON.parse(decodeURIComponent(userJson));
          const pendingFullName = localStorage.getItem('pendingFullName');
          console.debug('AuthCallback: token present, user parsed, pendingFullName=', pendingFullName, 'user=', user);
          const mergedUser = pendingFullName
            ? { ...user, name: pendingFullName }
            : user;

          localStorage.removeItem('pendingFullName');
          login(mergedUser, token);
          // If redirected from a session link, auto-join the session on behalf of the user
          try {
            const stored = localStorage.getItem('postAuthRedirect');
            console.debug('AuthCallback: postAuthRedirect=', stored);
            let target = null;
            if (stored) {
              target = JSON.parse(stored);
            }
            if (target?.search) {
              const sp = new URLSearchParams(target.search);
              const t = sp.get('type');
              const sessionId = sp.get('sessionId');
              const groupId = sp.get('groupId');
              const splitId = sp.get('splitId');
              if (t === 'session' && sessionId) {
                const cfg = await import('../../config/config');
                const uid = mergedUser._id || mergedUser.id;
                console.debug('AuthCallback: attempting auto-join', { sessionId, userId: uid });
                const joinRes = await cfg.default.post(`/session/join/${sessionId}`, { userId: uid });
                console.debug('AuthCallback: /session/join response=', joinRes.data);
                localStorage.removeItem('postAuthRedirect');
                navigate(`/split/joined?splitId=${splitId}&sessionId=${sessionId}&type=${t}`, { replace: true });
                return;
              }

              if (t === 'group' && groupId) {
                const cfg = await import('../../config/config');
                const uid = mergedUser._id || mergedUser.id;
                console.debug('AuthCallback: attempting auto-join group', { groupId, userId: uid });
                const joinRes = await cfg.default.post(`/groups/${groupId}/join`, { userId: uid });
                console.debug('AuthCallback: /groups/:groupId/join response=', joinRes.data);
                localStorage.removeItem('postAuthRedirect');
                navigate(`/split/joined?splitId=${splitId}&groupId=${groupId}&type=${t}`, { replace: true });
                return;
              }
            }
          } catch (err) {
            console.error('Auto-join after OAuth failed:', err);
          }

          // Redirect to stored post-auth location if available (preserved across OAuth roundtrip)
          const stored = localStorage.getItem('postAuthRedirect');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              localStorage.removeItem('postAuthRedirect');
              navigate(parsed.pathname + (parsed.search || ''), { replace: true });
              return;
            } catch {}
          }
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
    };

    process();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Authenticating...</p>
    </div>
  );
};

export default AuthCallback;
