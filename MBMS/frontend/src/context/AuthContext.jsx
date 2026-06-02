import { createContext, useCallback, useContext, useState, useEffect, useMemo } from 'react';
import { logout as apiLogout } from '../api/authApi';
import { getMe } from '../api/userApi';

const AuthContext = createContext(null);

const readStoredToken = () => {
  const stored = localStorage.getItem('accessToken');
  if (!stored || stored === 'undefined' || stored === 'null') {
    return null;
  }
  return stored;
};

const readStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(readStoredToken);
  const [loading, setLoading] = useState(!readStoredUser && !!readStoredToken);

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
    } catch (e) {
      console.warn('Backend logout request failed, logging out locally', e);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const login = useCallback((tokens, userObject = null) => {
    if (!tokens?.accessToken) return;

    localStorage.setItem('accessToken', tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }

    setToken(tokens.accessToken);

    if (userObject) {
      setUser(userObject);
      localStorage.setItem('currentUser', JSON.stringify(userObject));
    }
  }, []);

  // Sync / validate user profile against the database background thread
  useEffect(() => {
    let isMounted = true;

    const syncUserSession = async () => {
      if (!token) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const userData = await getMe();
        // The data layer unwraps this automatically if structured cleanly
        const verifiedUser = userData?.user || userData?.data?.user || userData;
        
        if (isMounted) {
          setUser(verifiedUser);
          localStorage.setItem('currentUser', JSON.stringify(verifiedUser));
        }
      } catch (error) {
        console.error('Session sync verification failed:', error);
        if (error.status === 401 && isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    syncUserSession();
    return () => { isMounted = false; };
  }, [token, clearSession]);

  const updateUser = useCallback((userObject) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...userObject };
      localStorage.setItem('currentUser', JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: Boolean(token),
  }), [user, token, loading, login, logout, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="auth-loading-screen">
          <div className="auth-loading-spinner" />
          <p>Loading WealthFlow...</p>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};