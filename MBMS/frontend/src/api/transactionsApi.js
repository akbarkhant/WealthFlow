import api, { buildQuery } from './client';

export async function listTransactions(params = {}) {
  const result = await api.get(`/transactions${buildQuery(params)}`);

  // Fix: Target result.data.rows since the backend response uses the pg driver format
  if (
    result &&
    typeof result === 'object' && 
    result.data && 
    Array.isArray(result.data.rows) && 
    result.meta
  ) {
    return {
      data: result.data.rows, // Pull the array out of the nested rows property
      meta: {
        ...result.meta,
        // Calculate total pages based on meta values
        totalPages: result.meta.limit > 0 ? Math.ceil(result.meta.total / result.meta.limit) : 0,
        hasMore: result.meta.page < result.meta.totalPages,
      },
    };
  }

  // Fallback fallback logic safety check
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