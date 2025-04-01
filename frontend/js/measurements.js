/**
 * Measurements Table Functionality for WristSight AI
 * Handles the display of measurement data
 */

// DOM Elements
const emptyMeasurements = document.getElementById('empty-measurements');
const measurementsContent = document.getElementById('measurements-content');
const measurementsTbody = document.getElementById('measurements-tbody');
const analysisSummaryText = document.getElementById('analysis-summary-text');

// Action buttons
const exportPdfBtn = document.getElementById('export-pdf-btn');
const shareBtn = document.getElementById('share-btn');
const printBtn = document.getElementById('print-btn');

/**
 * Initialize measurements table functionality
 */
function initMeasurements() {
  // Export PDF button
  exportPdfBtn.addEventListener('click', function() {
    exportAsPdf();
  });
  
  // Share button
  shareBtn.addEventListener('click', function() {
    shareAnalysis();
  });
  
  // Print button
  printBtn.addEventListener('click', function() {
    printAnalysis();
  });
}

/**
 * Update the measurements table with analysis data
 * @param {Object} analysisData - The analysis data from the API
 */
function updateMeasurementsTable(analysisData) {
  if (!analysisData || !analysisData.measurements || analysisData.measurements.length === 0) {
    clearMeasurementsTable();
    return;
  }
  
  // Hide empty state, show content
  emptyMeasurements.classList.add('hidden');
  measurementsContent.classList.remove('hidden');
  
  // Clear existing rows
  measurementsTbody.innerHTML = '';
  
  // Add rows for each measurement
  analysisData.measurements.forEach(measurement => {
    // Determine status based on measurement value and normal range
    let status = 'normal';
    let statusLabel = 'Normal';
    
    if (measurement.normal_range) {
      const [min, max] = measurement.normal_range;
      const value = parseFloat(measurement.value);
      
      if (value < min) {
        status = 'low';
        statusLabel = 'Below Normal';
      } else if (value > max) {
        status = 'high';
        statusLabel = 'Above Normal';
      }
    }
    
    // Create table row
    const row = document.createElement('tr');
    
    // Measurement name
    const nameCell = document.createElement('td');
    nameCell.textContent = measurement.label;
    row.appendChild(nameCell);
    
    // Measurement value
    const valueCell = document.createElement('td');
    valueCell.textContent = `${measurement.value} ${measurement.unit || ''}`;
    row.appendChild(valueCell);
    
    // Normal range
    const rangeCell = document.createElement('td');
    if (measurement.normal_range) {
      rangeCell.textContent = `${measurement.normal_range[0]} - ${measurement.normal_range[1]} ${measurement.unit || ''}`;
    } else {
      rangeCell.textContent = 'N/A';
    }
    row.appendChild(rangeCell);
    
    // Status
    const statusCell = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge ${status}`;
    statusBadge.textContent = statusLabel;
    statusCell.appendChild(statusBadge);
    row.appendChild(statusCell);
    
    // Add row to table
    measurementsTbody.appendChild(row);
  });
  
  // Update summary
  analysisSummaryText.textContent = analysisData.summary || 'No summary available';
}

/**
 * Clear the measurements table
 */
function clearMeasurementsTable() {
  // Show empty state, hide content
  emptyMeasurements.classList.remove('hidden');
  measurementsContent.classList.add('hidden');
  
  // Clear rows
  measurementsTbody.innerHTML = '';
  
  // Clear summary
  analysisSummaryText.textContent = 'No summary available';
}

/**
 * Export the analysis as PDF
 * This is a placeholder function - in a real implementation, you would generate a PDF
 */
function exportAsPdf() {
  alert('PDF export functionality would be implemented here. This would generate a PDF report of the current analysis.');
}

/**
 * Share the analysis
 * This is a placeholder function - in a real implementation, you would show sharing options
 */
function shareAnalysis() {
  alert('Share functionality would be implemented here. This would allow sharing the analysis via email, messaging, etc.');
}

/**
 * Print the analysis
 * This is a simple implementation that uses the browser's print functionality
 */
function printAnalysis() {
  window.print();
}

/**
 * Generate mock measurement data (for testing)
 * @returns {Array} - Array of mock measurement objects
 */
function generateMockMeasurements() {
  return [
    {
      name: 'Radial Angle',
      value: '22',
      unit: '°',
      normal_range: [20, 25],
      view: 'ap'
    },
    {
      name: 'Radial Length',
      value: '11',
      unit: 'mm',
      normal_range: [10, 13],
      view: 'ap'
    },
    {
      name: 'Radial Shift',
      value: '0',
      unit: 'mm',
      normal_range: [0, 2],
      view: 'ap'
    },
    {
      name: 'Ulnar Variance',
      value: '0',
      unit: 'mm',
      normal_range: [-2, 2],
      view: 'lat'
    },
    {
      name: 'Palmar Tilt',
      value: '12',
      unit: '°',
      normal_range: [10, 15],
      view: 'lat'
    },
    {
      name: 'Dorsal Shift',
      value: '0',
      unit: 'mm',
      normal_range: [0, 2],
      view: 'lat'
    }
  ];
}