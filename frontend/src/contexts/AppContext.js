import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [currentTab, setCurrentTab] = useState('analysis'); // 'analysis' or 'history'
  
  // App-wide state and functions
  const value = {
    currentTab,
    setCurrentTab,
    switchTab: (tab) => {
      setCurrentTab(tab);
    }
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;