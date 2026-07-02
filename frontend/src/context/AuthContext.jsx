import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/me');
      setUser(response.data);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }

    // Interceptor logout trigger handler
    const handleLogoutTrigger = () => {
      logout();
    };

    window.addEventListener('auth_logout', handleLogoutTrigger);
    return () => {
      window.removeEventListener('auth_logout', handleLogoutTrigger);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      await fetchProfile();
      return true;
    } catch (error) {
      setLoading(false);
      throw error.response?.data?.detail || 'Login failed. Please check credentials.';
    }
  };

  const signup = async (email, password) => {
    setLoading(true);
    try {
      await api.post('/auth/signup', { email, password });
      // Automatically log in after successful signup
      return await login(email, password);
    } catch (error) {
      setLoading(false);
      throw error.response?.data?.detail || 'Registration failed. Email might be in use.';
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
