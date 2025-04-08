import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import Header from './Header';
import './Layout.css';

const Layout = ({ children, apiStatus, retryConnection }) => {
  const { currentTab, switchTab } = useApp();
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    switchTab(tab);
    navigate(tab === 'analysis' ? '/' : '/history');
  };

  const renderApiError = () => {
    if (apiStatus === 'error') {
      return (
        <div className="api-error-message">
          <div className="api-error-content">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>API Connection Error</h3>
            <p>Unable to connect to the WristSight AI backend API. Please check that your backend server is running.</p>
            <button onClick={retryConnection}>Retry Connection</button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="app">
      {renderApiError()}
      
      <Header 
        currentTab={currentTab} 
        onTabChange={handleTabChange} 
      />
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;