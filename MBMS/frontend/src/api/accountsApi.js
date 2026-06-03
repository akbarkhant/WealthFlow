// src/modules/accounts/api/accounts.api.js
//
// All HTTP concerns (auth headers, token refresh, 401 redirect, response
// unwrapping, error normalisation) are handled by client.js.
// This file is purely a thin route-mapping layer.
//
import api from './client';

// ─── Collection ──────────────────────────────────────────────────────────────

export const createAccount = (payload) =>
  api.post('/accounts', payload);

export const listAccounts = () =>
  api.get('/accounts');

// ─── Analytics ───────────────────────────────────────────────────────────────

export const getAccountsSummary = () =>
  api.get('/accounts/summary');

export const getNetWorth = () =>
  api.get('/accounts/net-worth');

export const getAIContext = () =>
  api.get('/accounts/ai-context');

// ─── Instance ────────────────────────────────────────────────────────────────

export const getAccountById = (id) =>
  api.get(`/accounts/${id}`);

// The backend router uses PUT for full/partial updates
export const updateAccount = (id, payload) =>
  api.post(`/accounts/${id}`, payload, { headers: { 'X-HTTP-Method-Override': 'PUT' } });
// NOTE: client.js exposes get/post/patch/delete but not put.
// If your team adds api.put() to client.js, replace the line above with:
//   api.put(`/accounts/${id}`, payload)

export const removeAccount = (id) =>
  api.delete(`/accounts/${id}`);

// ─── State Modifiers ─────────────────────────────────────────────────────────

export const archiveAccount = (id) =>
  api.patch(`/accounts/${id}/archive`);

export const restoreAccount = (id) =>
  api.patch(`/accounts/${id}/restore`);

export const setDefaultAccount = (id) =>
  api.patch(`/accounts/${id}/default`);

// ─── Ledger Mutations ────────────────────────────────────────────────────────

export const depositFunds = (id, amount) =>
  api.post(`/accounts/${id}/deposit`, { amount });

export const withdrawFunds = (id, amount) =>
  api.post(`/accounts/${id}/withdraw`, { amount });

export const transferFunds = (sourceId, targetAccountId, amount) =>
  api.post(`/accounts/${sourceId}/transfer`, { targetAccountId, amount });