/**
 * Analysis Controls Functionality for WristSight AI
 * Handles the visibility toggles and analysis info display
 */

// DOM Elements
const analysisInfo = document.getElementById('analysis-info');
const infoPatientId = document.getElementById('info-patient-id');
const infoAnalysisId = document.getElementById('info-analysis-id');
const infoDate = document.getElementById('info-date');
const infoNotes = document.getElementById('info-notes');

// Toggle elements
const toggleLandmarks = document.getElementById('toggle-landmarks');
const toggleReferenceLines = document.getElementById('toggle-reference-lines');
const toggleMeasurements = document.getElementById('toggle-measurements');

// Overlay elements
const apLandmarksOverlay = document.getElementById('ap-landmarks');
const latLandmarksOverlay = document.getElementById('lat-landmarks');
const apReferenceLinesOverlay = document.getElementById('ap-reference-lines');
const latReferenceLinesOverlay = document.getElementById('lat-reference-lines');
const apMeasurementsOverlay = document.getElementById('ap-measurements');
const latMeasurementsOverlay = document.getElementById('lat-measurements');

/**
 * Initialize analysis controls functionality
 */
function initControls() {
  // Toggle event listeners
  toggleLandmarks.addEventListener('change', function() {
    toggleOverlay('landmarks', this.checked);
  });
  
  toggleReferenceLines.addEventListener('change', function() {
    toggleOverlay('referenceLines', this.checked);
  });
  
  toggleMeasurements.addEventListener('change', function() {
    toggleOverlay('measurements', this.checked);
  });
  
  // Set initial states
  toggleOverlay('landmarks', toggleLandmarks.checked);
  toggleOverlay('referenceLines', toggleReferenceLines.checked);
  toggleOverlay('measurements', toggleMeasurements.checked);
}

/**
 * Toggle visibility of specific overlays
 * @param {string} overlayType - Type of overlay ('landmarks', 'referenceLines', or 'measurements')
 * @param {boolean} visible - Whether the overlay should be visible
 */
function toggleOverlay(overlayType, visible) {
  switch (overlayType) {
    case 'landmarks':
      apLandmarksOverlay.style.display = visible ? 'block' : 'none';
      latLandmarksOverlay.style.display = visible ? 'block' : 'none';
      break;
    case 'referenceLines':
      apReferenceLinesOverlay.style.display = visible ? 'block' : 'none';
      latReferenceLinesOverlay.style.display = visible ? 'block' : 'none';
      break;
    case 'measurements':
      apMeasurementsOverlay.style.display = visible ? 'block' : 'none';
      latMeasurementsOverlay.style.display = visible ? 'block' : 'none';
      break;
  }
}

/**
 * Update the analysis info section with analysis data
 * @param {Object} analysisData - The analysis data from the API
 */
function updateAnalysisInfo(analysisData) {
  if (!analysisData) {
    clearAnalysisInfo();
    return;
  }
  
  // Show the analysis info panel
  analysisInfo.classList.remove('hidden');
  
  // Update the values
  infoPatientId.textContent = analysisData.patient_id || '-';
  infoAnalysisId.textContent = analysisData.id || '-';
  
  // Format date if present
  if (analysisData.timestamp) {
    const date = new Date(analysisData.timestamp);
    infoDate.textContent = date.toLocaleDateString();
  } else {
    infoDate.textContent = '-';
  }
  
  // Update notes if present
  infoNotes.textContent = analysisData.notes || '-';
}

/**
 * Clear the analysis info section
 */
function clearAnalysisInfo() {
  // Hide the analysis info panel
  analysisInfo.classList.add('hidden');
  
  // Clear the values
  infoPatientId.textContent = '-';
  infoAnalysisId.textContent = '-';
  infoDate.textContent = '-';
  infoNotes.textContent = '-';
}

/**
 * Reset controls to default state
 */
function resetControls() {
  // Reset toggles to checked state
  toggleLandmarks.checked = true;
  toggleReferenceLines.checked = true;
  toggleMeasurements.checked = true;
  
  // Show all overlays
  toggleOverlay('landmarks', true);
  toggleOverlay('referenceLines', true);
  toggleOverlay('measurements', true);
  
  // Clear analysis info
  clearAnalysisInfo();
}

/**
 * Enable or disable controls based on whether analysis is active
 * @param {boolean} enabled - Whether controls should be enabled
 */
function setControlsEnabled(enabled) {
  toggleLandmarks.disabled = !enabled;
  toggleReferenceLines.disabled = !enabled;
  toggleMeasurements.disabled = !enabled;
}