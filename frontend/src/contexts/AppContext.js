// src/contexts/AppContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [currentTab, setCurrentTab] = useState('analysis'); // 'analysis' or 'history'
  const navigate = useNavigate();
  const location = useLocation();
  
  // Sync tab state with current URL on location changes
  useEffect(() => {
    // This handles the functionality you wanted (defaulting to analysis on login)
    // as well as keeping the tab state in sync with the URL
    if (location.pathname === '/') {
      setCurrentTab('analysis');
    } else if (location.pathname === '/history') {
      setCurrentTab('history');
    }
  }, [location.pathname]);
  
  // App-wide state and functions
  const value = {
    currentTab,
    setCurrentTab,
    switchTab: (tab) => {
      setCurrentTab(tab);
      navigate(tab === 'analysis' ? '/' : '/history');
      console.log('Tab switched to:', tab);
    }
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;