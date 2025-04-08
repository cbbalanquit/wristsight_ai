import React from 'react';
import { useAnalysis } from '../../contexts/AnalysisContext';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import './HistoryTable.css';

const HistoryTable = ({ records, loading }) => {
  const { setCurrentAnalysis } = useAnalysis();
  const { switchTab } = useApp();
  const navigate = useNavigate();
  
  const handleViewAnalysis = (record) => {
    setCurrentAnalysis(record);
    switchTab('analysis');
    navigate('/');
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const getStatusClass = (status) => {
    if (!status) return '';
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'complete') return 'status-complete';
    if (statusLower === 'in progress') return 'status-in-progress';
    if (statusLower === 'error') return 'status-error';
    
    return '';
  };
  
  return (
    <div className="history-table-wrapper">
      <table className="history-table">
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Date</th>
            <th>Summary</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="history-tbody">
          {loading ? (
            <tr>
              <td colSpan="5" className="loading-cell">Loading records...</td>
            </tr>
          ) : (
            records.map((record) => (
              <tr key={record.id}>
                <td>{record.patient_id}</td>
                <td>{formatDate(record.timestamp)}</td>
                <td className="summary-cell">
                  {record.summary ? 
                    (record.summary.length > 100 ? 
                      `${record.summary.substring(0, 100)}...` : 
                      record.summary) : 
                    'No summary available'}
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(record.status)}`}>
                    {record.status || 'Unknown'}
                  </span>
                </td>
                <td className="actions-cell">
                  <button 
                    className="view-btn"
                    onClick={() => handleViewAnalysis(record)}
                  >
                    <i className="fas fa-eye"></i> View
                  </button>
                </td>
              </tr>
            ))
          )}
          
          {!loading && records.length === 0 && (
            <tr>
              <td colSpan="5" className="empty-cell">No records found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;