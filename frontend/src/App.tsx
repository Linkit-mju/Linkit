import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {AuthPage} from './auth/AuthPage';
import {HandoverPage} from './handover/HandoverPage';

export default function App() {
  const isAuthRoute =
    window.location.pathname === '/login' ||
    window.location.pathname === '/signup';

  return (
    <Theme theme={neutralTheme} mode={isAuthRoute ? 'light' : 'dark'}>
      {isAuthRoute ? <AuthPage /> : <HandoverPage />}
    </Theme>
  );
}
