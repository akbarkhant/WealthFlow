import { API_URL } from './client';

export const NOTIFICATIONS_URL = `${API_URL}/notifications`;

export async function notificationFetch(path, options = {}) {
  return fetch(`${NOTIFICATIONS_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}
