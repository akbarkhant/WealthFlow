import api, { buildQuery } from './client';

export async function listTransactions(params = {}) {
  const result = await api.get(`/transactions${buildQuery(params)}`);

  if (Array.isArray(result)) {
    return {
      data: result,
      meta: {
        total: result.length,
        page: params.page ?? 1,
        limit: params.limit ?? 7,
        totalPages: 1,
        hasMore: false,
      },
    };
  }

  if (result && typeof result === 'object' && Array.isArray(result.data)) {
    const total = Number(result.meta?.total ?? result.data.length ?? 0);
    const limit = Number(result.meta?.limit ?? params.limit ?? 7);
    const page = Number(result.meta?.page ?? params.page ?? 1);
    const calculatedTotalPages = limit > 0 ? Math.ceil(total / limit) : 1;

    return {
      data: result.data,
      meta: {
        total,
        page,
        limit,
        totalPages: calculatedTotalPages,
        hasMore: page < calculatedTotalPages,
      },
    };
  }

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
