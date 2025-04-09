// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on page load
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Try to get current user with token
        const userData = await getCurrentUser();
        setUser(userData);
        setError(null);
      } catch (err) {
        console.error('Authentication error:', err);
        // Clear invalid token
        setToken(null);
        localStorage.removeItem('token');
        setError('Authentication failed. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Login function
  const login = async (usernameOrEmail, password) => {
    setLoading(true);
    try {
      console.log('AuthContext: Logging in with', { usernameOrEmail });
      const data = await loginUser(usernameOrEmail, password);
      
      console.log('Login response:', data);
      
      // Save token and update state
      const access_token = data.access_token;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      try {
        // Get user data
        console.log('Fetching user data...');
        const userData = await getCurrentUser();
        console.log('User data:', userData);
        setUser(userData);
      } catch (userError) {
        console.error('Error fetching user data:', userError);
        // If we can't get user data, at least create a basic user object from the token
        const tokenData = parseJwt(access_token);
        console.log('Using token data instead:', tokenData);
        setUser({
          id: tokenData.user_id || tokenData.sub,
          username: tokenData.sub || 'User',
          role: tokenData.role || 'NORMAL'
        });
      }
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || err.message || 'Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await registerUser(userData);
      setError(null);
      return data;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || err.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Helper function to parse JWT
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error parsing JWT:', e);
      return {};
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);