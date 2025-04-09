// src/components/Layout/Header.js
import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = ({ currentTab, onTabChange }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="logo-container">
        <img src="logo.svg" alt="WristSight AI Logo" className="logo" />
        <h1>WristSight AI</h1>
      </div>
      
      <nav className="main-nav">
        <ul>
          <li>
            <button 
              className={`nav-button ${currentTab === 'analysis' ? 'active' : ''}`}
              onClick={() => onTabChange('analysis')}
            >
              Analysis
            </button>
          </li>
          <li>
            <button 
              className={`nav-button ${currentTab === 'history' ? 'active' : ''}`}
              onClick={() => onTabChange('history')}
            >
              Patient History
            </button>
          </li>
        </ul>
      </nav>
      
      <div className="user-controls">
        {isAuthenticated ? (
          <>
            <span className="user-info">
              {user?.username}
              {user?.role && <span className="user-role">({user.role})</span>}
            </span>
            <button className="settings-button">
              <i className="fas fa-cog"></i>
            </button>
            <button className="help-button">
              <i className="fas fa-question-circle"></i>
            </button>
            <button className="logout-button" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-button">Login</Link>
            <Link to="/register" className="register-button">Register</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;