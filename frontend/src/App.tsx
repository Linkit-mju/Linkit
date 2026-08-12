import {useEffect, useState} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {ApiError} from './api';
import {AuthPage} from './auth/AuthPage';
import {getCurrentUser} from './auth/api';
import {
  EmailVerificationConfirmPage,
  EmailVerificationPendingPage,
} from './auth/EmailVerificationPage';
import {HandoverPage} from './handover/HandoverPage';
import {OrganizationJoinPage} from './organization/OrganizationJoinPage';
import {OrganizationJoinSuccessPage} from './organization/OrganizationJoinSuccessPage';
import type {JoinedOrganization} from './organization/api';
import {OrganizationChartPage} from './organizationChart/OrganizationChartPage';

type AuthenticationState = 'checking' | 'authenticated' | 'anonymous' | 'unavailable';

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function isPublicAuthRoute(pathname: string) {
  return pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/verify-email' ||
    pathname === '/verify-email/pending';
}

export default function App() {
  const [authentication, setAuthentication] = useState<AuthenticationState>('checking');
  const [pathname, setPathname] = useState(window.location.pathname);
  const [joinedOrganization, setJoinedOrganization] = useState<JoinedOrganization>();

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    let active = true;
    getCurrentUser()
      .then(() => {
        if (!active) return;
        if (pathname === '/login' || pathname === '/signup') navigate('/');
        setAuthentication('authenticated');
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          if (!isPublicAuthRoute(pathname)) navigate('/login');
          setAuthentication('anonymous');
          return;
        }
        setAuthentication('unavailable');
      });
    return () => {
      active = false;
      window.removeEventListener('popstate', onPopState);
    };
  }, [pathname]);

  if (authentication === 'checking') return null;

  let page;
  if (pathname === '/verify-email/pending') {
    page = <EmailVerificationPendingPage email={new URLSearchParams(window.location.search).get('email') ?? ''} onLogin={() => navigate('/login')}/>;
  } else if (pathname === '/verify-email') {
    page = <EmailVerificationConfirmPage token={new URLSearchParams(window.location.search).get('token') ?? ''} onLogin={() => navigate('/login')}/>;
  } else if (authentication !== 'authenticated') {
    page = <AuthPage
      onLoginSuccess={() => navigate('/')}
      onSignUpSuccess={(email) => navigate(`/verify-email/pending?email=${encodeURIComponent(email)}`)}
      onVerificationRequired={(email) => navigate(`/verify-email/pending?email=${encodeURIComponent(email)}`)}
    />;
  } else if (pathname === '/organization/join') {
    page = <OrganizationJoinPage onJoined={(organization) => {setJoinedOrganization(organization); navigate('/organization/join/success');}} onDashboard={() => navigate('/')}/>;
  } else if (pathname === '/organization/join/success') {
    page = <OrganizationJoinSuccessPage organization={joinedOrganization}/>;
  } else if (pathname === '/organization-chart') {
    page = <OrganizationChartPage/>;
  } else {
    page = <HandoverPage/>;
  }

  const lightMode = authentication !== 'authenticated' || isPublicAuthRoute(pathname) || pathname.startsWith('/organization/join');
  return <Theme theme={neutralTheme} mode={lightMode ? 'light' : 'dark'}>{page}</Theme>;
}
