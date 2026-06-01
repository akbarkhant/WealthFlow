import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Theme } from '@radix-ui/themes';

import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { setServerErrorHandler } from './api/client';



import './index.css';

setServerErrorHandler((err) => {
  console.error('[API]', err.message);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Theme appearance="light" accentColor="green" grayColor="slate" radius="large">
          <App />
        </Theme>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
