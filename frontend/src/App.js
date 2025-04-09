import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import AnalysisView from './components/Analysis/AnalysisView';
import HistoryView from './components/History/HistoryView';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Unauthorized from './components/Auth/Unauthorized';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { AppProvider } from './contexts/AppContext';
import { AnalysisProvider } from './contexts/AnalysisContext';
import { AuthProvider } from './contexts/AuthContext';
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
      <AuthProvider>
        <AppProvider>
          <AnalysisProvider>
            <Routes>
              {/* Public Routes - Accessible without authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected Routes - Require authentication */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={
                  <Layout apiStatus={apiStatus} retryConnection={() => setApiStatus('checking')}>
                    <AnalysisView />
                  </Layout>
                } />
                <Route path="/history" element={
                  <Layout apiStatus={apiStatus} retryConnection={() => setApiStatus('checking')}>
                    <HistoryView />
                  </Layout>
                } />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnalysisProvider>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;