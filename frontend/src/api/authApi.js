import api from './client';

export async function login(credentials) {
  return api.post('/auth/login', credentials);
}

export async function register(payload) {
  return api.post('/auth/register', payload);
}

export async function logout() {
  try {
    // The backend endpoint will automatically read your cookies and return 
    // Set-Cookie commands with past expiration dates to clear them.
    await api.post('/auth/logout', {}, { skipAuthRetry: true });
  } finally {
    // Only clean up non-sensitive client UI visibility trackers
    localStorage.removeItem('currentUser');
  }
}

export function getOAuthUrl(provider) {
  return api.getOAuthUrl(provider);
}

export async function forgotPassword(email) {
  return api.post('/auth/forgot-password', { email });
}

export async function resetPassword(code, newPassword) {
  return api.post('/auth/reset-password', { code, newPassword });
}