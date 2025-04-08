import React from 'react';
import './Header.css';

const Header = ({ currentTab, onTabChange }) => {
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
        <button className="settings-button">
          <i className="fas fa-cog"></i>
        </button>
        <button className="help-button">
          <i className="fas fa-question-circle"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;