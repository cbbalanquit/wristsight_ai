import React, { useState, useEffect } from 'react';
import HistorySearch from './HistorySearch';
import HistoryTable from './HistoryTable';
import { fetchPatientHistory } from '../../services/api';
import './HistoryView.css';

const HistoryView = () => {
  const [historyRecords, setHistoryRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    patientId: '',
    startDate: '',
    endDate: '',
    quickSearch: ''
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const recordsPerPage = 10;

  // Load history data
  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const data = await fetchPatientHistory();
        setHistoryRecords(data || []);
        applyFilters(data || [], searchParams);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Apply filters to records
  const applyFilters = (records, filters) => {
    let filtered = [...records];
    
    // Apply patient ID filter if provided
    if (filters.patientId) {
      filtered = filtered.filter(record => 
        record.patient_id.toLowerCase().includes(filters.patientId.toLowerCase())
      );
    }
    
    // Apply date range filters if provided
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate >= startDate;
      });
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59); // End of day
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate <= endDate;
      });
    }
    
    // Apply quick search if provided
    if (filters.quickSearch) {
      const search = filters.quickSearch.toLowerCase();
      filtered = filtered.filter(record => 
        record.patient_id.toLowerCase().includes(search) ||
        record.summary.toLowerCase().includes(search) ||
        record.status.toLowerCase().includes(search)
      );
    }
    
    setFilteredRecords(filtered);
    setTotalPages(Math.ceil(filtered.length / recordsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handlers for search and filter changes
  const handleSearch = (filters) => {
    setSearchParams(filters);
    applyFilters(historyRecords, filters);
  };
  
  const handleReset = () => {
    const resetFilters = {
      patientId: '',
      startDate: '',
      endDate: '',
      quickSearch: ''
    };
    setSearchParams(resetFilters);
    applyFilters(historyRecords, resetFilters);
  };
  
  const handleQuickSearch = (search) => {
    const newFilters = { ...searchParams, quickSearch: search };
    setSearchParams(newFilters);
    applyFilters(historyRecords, newFilters);
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Get current page records
  const getCurrentRecords = () => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return filteredRecords.slice(startIndex, endIndex);
  };

  return (
    <div className="history-container">
      <div className="patient-history">
        <h2>Patient History</h2>
        
        <HistorySearch 
          filters={searchParams}
          onSearch={handleSearch}
          onReset={handleReset}
          onQuickSearch={handleQuickSearch}
        />
        
        <div id="history-table-container">
          {filteredRecords.length === 0 ? (
            <div id="empty-history" className="empty-history">
              <p>No analysis records found</p>
            </div>
          ) : (
            <>
              <div className="table-scroll-container">
                <HistoryTable 
                  records={getCurrentRecords()}
                  loading={loading}
                />
              </div>
              
              <div className="pagination-container">
                <button 
                  id="prev-page-btn" 
                  className="page-btn" 
                  disabled={currentPage === 1}
                  onClick={handlePrevPage}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                <span id="page-info" className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button 
                  id="next-page-btn" 
                  className="page-btn" 
                  disabled={currentPage === totalPages}
                  onClick={handleNextPage}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;