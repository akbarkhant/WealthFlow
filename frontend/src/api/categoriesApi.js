import api from './client';

export async function listCategories() {
  return api.get('/categories');
}

export async function getCategory(id) {
  return api.get(`/categories/${id}`);
}

export async function createCategory(payload) {
  return api.post('/categories', payload);
}

export async function updateCategory(id, payload) {
  return api.patch(`/categories/${id}`, payload);
}

export async function deleteCategory(id) {
  return api.delete(`/categories/${id}`);
}
