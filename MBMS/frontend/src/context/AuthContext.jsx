import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const userData = await api.get('/auth/me');
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = (tokens, userObject = null) => {
    const accessToken = tokens?.accessToken || tokens;
    const refreshToken = tokens?.refreshToken || '';
    setToken(accessToken);
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    if (userObject) {
      setUser(userObject);
      localStorage.setItem('currentUser', JSON.stringify(userObject));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  };

  const updateUser = (userObject) => {
    setUser(prev => {
      const nextUser = { ...prev, ...userObject };
      localStorage.setItem('currentUser', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f8f9ff',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5eeff',
            borderTop: '4px solid #006c49',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '16px', color: '#586377', fontWeight: 500 }}>Loading WealthFlow...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};
