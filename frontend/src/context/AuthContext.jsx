import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';

import * as Sentry from '@sentry/react';

import { logout as apiLogout } from '../api/authApi';
import { getMe } from '../api/userApi';

const AuthContext = createContext(null);

// ✅ Helper to read user info from localStorage (non-sensitive)
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

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);

    // Clear Sentry user context
    Sentry.setUser(null);

    // ✅ DO NOT clear cookies - they are HttpOnly
    // Browser will clear them automatically on logout
    localStorage.removeItem('currentUser');
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();

      Sentry.captureMessage('User logged out', 'info');
    } catch (error) {
      console.warn(
        'Backend logout request failed, logging out locally',
        error
      );

      Sentry.captureException(error, {
        tags: {
          feature: 'logout',
        },
      });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const login = useCallback((userObject = null) => {
    if (userObject) {
      setUser(userObject);

      localStorage.setItem(
        'currentUser',
        JSON.stringify(userObject)
      );

      // Associate Sentry events with this user
      Sentry.setUser({
        id: userObject.id,
        email: userObject.email,
        username:
          userObject.username ||
          userObject.name ||
          userObject.fullName,
      });

      // Helpful tags for filtering errors
      if (userObject.role) {
        Sentry.setTag('role', userObject.role);
      }

      Sentry.setContext('auth', {
        userId: userObject.id,
        email: userObject.email,
      });

      Sentry.captureMessage('User logged in', 'info');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncUserSession = async () => {
      try {
        // ✅ Try to fetch user - if 401, we're not authenticated
        const userData = await getMe();

        const verifiedUser =
          userData?.user ||
          userData?.data?.user ||
          userData;

        if (isMounted) {
          setUser(verifiedUser);

          localStorage.setItem(
            'currentUser',
            JSON.stringify(verifiedUser)
          );

          // Restore Sentry user after refresh
          Sentry.setUser({
            id: verifiedUser.id,
            email: verifiedUser.email,
            username:
              verifiedUser.username ||
              verifiedUser.name ||
              verifiedUser.fullName,
          });

          if (verifiedUser.role) {
            Sentry.setTag(
              'role',
              verifiedUser.role
            );
          }

          Sentry.setContext('auth', {
            userId: verifiedUser.id,
            email: verifiedUser.email,
          });
        }
      } catch (error) {
        console.error(
          'Session sync verification failed:',
          error
        );

        Sentry.captureException(error, {
          tags: {
            feature: 'auth-sync',
          },
        });

        if (error?.status === 401 && isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    syncUserSession();

    return () => {
      isMounted = false;
    };
  }, [clearSession]);

  const updateUser = useCallback((userObject) => {
    setUser((prev) => {
      const nextUser = {
        ...prev,
        ...userObject,
      };

      localStorage.setItem(
        'currentUser',
        JSON.stringify(nextUser)
      );

      // Keep Sentry user information updated
      Sentry.setUser({
        id: nextUser.id,
        email: nextUser.email,
        username:
          nextUser.username ||
          nextUser.name ||
          nextUser.fullName,
      });

      if (nextUser.role) {
        Sentry.setTag('role', nextUser.role);
      }

      return nextUser;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      updateUser,
      clearSession,
      isAuthenticated: !!user,
    }),
    [user, loading, login, logout, updateUser, clearSession]
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