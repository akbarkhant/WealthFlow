import { createContext, useCallback, useContext, useState, useEffect, useMemo } from 'react';
import { logout as apiLogout } from '../api/authApi';
import { getMe } from '../api/userApi';

const AuthContext = createContext(null);

const readStoredToken = () => {
  const stored = localStorage.getItem('accessToken');
  if (!stored || stored === 'undefined' || stored === 'null') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
  return stored;
};

const normalizeTokens = (tokens) => {
  if (!tokens) return null;
  if (tokens.accessToken) return tokens;
  if (tokens.data?.accessToken) return tokens.data;
  return null;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(readStoredToken);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // still clear locally
    }
    clearSession();
  }, [clearSession]);

  const login = useCallback((tokens, userObject = null) => {
    const payload = normalizeTokens(tokens);
    const accessToken = payload?.accessToken;
    const refreshToken = payload?.refreshToken || '';

    if (!accessToken) {
      console.error('login: missing accessToken', tokens);
      return;
    }

    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    if (userObject) {
      setUser(userObject);
      localStorage.setItem('currentUser', JSON.stringify(userObject));
    }

    setToken(accessToken);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userData = await getMe();
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
      } catch (error) {
        console.error('Failed to fetch user:', error);
        if (error.status === 401) {
          clearSession();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, clearSession]);

  const updateUser = useCallback((userObject) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...userObject };
      localStorage.setItem('currentUser', JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      updateUser,
      isAuthenticated: Boolean(token),
    }),
    [user, token, loading, login, logout, updateUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="auth-loading-screen">
          <div className="auth-loading-spinner" />
          <p>Loading WealthFlow...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
