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
  }
};

// Handle session expiration globally
const handleUnauthorized = () => {
  localStorage.removeItem('accessToken');
  window.location.href = '/login';
};