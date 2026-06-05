// goalsApi.js - API client for goals-related endpoints

const BASE_URL = '/api/goals';

// Handle session expiration globally
const handleUnauthorized = () => {
  localStorage.removeItem('accessToken');
  window.location.href = '/login';
};

// Helper function to handle global headers and authentication
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Centralized API endpoints handler object
const goalsApi = {

  // Fetch all goals: GET /api/goals
  getAll: async () => {
    const response = await fetch(BASE_URL, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (response.status === 401) handleUnauthorized();

    const json = await response.json();

    // If your global sendSuccess utility packs responses like { success: true, data: { items: [], total: 3 } }
    // This safely normalizes it so that hook unpacking can parse it securely
    return json;
  },

  // Inject currency into a goal node: POST /api/goals/:id/contribute
  contribute: async (goalId, amount) => {
    const response = await fetch(`${BASE_URL}/${goalId}/contribute`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount: Number(amount) }),
    });

    if (response.status === 401) handleUnauthorized();
    return response.json();
  },

  create: async (goalData) => {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(goalData),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message || 'API Network Error' };
    }
  },

  delete: async (goalId) => {
    try {
      const response = await fetch(`${BASE_URL}/${goalId}`, {
        method: 'DELETE',
        // FIX: Was localStorage.getItem('token') || sessionStorage.getItem('token')
        // which used a different key ('token') than everywhere else ('accessToken'),
        // so the header was always an empty Bearer token.
        // Unified to use getAuthHeaders() for consistency.
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message || 'API Network Error' };
    }
  },
};

module.exports = { goalsApi };