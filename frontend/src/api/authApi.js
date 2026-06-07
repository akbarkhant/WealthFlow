import api from './client';

export async function login(credentials) {
  // If your api client doesn't automatically return response.data, 
  // extract it here: const res = await api.post('/auth/login', credentials); return res.data;
  return api.post('/auth/login', credentials);
}

export async function register(payload) {
  return api.post('/auth/register', payload);
}

export async function logout() {
  const refreshToken = localStorage.getItem('refreshToken');
  try {
    await api.post(
      '/auth/logout',
      refreshToken ? { refreshToken } : {},
      { skipAuthRetry: true }
    );
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export async function refresh(refreshToken) {
  return api.post('/auth/refresh', { refreshToken });
}

export function getOAuthUrl(provider) {
  // Match your exact client helper instance method
  return api.getOAuthUrl(provider);
}

export async function forgotPassword(email) {
  return api.post('/auth/forgot-password', { email });
}

export async function resetPassword(code, newPassword) {
  return api.post('/auth/reset-password', { code, newPassword });
}