import {useEffect, useState} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {ApiError} from './api';
import {getCurrentUser} from './auth/api';
import {AuthPage} from './auth/AuthPage';
import {HandoverPage} from './handover/HandoverPage';

type AuthenticationState =
  | 'checking'
  | 'authenticated'
  | 'anonymous'
  | 'unavailable';

export default function App() {
  const [authentication, setAuthentication] =
    useState<AuthenticationState>('checking');
  const isAuthRoute =
    window.location.pathname === '/login' ||
    window.location.pathname === '/signup';

  useEffect(() => {
    const requestedAuthRoute =
      window.location.pathname === '/login' ||
      window.location.pathname === '/signup';
    let isActive = true;
    getCurrentUser()
      .then(() => {
        if (!isActive) return;
        if (requestedAuthRoute) window.history.replaceState({}, '', '/');
        setAuthentication('authenticated');
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        if (error instanceof ApiError && error.status === 401) {
          if (!requestedAuthRoute) {
            window.history.replaceState({}, '', '/login');
          }
          setAuthentication('anonymous');
          return;
        }
        if (error instanceof Error) {
          setAuthentication('unavailable');
          return;
        }
        throw error;
      });
    return () => {
      isActive = false;
    };
  }, []);

  if (authentication === 'checking') return null;

  const showAuthPage =
    authentication === 'anonymous' ||
    (authentication === 'unavailable' && isAuthRoute);

  return (
    <Theme theme={neutralTheme} mode={showAuthPage ? 'light' : 'dark'}>
      {showAuthPage ? <AuthPage /> : <HandoverPage />}
    </Theme>
  );
}
