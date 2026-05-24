import api, { buildQuery } from './client';

export async function listTransactions(params = {}) {
  const result = await api.get(`/transactions${buildQuery(params)}`);

  if (result && typeof result === 'object' && Array.isArray(result.data) && result.meta) {
    return {
      data: result.data,
      meta: {
        ...result.meta,
        hasMore: result.meta.page < result.meta.totalPages,
      },
    };
  }

  const list = Array.isArray(result) ? result : [];
  return {
    data: list,
    meta: {
      total: list.length,
      page: params.page ?? 1,
      limit: params.limit ?? list.length,
      totalPages: 1,
      hasMore: false,
    },
  };
}

export async function getTransaction(id) {
  return api.get(`/transactions/${id}`);
}

export async function createTransaction(payload) {
  return api.post('/transactions', payload);
}

export async function updateTransaction(id, payload) {
  return api.patch(`/transactions/${id}`, payload);
}

export async function deleteTransaction(id) {
  return api.delete(`/transactions/${id}`);
}
