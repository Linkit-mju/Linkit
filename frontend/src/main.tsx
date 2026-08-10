if (import.meta.env.DEV) {
  void import('react-grab');
  void import('react-scan');
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) throw new TypeError('Linkit root element was not found.');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
