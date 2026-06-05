import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Theme } from '@radix-ui/themes';
import * as Sentry from '@sentry/react';

import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { setServerErrorHandler } from './api/client';

import './index.css';

// Initialize Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,

  environment: import.meta.env.MODE,

  tracesSampleRate: 1.0,
});

// Existing API handler
setServerErrorHandler((err) => {
  console.error('[API]', err.message);

  Sentry.captureException(err);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<h1>Something went wrong</h1>}>
      <BrowserRouter>
        <AuthProvider>
          <Theme
            appearance="light"
            accentColor="green"
            grayColor="slate"
            radius="large"
          >
            <App />
          </Theme>
        </AuthProvider>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);