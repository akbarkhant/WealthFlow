import api, { buildQuery } from './client';

export async function listBudgets({ month, year } = {}) {
  return api.get(`/budgets${buildQuery({ month, year })}`);
}

export async function getBudget(id) {
  return api.get(`/budgets/${id}`);
}

export async function createBudget(payload) {
  return api.post('/budgets', payload);
}

export async function updateBudget(id, payload) {
  return api.patch(`/budgets/${id}`, payload);
}

export async function deleteBudget(id) {
  return api.delete(`/budgets/${id}`);
}
