import api, { buildQuery } from './client';

export async function listTransactions(params = {}) {
  const result = await api.get(`/transactions${buildQuery(params)}`);

  // Target result.data directly since it's already an array from your normalized API payload
  if (
    result &&
    typeof result === 'object' && 
    Array.isArray(result.data) && 
    result.meta
  ) {
    const total = Number(result.meta.total || 0);
    const limit = Number(result.meta.limit || 7);
    const calculatedTotalPages = limit > 0 ? Math.ceil(total / limit) : 1;

    return {
      data: result.data, // Accessing the array directly
      meta: {
        total,
        page: Number(result.meta.page || 1),
        limit,
        totalPages: calculatedTotalPages,
        hasMore: Number(result.meta.page || 1) < calculatedTotalPages,
      },
    };
  }

  // Pure fallback protection
  return {
    data: [],
    meta: {
      total: 0,
      page: params.page ?? 1,
      limit: params.limit ?? 7,
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