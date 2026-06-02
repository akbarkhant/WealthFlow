// goalsApi.js - API client for goals-related endpoints

const BASE_URL = '/api/goals';

// Helper function to handle global headers and authentication
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Centralized API endpoints handler object
export const goalsApi = {
  // Fetch all goals: GET /api/goals
  getAll: async () => {
    const response = await fetch(BASE_URL, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (response.status === 401) handleUnauthorized();
    return response.json();
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

      const token = localStorage.getItem('accessToken');

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include authorization headers if your middleware expects them here
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(goalData),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message || 'API Network Error' };
    }
  },

  delete: async (goalId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}` // Mirroring your successful POST fix!
        }
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message || 'API Network Error' };
    }
  },
};

// ../api/goalsApi.js (or wherever your API layer lives)


// Handle session expiration globally
const handleUnauthorized = () => {
  localStorage.removeItem('accessToken');
  window.location.href = '/login';
};