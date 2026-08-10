import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {AuthPage} from './auth/AuthPage';
import {HandoverPage} from './handover/HandoverPage';
import {LandingPage} from './landing/LandingPage';

export default function App() {
  const pathname = window.location.pathname;
  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  const isWorkspaceRoute = pathname === '/workspace';

  return (
    <Theme theme={neutralTheme} mode={isWorkspaceRoute ? 'dark' : 'light'}>
      {isAuthRoute ? (
        <AuthPage />
      ) : isWorkspaceRoute ? (
        <HandoverPage />
      ) : (
        <LandingPage />
      )}
    </Theme>
  );
}
