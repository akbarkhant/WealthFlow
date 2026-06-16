import api from './client';

const goalsApi = {
  getAll: () => api.get('/goals'),

  contribute: (goalId, amount) =>
    api.post(`/goals/${goalId}/contribute`, { amount: Number(amount) }),

  create: (goalData) => api.post('/goals', goalData),

  delete: (goalId) => api.delete(`/goals/${goalId}`),
};

export { goalsApi };
