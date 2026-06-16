import api, { API_URL } from './client';

// ── Chat ──────────────────────────────────────────────────────────────────────
export const getChatHistory = () =>
  api.get('/ai/chat/history');

export const clearChatHistory = () =>
  api.delete('/ai/chat/history');

// Streaming chat — returns a raw fetch Response for chunk reading
export const streamChat = async (message, history = []) =>
  fetch(`${API_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ message, history }),
  });

// ── Analyze & Forecast ────────────────────────────────────────────────────────
export const getAiAnalysis = () =>
  api.post('/ai/analyze', {});

export const getSpendingForecast = () =>
  api.post('/ai/suggest', {});

// ── Receipt Scanner ───────────────────────────────────────────────────────────
export const scanReceipt = (file) => {
  const formData = new FormData();
  formData.append('receipt', file);
  return api.post('/ai/receipt', formData, { isFormData: true });
};

// ── Education ─────────────────────────────────────────────────────────────────
export const getEducationTopics = () =>
  api.get('/ai/education');

export const getEducationTip = (index) =>
  api.get(`/ai/education/${index}`);

export const getEducationTipByTopic = (topic) =>
  api.get(`/ai/education/topic/${encodeURIComponent(topic)}`);

// ── Monthly PDF Report ────────────────────────────────────────────────────────
export const downloadMonthlyReport = async (month) => {
  const response = await fetch(`${API_URL}/ai/report/${month}`, {
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Report generation failed');

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `WealthFlow_Report_${month}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};
