import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const clearAuth = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        clearAuth();
        navigate('/login');
        return null;
      }

      const response = await api.post('/auth/refresh-token', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      return accessToken;
    } catch (error) {
      clearAuth();
      navigate('/login');
      return null;
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (storedUser && accessToken && refreshToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);

      if (user.role === 'admin' || user.role === 'service_manager') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      // Auto-login after registration could be done, or just navigate to login
      navigate('/login');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const googleAuth = async (userData) => {
    try {
      const response = await api.post('/auth/google-auth', userData);
      const { accessToken, refreshToken, user } = response.data;

      // 1. Persist auth session to localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // 2. Update React Context state
      setUser(user);

      // 3. Navigate based on user role
      if (user.role === 'admin' || user.role === 'service_manager') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Google authentication failed'
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Unable to update profile' };
    }
  };

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshAccessToken, updateProfile, googleAuth }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
