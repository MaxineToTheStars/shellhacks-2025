import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import './index.css';

// Auth0 Configuration
const domain = process.env.REACT_APP_AUTH0_DOMAIN || 'your-auth0-domain.auth0.com';
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID || 'your-auth0-client-id';
const audience = process.env.REACT_APP_AUTH0_AUDIENCE || 'your-auth0-api-identifier';
const redirectUri = process.env.REACT_APP_AUTH0_REDIRECT_URI || window.location.origin;

// Debug: Log environment variables (remove in production)
console.log('Auth0 Config:', {
  domain,
  clientId,
  audience,
  redirectUri,
  hasEnvFile: !!process.env.REACT_APP_AUTH0_DOMAIN
});

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
        scope: 'openid profile email'
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
