// src/components/Auth/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAnalysis } from '../../contexts/AnalysisContext';
import axios from 'axios';
import './Auth.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, error, loading } = useAuth();
  const { clearAnalysis, setActiveView } = useAnalysis();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsLoggingIn(true);
    
    if (!credentials.usernameOrEmail || !credentials.password) {
      setFormError('Please enter both email/username and password');
      setIsLoggingIn(false);
      return;
    }

    try {
      // Create form data for OAuth2 password flow
      const formData = new FormData();
      formData.append('username', credentials.usernameOrEmail);
      formData.append('password', credentials.password);
      
      // For debugging purposes, try a direct API call first
      try {
        const directResponse = await axios.post('http://localhost:8000/api/auth/login', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        console.log('Direct API login response:', directResponse.data);
        
        // If direct call works, try the context login
        const success = await login(credentials.usernameOrEmail, credentials.password);
        if (success) {
          // Reset the analysis state before navigating
          clearAnalysis();
          
          // Ensure the active view is set to 'both'
          setActiveView('both');
          
          // Navigate to the analysis page explicitly
          navigate('/');
        } else {
          setFormError('Login succeeded but user data could not be retrieved.');
        }
      } catch (directError) {
        console.error('Direct API login error:', directError);
        
        if (directError.response) {
          console.log('Response status:', directError.response.status);
          console.log('Response data:', directError.response.data);
          
          if (directError.response.data && directError.response.data.detail) {
            setFormError(`API Error: ${directError.response.data.detail}`);
          } else {
            setFormError(`API Error: ${directError.response.status} ${directError.response.statusText}`);
          }
        } else if (directError.request) {
          setFormError('No response from server. Please check your connection.');
        } else {
          setFormError(`Error: ${directError.message}`);
        }
      }
    } catch (err) {
      console.error('Login submission error:', err);
      setFormError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Login to WristSight AI</h2>
        
        {(error || formError) && (
          <div className="error-message">
            {formError || error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="usernameOrEmail">Email or Username</label>
            <input
              type="text"
              id="usernameOrEmail"
              name="usernameOrEmail"
              value={credentials.usernameOrEmail}
              onChange={handleChange}
              required
              disabled={isLoggingIn}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={isLoggingIn}
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={isLoggingIn || loading}
          >
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;