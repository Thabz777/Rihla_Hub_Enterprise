import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { access_token, user } = response.data;

    if (access_token) {
      setToken(access_token);
      setUser(user);
      localStorage.setItem('token', access_token);
    }
    return response.data;
  };

  const verify2FA = async (email, token, temp_secret) => {
    const response = await axios.post(`${API}/auth/verify-2fa`, { email, token, temp_secret });
    const { access_token, user } = response.data;
    if (access_token) {
      setToken(access_token);
      setUser(user);
      localStorage.setItem('token', access_token);
    }
    return response.data;
  };

  const register = async (email, password, full_name) => {
    const response = await axios.post(`${API}/auth/register`, { email, password, full_name });
    const { access_token, user } = response.data;
    setToken(access_token);
    setUser(user);
    localStorage.setItem('token', access_token);
    return user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, verify2FA }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};