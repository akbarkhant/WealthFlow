const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh'];

let refreshPromise = null;
let onServerError = null;

export const setServerErrorHandler = (handler) => {
  onServerError = handler;
};

// Removed isAuthenticated() - now checking via getMe() call instead

const createSessionExpiredError = (cause) => {
  const err = new Error('Session expired');
  err.status = 401;
  err.isSessionExpired = true;
  if (cause) err.cause = cause;
  return err;
};

export const isSessionExpiredError = (err) =>
  err?.isSessionExpired === true ||
  (err?.status === 401 && err?.message === 'Session expired');

const redirectToSessionExpired = () => {
  //  DO NOT clear cookies - they are HttpOnly
  localStorage.removeItem('currentUser');
  // Prevent infinite loops if an API call triggers on the session-expired page itself
  if (
    !window.location.pathname.includes('/session-expired') && 
    !window.location.pathname.includes('/login')
  ) {
    window.location.replace('/session-expired');
  }
};

const refreshAccessToken = async () => {
  //  Refresh token is in HttpOnly cookie, backend will handle it
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  //  Send cookies automatically
    })
      .then(async (response) => {
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
          throw new Error((data && data.message) || response.statusText);
        }

        //  Backend sets new accessToken cookie, we just verify success
        return true;
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
  if (!query) return `${API_URL}${endpoint}`;
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

  const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => endpoint.startsWith(path));
  const url = buildUrl(endpoint, params);

  // Dynamic configuration builder to ensure fresh headers and state evaluation on each invocation
  const buildConfig = () => {
    const defaultHeaders = {};
    if (!isFormData) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const configObj = {
      method,
      headers: {
        ...defaultHeaders,
        ...customHeaders,
      },
      credentials: 'include',  // Send/receive cookies automatically
      ...(signal && { signal }),
    };

    if (body !== null && body !== undefined) {
      configObj.body = isFormData ? body : JSON.stringify(body);
    }

    return configObj;
  };

  try {
    let response = await fetch(url, buildConfig());

    if (
      response.status === 401 &&
      !skipAuthRetry &&
      !isAuthEndpoint
    ) {
      try {
        await refreshAccessToken();
        
        // Yield execution context to let the browser process the incoming Set-Cookie headers
        await new Promise((resolve) => setTimeout(resolve, 35));

        // Reconstruct fetch parameters dynamically fresh after token refresh finishes
        response = await fetch(url, buildConfig());
      } catch (refreshError) {
        redirectToSessionExpired();
        throw createSessionExpiredError(refreshError);
      }
    }

    if (response.status === 401 && !isAuthEndpoint) {
      redirectToSessionExpired();
      throw createSessionExpiredError();
    }

    return await handleResponse(response);
  } catch (err) {
    if (err instanceof Error && err.status) throw err;
    throw err;
  }
};

const api = {
  get: (endpoint, options = {}) => request('GET', endpoint, null, options),
  post: (endpoint, body, options = {}) => request('POST', endpoint, body, options),
  put: (endpoint, body, options = {}) => request('PUT', endpoint, body, options),
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