/**
 * Patient History Functionality for WristSight AI
 * Handles the display and filtering of patient history data
 */

// History state
const historyState = {
    currentPage: 1,
    totalPages: 1,
    recordsPerPage: 10,
    filters: {
      patient_id: '',
      start_date: '',
      end_date: ''
    },
    quickSearchTerm: '',
    records: []
  };
  
  // DOM Elements
  const historySearchForm = document.getElementById('history-search-form');
  const historyPatientIdInput = document.getElementById('history-patient-id');
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  const resetSearchBtn = document.getElementById('reset-search-btn');
  const quickSearchInput = document.getElementById('quick-search');
  
  const emptyHistory = document.getElementById('empty-history');
  const historyContent = document.getElementById('history-content');
  const historyTbody = document.getElementById('history-tbody');
  const prevPageBtn = document.getElementById('prev-page-btn');
  const nextPageBtn = document.getElementById('next-page-btn');
  const pageInfo = document.getElementById('page-info');
  
  /**
   * Initialize patient history functionality
   */
  function initHistory() {
    // Search form submission
    historySearchForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // Update filters
      historyState.filters.patient_id = historyPatientIdInput.value.trim();
      historyState.filters.start_date = startDateInput.value;
      historyState.filters.end_date = endDateInput.value;
      
      // Reset to first page
      historyState.currentPage = 1;
      
      // Fetch history with filters
      fetchHistory();
    });
    
    // Reset search button
    resetSearchBtn.addEventListener('click', function() {
      // Clear filters
      historyPatientIdInput.value = '';
      startDateInput.value = '';
      endDateInput.value = '';
      quickSearchInput.value = '';
      
      // Reset state
      historyState.filters.patient_id = '';
      historyState.filters.start_date = '';
      historyState.filters.end_date = '';
      historyState.quickSearchTerm = '';
      historyState.currentPage = 1;
      
      // Fetch history without filters
      fetchHistory();
    });
    
    // Quick search input
    quickSearchInput.addEventListener('input', function() {
      historyState.quickSearchTerm = this.value.trim().toLowerCase();
      filterAndDisplayHistory();
    });
    
    // Pagination buttons
    prevPageBtn.addEventListener('click', function() {
      if (historyState.currentPage > 1) {
        historyState.currentPage--;
        filterAndDisplayHistory();
      }
    });
    
    nextPageBtn.addEventListener('click', function() {
      if (historyState.currentPage < historyState.totalPages) {
        historyState.currentPage++;
        filterAndDisplayHistory();
      }
    });
  }
  
  /**
   * Fetch history data from the API
   */
  async function fetchHistory() {
    try {
      // Show loading spinner
      document.getElementById('loading-spinner').classList.remove('hidden');
      
      // Prepare parameters for API call
      const params = {
        skip: (historyState.currentPage - 1) * historyState.recordsPerPage,
        limit: historyState.recordsPerPage,
        ...historyState.filters
      };
      
      // Fetch data from API
      const response = await api.getHistory(params);
      
      // Update state with fetched data
      historyState.records = response;
      
      // Calculate total pages
      historyState.totalPages = Math.max(1, Math.ceil(response.length / historyState.recordsPerPage));
      
      // Update UI
      filterAndDisplayHistory();
    } catch (error) {
      console.error('Error fetching history:', error);
      alert(`Error: ${error.message}`);
      
      // Show empty state
      emptyHistory.classList.remove('hidden');
      historyContent.classList.add('hidden');
    } finally {
      // Hide loading spinner
      document.getElementById('loading-spinner').classList.add('hidden');
    }
  }
  
  /**
   * Filter and display history based on current state
   */
  function filterAndDisplayHistory() {
    // Apply quick search filter
    let filteredRecords = historyState.records;
    
    if (historyState.quickSearchTerm) {
      filteredRecords = filteredRecords.filter(record => 
        record.patient_id.toLowerCase().includes(historyState.quickSearchTerm) ||
        record.id.toLowerCase().includes(historyState.quickSearchTerm) ||
        record.summary.toLowerCase().includes(historyState.quickSearchTerm)
      );
    }
    
    // Show empty state if no records
    if (filteredRecords.length === 0) {
      emptyHistory.classList.remove('hidden');
      historyContent.classList.add('hidden');
      return;
    }
    
    // Hide empty state, show content
    emptyHistory.classList.add('hidden');
    historyContent.classList.remove('hidden');
    
    // Calculate pagination
    const startIndex = (historyState.currentPage - 1) * historyState.recordsPerPage;
    const endIndex = Math.min(startIndex + historyState.recordsPerPage, filteredRecords.length);
    const pageRecords = filteredRecords.slice(startIndex, endIndex);
    
    // Update pagination buttons and info
    prevPageBtn.disabled = historyState.currentPage === 1;
    nextPageBtn.disabled = historyState.currentPage === historyState.totalPages;
    pageInfo.textContent = `Page ${historyState.currentPage} of ${historyState.totalPages}`;
    
    // Clear existing rows
    historyTbody.innerHTML = '';
    
    // Add rows for each record
    pageRecords.forEach(record => {
      // Create table row
      const row = document.createElement('tr');
      
      // Thumbnail
      const thumbnailCell = document.createElement('td');
      thumbnailCell.className = 'thumbnail-cell';
      
      if (record.thumbnail_url) {
        const thumbnailImg = document.createElement('img');
        thumbnailImg.src = record.thumbnail_url;
        thumbnailImg.alt = 'X-ray thumbnail';
        thumbnailImg.className = 'history-thumbnail';
        thumbnailCell.appendChild(thumbnailImg);
      } else {
        const noThumbnail = document.createElement('div');
        noThumbnail.className = 'no-thumbnail';
        const icon = document.createElement('i');
        icon.className = 'fas fa-x-ray';
        noThumbnail.appendChild(icon);
        thumbnailCell.appendChild(noThumbnail);
      }
      row.appendChild(thumbnailCell);
      
      // Patient ID
      const patientIdCell = document.createElement('td');
      patientIdCell.textContent = record.patient_id;
      row.appendChild(patientIdCell);
      
      // Date
      const dateCell = document.createElement('td');
      const date = new Date(record.timestamp);
      dateCell.textContent = date.toLocaleDateString();
      row.appendChild(dateCell);
      
      // Summary
      const summaryCell = document.createElement('td');
      summaryCell.className = 'summary-cell';
      const summaryText = document.createElement('div');
      summaryText.className = 'truncated-text';
      summaryText.textContent = record.summary;
      summaryText.title = record.summary; // Show full text on hover
      summaryCell.appendChild(summaryText);
      row.appendChild(summaryCell);
      
      // Status
      const statusCell = document.createElement('td');
      const statusBadge = document.createElement('span');
      statusBadge.className = `status-badge ${record.status.toLowerCase()}`;
      statusBadge.textContent = record.status;
      statusCell.appendChild(statusBadge);
      row.appendChild(statusCell);
      
      // Actions
      const actionsCell = document.createElement('td');
      actionsCell.className = 'actions-cell';
      
      // View button
      const viewBtn = document.createElement('button');
      viewBtn.className = 'view-btn';
      viewBtn.innerHTML = '<i class="fas fa-eye"></i> View';
      viewBtn.dataset.id = record.id;
      viewBtn.addEventListener('click', function() {
        viewHistoryRecord(record.id);
      });
      actionsCell.appendChild(viewBtn);
      
      // Export button
      const exportBtn = document.createElement('button');
      exportBtn.className = 'export-btn';
      exportBtn.innerHTML = '<i class="fas fa-download"></i>';
      exportBtn.addEventListener('click', function() {
        exportHistoryRecord(record.id);
      });
      actionsCell.appendChild(exportBtn);
      
      row.appendChild(actionsCell);
      
      // Add row to table
      historyTbody.appendChild(row);
    });
  }
  
  /**
   * View a specific history record
   * @param {string} analysisId - The ID of the analysis to view
   */
  async function viewHistoryRecord(analysisId) {
    try {
      // Show loading spinner
      document.getElementById('loading-spinner').classList.remove('hidden');
      
      // Fetch analysis data
      const analysisData = await api.getAnalysis(analysisId);
      
      // Switch to analysis tab
      document.getElementById('analysis-tab').click();
      
      // Display the analysis
      displayAnalysis(analysisData);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      alert(`Error: ${error.message}`);
    } finally {
      // Hide loading spinner
      document.getElementById('loading-spinner').classList.add('hidden');
    }
  }
  
  /**
   * Export a specific history record
   * @param {string} analysisId - The ID of the analysis to export
   */
  function exportHistoryRecord(analysisId) {
    alert(`Export functionality would be implemented here. This would generate a PDF report for analysis ID: ${analysisId}`);
  }
  
  /**
   * Generate mock history data (for testing)
   * @returns {Array} - Array of mock history records
   */
  function generateMockHistory() {
    const statuses = ['Complete', 'Pending', 'Error'];
    const patientIds = ['PAT001', 'PAT002', 'PAT003', 'PAT004', 'PAT005'];
    const summaries = [
      'All measurements within normal range.',
      'Radial angle slightly above normal range. Consider follow-up.',
      'Ulnar variance significantly higher than normal. Recommend evaluation.',
      'No abnormalities detected.',
      'Multiple measurements outside normal ranges. Immediate attention recommended.'
    ];
    
    const records = [];
    
    for (let i = 0; i < 15; i++) {
      const patientId = patientIds[Math.floor(Math.random() * patientIds.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const summary = summaries[Math.floor(Math.random() * summaries.length)];
      
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      records.push({
        id: `ANALYSIS-${(1000 + i).toString()}`,
        patient_id: patientId,
        timestamp: date.toISOString(),
        thumbnail_url: i % 3 === 0 ? null : 'https://via.placeholder.com/70x70',
        summary: summary,
        status: status
      });
    }
    
    return records;
  }