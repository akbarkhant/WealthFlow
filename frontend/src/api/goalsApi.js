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

    return json;
  },

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
        headers: getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message || 'API Network Error' };
    }
  },
};

export { goalsApi }; 
