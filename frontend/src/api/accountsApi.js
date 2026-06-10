import api from './client';

export const createAccount = (payload) =>
  api.post('/accounts', payload);

export const listAccounts = () =>
  api.get('/accounts');

export const getAccountsSummary = () =>
  api.get('/accounts/summary');

export const getNetWorth = () =>
  api.get('/accounts/net-worth');

export const getAIContext = () =>
  api.get('/accounts/ai-context');

export const recoverAllAccounts = () =>
  api.patch('/accounts/recover-all');

export const getAccountById = (id) =>
  api.get(`/accounts/${id}`);

export const updateAccount = (id, payload) =>
  api.put(`/accounts/${id}`, payload);

export const removeAccount = (id) =>
  api.delete(`/accounts/${id}`);

export const archiveAccount = (id) =>
  api.patch(`/accounts/${id}/archive`);

export const restoreAccount = (id) =>
  api.patch(`/accounts/${id}/restore`);

export const setDefaultAccount = (id) =>
  api.patch(`/accounts/${id}/default`);

export const depositFunds = (id, amount) =>
  api.post(`/accounts/${id}/deposit`, { amount });

export const withdrawFunds = (id, amount) =>
  api.post(`/accounts/${id}/withdraw`, { amount });

export const transferFunds = (sourceId, targetAccountId, amount) =>
  api.post(`/accounts/${sourceId}/transfer`, { targetAccountId, amount });