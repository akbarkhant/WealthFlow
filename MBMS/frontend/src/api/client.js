const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh'];

let refreshPromise = null;
let onServerError = null;

export const setServerErrorHandler = (handler) => {
  onServerError = handler;
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  return Boolean(token && token !== 'null' && token !== 'undefined');
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
          throw new Error((data && data.message) || response.statusText);
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

const getResponseMeta = (response, data) => ({
  requestId: response.headers.get('x-request-id') || data?.requestId || null,
  retryAfter: response.headers.get('retry-after') || null,
});

const attachMeta = (payload, meta) => {
  if (!meta.requestId || !payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return payload;
  }

  return { ...payload, requestId: payload.requestId || meta.requestId };
};

const handleResponse = async (response) => {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;
  const meta = getResponseMeta(response, data);

  if (!response.ok) {
    const error = new Error((data && data.message) || response.statusText || 'Request failed');

    error.status = response.status;
    error.data = data;
    error.requestId = meta.requestId;
    error.retryAfter = meta.retryAfter;

    if (response.status >= 500 && onServerError) {
      onServerError(error);
    }

    throw error;
  }

  return attachMeta(unwrapBody(data), meta);
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

const buildUrl = (endpoint, params) => {
  const query = buildQuery(params);
  if (!query) {
    return `${API_URL}${endpoint}`;
  }

  const separator = endpoint.includes('?') ? '&' : '?';
  return `${API_URL}${endpoint}${separator}${query.slice(1)}`;
};

export const request = async (method, endpoint, body = null, options = {}) => {
  const {
    headers: customHeaders = {},
    isFormData = false,
    params,
    signal,
    skipAuthRetry = false,
  } = options;

  const requestConfig = {
    method,
    headers: {
      ...getHeaders(isFormData),
      ...customHeaders,
    },
    ...(signal && { signal }),
  };

  if (body !== null && body !== undefined) {
    requestConfig.body = isFormData ? body : JSON.stringify(body);
  }

  const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => endpoint.startsWith(path));
  const url = buildUrl(endpoint, params);
  const doFetch = () => fetch(url, requestConfig);

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
        requestConfig.headers = {
          ...getHeaders(isFormData),
          ...customHeaders,
        };
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
    throw new Error('Network request failed', { cause: err });
  }
};

const api = {
  get: (endpoint, options = {}) => request('GET', endpoint, null, options),
  post: (endpoint, body, options = {}) => request('POST', endpoint, body, options),
  patch: (endpoint, body, options = {}) => request('PATCH', endpoint, body, options),
  delete: (endpoint, options = {}) => request('DELETE', endpoint, null, options),
  buildQuery,
  getBaseUrl: () => API_URL,
  getOAuthUrl: (provider) => {
    const base = API_URL.replace(/\/api\/?$/, '');
    return `${base}/api/auth/${provider}`;
  },
};

export default api;
export { API_URL, buildQuery };
