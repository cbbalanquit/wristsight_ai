/**
 * Main Application Logic for WristSight AI
 * Initializes all components and handles tab switching
 */

// App state
const appState = {
    currentTab: 'analysis', // 'analysis' or 'history'
    currentAnalysisId: null,
  };
  
  // DOM Elements
  const analysisTab = document.getElementById('analysis-tab');
  const historyTab = document.getElementById('history-tab');
  const analysisView = document.getElementById('analysis-view');
  const historyView = document.getElementById('history-view');
  
  /**
   * Initialize the application
   */
  function initApp() {
    // Set up tab switching
    analysisTab.addEventListener('click', function() {
      switchTab('analysis');
    });
    
    historyTab.addEventListener('click', function() {
      switchTab('history');
    });
    
    // Initialize all components
    initUpload();
    initAnalysisView();
    initControls();
    initMeasurements();
    initHistory();
    
    // Set initial tab
    switchTab('analysis');
    
    // Check for API connectivity
    checkApiStatus();
  }
  
  /**
   * Switch between tabs (analysis and history)
   * @param {string} tabName - The tab to switch to ('analysis' or 'history')
   */
  function switchTab(tabName) {
    // Update state
    appState.currentTab = tabName;
    
    // Update tab button states
    analysisTab.classList.toggle('active', tabName === 'analysis');
    historyTab.classList.toggle('active', tabName === 'history');
    
    // Show/hide views
    if (tabName === 'analysis') {
      analysisView.classList.remove('hidden');
      historyView.classList.add('hidden');
    } else {
      analysisView.classList.add('hidden');
      historyView.classList.remove('hidden');
      
      // Fetch history data when switching to history tab
      fetchHistory();
    }
  }
  
  /**
   * Check API status to verify connectivity
   */
  async function checkApiStatus() {
    try {
      const response = await fetch(`${API_BASE_URL.split('/api')[0]}`);
      
      if (!response.ok) {
        showApiErrorMessage();
      }
    } catch (error) {
      console.error('API connectivity error:', error);
      showApiErrorMessage();
    }
  }
  
  /**
   * Show API error message
   */
  function showApiErrorMessage() {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'api-error-message';
    errorDiv.innerHTML = `
      <div class="api-error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>API Connection Error</h3>
        <p>Unable to connect to the WristSight AI backend API. Please check that your backend server is running.</p>
        <button id="retry-connection-btn">Retry Connection</button>
      </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Style the error message
    const style = document.createElement('style');
    style.textContent = `
      .api-error-message {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
      }
      .api-error-content {
        background-color: white;
        padding: 2rem;
        border-radius: 5px;
        text-align: center;
        max-width: 500px;
      }
      .api-error-content i {
        font-size: 3rem;
        color: #dc3545;
        margin-bottom: 1rem;
      }
      .api-error-content button {
        padding: 0.5rem 1rem;
        background-color: #0066cc;
        color: white;
        border: none;
        border-radius: 4px;
        margin-top: 1rem;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
    
    // Add retry functionality
    document.getElementById('retry-connection-btn').addEventListener('click', function() {
      errorDiv.remove();
      style.remove();
      checkApiStatus();
    });
  }
  
  /**
   * Mock function to help with development before backend is fully connected
   * Displays a mock analysis with sample data
   */
  function showMockAnalysis() {
    // Create mock analysis data
    const mockAnalysis = {
      id: 'MOCK-ANALYSIS-001',
      patient_id: 'PATIENT-001',
      timestamp: new Date().toISOString(),
      ap_image_url: 'https://via.placeholder.com/500x600?text=AP+View',
      lat_image_url: 'https://via.placeholder.com/500x600?text=Lateral+View',
      has_ap: true,
      has_lat: true,
      notes: 'This is a mock analysis for testing purposes.',
      status: 'Complete',
      measurements: generateMockMeasurements(),
      summary: 'All radiographic measurements are within normal limits. No significant abnormalities detected.'
    };
    
    // Display the mock analysis
    displayAnalysis(mockAnalysis);
  }
  
  // Initialize application when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    initApp();
    
    // For development/testing - add mock data button
    if (API_BASE_URL.includes('localhost')) {
      const mockButton = document.createElement('button');
      mockButton.textContent = 'Load Mock Data';
      mockButton.style.position = 'fixed';
      mockButton.style.bottom = '10px';
      mockButton.style.right = '10px';
      mockButton.style.zIndex = '1000';
      mockButton.style.padding = '5px 10px';
      mockButton.style.backgroundColor = '#6c757d';
      mockButton.style.color = 'white';
      mockButton.style.border = 'none';
      mockButton.style.borderRadius = '4px';
      mockButton.style.cursor = 'pointer';
      
      mockButton.addEventListener('click', function() {
        showMockAnalysis();
        
        // Also load mock history data
        historyState.records = generateMockHistory();
        historyState.totalPages = Math.ceil(historyState.records.length / historyState.recordsPerPage);
        filterAndDisplayHistory();
      });
      
      document.body.appendChild(mockButton);
    }
  });