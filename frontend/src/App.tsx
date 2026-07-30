import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {AuthPage} from './auth/AuthPage';

export default function App() {
  return (
    <Theme theme={neutralTheme} mode="light">
      <AuthPage />
    </Theme>
  );
}
