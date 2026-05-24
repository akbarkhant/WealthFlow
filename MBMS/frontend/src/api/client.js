const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh'];

let refreshPromise = null;
let onServerError = null;

export const setServerErrorHandler = (handler) => {
  onServerError = handler;
};

const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

const redirectToSessionExpired = () => {
  clearTokens();
  if (!window.location.pathname.includes('/session-expired')) {
    window.location.replace('/session-expired');
  }
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
          const message = (data && data.message) || response.statusText;
          throw new Error(message);
        }

        const payload =
          data && Object.prototype.hasOwnProperty.call(data, 'data') ? data.data : data;

        if (!payload?.accessToken) {
          throw new Error('Invalid refresh response');
        }

        localStorage.setItem('accessToken', payload.accessToken);
        if (payload.refreshToken) {
          localStorage.setItem('refreshToken', payload.refreshToken);
        }

        return payload.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

function unwrapBody(data) {
  if (data && Object.prototype.hasOwnProperty.call(data, 'success')) {
    if (Object.prototype.hasOwnProperty.call(data, 'meta')) {
      return { data: data.data, meta: data.meta };
    }
    if (Object.prototype.hasOwnProperty.call(data, 'data')) {
      return data.data;
    }
  }
  return data;
}

const handleResponse = async (response) => {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = new Error((data && data.message) || response.statusText || 'Request failed');
    error.status = response.status;
    error.data = data;

    if (response.status >= 500 && onServerError) {
      onServerError(error);
    }

    return Promise.reject(error);
  }

  return unwrapBody(data);
};

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('accessToken');
  const headers = {};

  if (token && token !== 'undefined' && token !== 'null') {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

const buildQuery = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, String(value));
    }
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
};

export const request = async (method, endpoint, body = null, options = {}) => {
  const { isFormData = false, skipAuthRetry = false } = options;

  const config = {
    method,
    headers: getHeaders(isFormData),
  };

  if (body !== null && body !== undefined) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => endpoint.startsWith(path));
  const doFetch = () => fetch(`${API_URL}${endpoint}`, config);

  try {
    let response = await doFetch();

    if (
      response.status === 401 &&
      !skipAuthRetry &&
      !isAuthEndpoint &&
      localStorage.getItem('refreshToken')
    ) {
      try {
        await refreshAccessToken();
        config.headers = getHeaders(isFormData);
        response = await doFetch();
      } catch (refreshError) {
        redirectToSessionExpired();
        const err = new Error('Session expired');
        err.status = 401;
        err.cause = refreshError;
        throw err;
      }
    }

    if (response.status === 401 && !isAuthEndpoint) {
      redirectToSessionExpired();
      throw new Error('Session expired');
    }

    return await handleResponse(response);
  } catch (err) {
    if (err instanceof Error && err.message) {
      throw err;
    }
    throw new Error('Network request failed');
  }
};

const api = {
  get: (endpoint) => request('GET', endpoint),
  post: (endpoint, body, options = {}) => request('POST', endpoint, body, options),
  patch: (endpoint, body) => request('PATCH', endpoint, body),
  delete: (endpoint) => request('DELETE', endpoint),
  buildQuery,
  getBaseUrl: () => API_URL,
  getOAuthUrl: (provider) => {
    const base = API_URL.replace(/\/api\/?$/, '');
    return `${base}/api/auth/${provider}`;
  },
};

export default api;
export { API_URL, buildQuery };
