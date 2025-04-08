import React, { useState, useEffect } from 'react';
import './HistorySearch.css';

const HistorySearch = ({ filters, onSearch, onReset, onQuickSearch }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  
  // Update local state when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  const handlePatientIdChange = (e) => {
    setLocalFilters(prev => ({ ...prev, patientId: e.target.value }));
  };
  
  const handleStartDateChange = (e) => {
    setLocalFilters(prev => ({ ...prev, startDate: e.target.value }));
  };
  
  const handleEndDateChange = (e) => {
    setLocalFilters(prev => ({ ...prev, endDate: e.target.value }));
  };
  
  const handleQuickSearchChange = (e) => {
    const value = e.target.value;
    setLocalFilters(prev => ({ ...prev, quickSearch: value }));
    
    // Call onQuickSearch after a short delay
    const timeoutId = setTimeout(() => {
      onQuickSearch(value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(localFilters);
  };
  
  const handleReset = () => {
    const resetFilters = {
      patientId: '',
      startDate: '',
      endDate: '',
      quickSearch: ''
    };
    setLocalFilters(resetFilters);
    onReset();
  };
  
  return (
    <div className="history-search">
      <form id="history-search-form" onSubmit={handleSubmit}>
        <div className="search-filters">
          <div className="filter-group">
            <label htmlFor="history-patient-id">Patient ID:</label>
            <input
              type="text"
              id="history-patient-id"
              placeholder="Enter patient ID"
              value={localFilters.patientId}
              onChange={handlePatientIdChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="start-date">Start Date:</label>
            <input
              type="date"
              id="start-date"
              value={localFilters.startDate}
              onChange={handleStartDateChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="end-date">End Date:</label>
            <input
              type="date"
              id="end-date"
              value={localFilters.endDate}
              onChange={handleEndDateChange}
            />
          </div>
          
          <div className="filter-actions">
            <button type="submit" className="search-btn">
              <i className="fas fa-search"></i> Search
            </button>
            <button type="button" id="reset-search-btn" className="reset-btn" onClick={handleReset}>
              <i className="fas fa-undo"></i> Reset
            </button>
          </div>
        </div>
      </form>
      
      <div className="quick-search">
        <input
          type="text"
          id="quick-search"
          placeholder="Quick search..."
          value={localFilters.quickSearch}
          onChange={handleQuickSearchChange}
        />
      </div>
    </div>
  );
};

export default HistorySearch;