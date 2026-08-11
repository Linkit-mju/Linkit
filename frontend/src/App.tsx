import {useEffect, useState} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {AuthPage} from './auth/AuthPage';
import {
  EmailVerificationConfirmPage,
  EmailVerificationPendingPage,
} from './auth/EmailVerificationPage';
import {DashboardPlaceholderPage} from './dashboard/DashboardPlaceholderPage';
import {OrganizationJoinPage} from './organization/OrganizationJoinPage';
import {OrganizationJoinSuccessPage} from './organization/OrganizationJoinSuccessPage';
import type {JoinedOrganization} from './organization/api';

function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function App() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [joinedOrganization, setJoinedOrganization] =
    useState<JoinedOrganization>();

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  let page;
  if (pathname === '/verify-email/pending') {
    page = (
      <EmailVerificationPendingPage
        email={new URLSearchParams(window.location.search).get('email') ?? ''}
        onLogin={() => navigate('/login')}
      />
    );
  } else if (pathname === '/verify-email') {
    page = (
      <EmailVerificationConfirmPage
        token={new URLSearchParams(window.location.search).get('token') ?? ''}
        onLogin={() => navigate('/login')}
      />
    );
  } else if (pathname === '/organization/join') {
    page = (
      <OrganizationJoinPage
        onJoined={(organization) => {
          setJoinedOrganization(organization);
          navigate('/organization/join/success');
        }}
        onDashboard={() => navigate('/dashboard')}
      />
    );
  } else if (pathname === '/organization/join/success') {
    page = (
      <OrganizationJoinSuccessPage organization={joinedOrganization} />
    );
  } else if (pathname === '/dashboard') {
    page = <DashboardPlaceholderPage />;
  } else {
    page = (
      <AuthPage
        onLoginSuccess={() => navigate('/organization/join')}
        onSignUpSuccess={(email) =>
          navigate(`/verify-email/pending?email=${encodeURIComponent(email)}`)
        }
        onVerificationRequired={(email) =>
          navigate(`/verify-email/pending?email=${encodeURIComponent(email)}`)
        }
      />
    );
  }

  return (
    <Theme theme={neutralTheme} mode="light">
      {page}
    </Theme>
  );
}
