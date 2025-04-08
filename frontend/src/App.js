import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import AnalysisView from './components/Analysis/AnalysisView';
import HistoryView from './components/History/HistoryView';
import { AppProvider } from './contexts/AppContext';
import { AnalysisProvider } from './contexts/AnalysisContext';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000');
        if (response.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('error');
        }
      } catch (error) {
        console.error('API connectivity error:', error);
        setApiStatus('error');
      }
    };

    checkApiStatus();
  }, []);

  return (
    <Router>
      <AppProvider>
        <AnalysisProvider>
          <Layout apiStatus={apiStatus} retryConnection={() => setApiStatus('checking')}>
            <Routes>
              <Route path="/" element={<AnalysisView />} />
              <Route path="/history" element={<HistoryView />} />
            </Routes>
          </Layout>
        </AnalysisProvider>
      </AppProvider>
    </Router>
  );
}

export default App;