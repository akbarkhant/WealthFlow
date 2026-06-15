import api from './client';

export async function login(credentials) {
  return api.post('/auth/login', credentials);
}

export async function register(payload) {
  return api.post('/auth/register', payload);
}

export async function logout() {
  // Let the response bubble up naturally. 
  // State and storage cleanup are handled completely by AuthProvider.clearSession()
  return api.post('/auth/logout', {}, { skipAuthRetry: true });
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