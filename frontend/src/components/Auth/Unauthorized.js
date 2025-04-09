// src/components/Auth/Unauthorized.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const Unauthorized = () => {
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Access Denied</h2>
        <div className="error-message">
          You don't have permission to access this page.
        </div>
        <div className="auth-footer">
          <Link to="/">Return to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;