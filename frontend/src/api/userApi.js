import api from './client';

export async function getMe() {
  return api.get('/users/me');
}

export async function updateMe(payload) {
  return api.put('/users/me', payload);
}

export async function deleteMe() {
  return api.delete('/users/me');
}
