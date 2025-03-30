/**
 * Analysis View Functionality for WristSight AI
 * Handles the display and interaction with X-ray analysis results
 */

// Current analysis data
let currentAnalysis = null;

// View state
const viewState = {
  currentView: 'both', // 'both', 'ap', or 'lat'
  zoomLevel: 1,
};

// DOM Elements
const analysisEmptyState = document.getElementById('analysis-empty-state');
const imageContainer = document.getElementById('image-container');
const apImageWrapper = document.getElementById('ap-image-wrapper');
const latImageWrapper = document.getElementById('lat-image-wrapper');
const apAnalysisImage = document.getElementById('ap-analysis-image');
const latAnalysisImage = document.getElementById('lat-analysis-image');
const apLandmarks = document.getElementById('ap-landmarks');
const latLandmarks = document.getElementById('lat-landmarks');
const apReferenceLines = document.getElementById('ap-reference-lines');
const latReferenceLines = document.getElementById('lat-reference-lines');
const apMeasurements = document.getElementById('ap-measurements');
const latMeasurements = document.getElementById('lat-measurements');

// View control buttons
const bothViewBtn = document.getElementById('both-view-btn');
const apViewBtn = document.getElementById('ap-view-btn');
const latViewBtn = document.getElementById('lat-view-btn');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const zoomResetBtn = document.getElementById('zoom-reset-btn');

/**
 * Initialize analysis view functionality
 */
function initAnalysisView() {
  // View selection buttons
  bothViewBtn.addEventListener('click', function() {
    setActiveView('both');
  });
  
  apViewBtn.addEventListener('click', function() {
    setActiveView('ap');
  });
  
  latViewBtn.addEventListener('click', function() {
    setActiveView('lat');
  });
  
  // Zoom control buttons
  zoomInBtn.addEventListener('click', function() {
    zoomIn();
  });
  
  zoomOutBtn.addEventListener('click', function() {
    zoomOut();
  });
  
  zoomResetBtn.addEventListener('click', function() {
    resetZoom();
  });
}

/**
 * Display an analysis in the UI
 * @param {Object} analysisData - The analysis data from the API
 */
function displayAnalysis(analysisData) {
  currentAnalysis = analysisData;
  
  // Update analysis info in controls panel
  updateAnalysisInfo(analysisData);
  
  // Update measurements table
  updateMeasurementsTable(analysisData);
  
  // Show images and overlays
  displayImages(analysisData);
  
  // Update view buttons state
  updateViewButtonsState();
}

/**
 * Display the X-ray images and overlays
 * @param {Object} analysisData - The analysis data from the API
 */
function displayImages(analysisData) {
  // Hide empty state
  analysisEmptyState.classList.add('hidden');
  
  // Check which views are available
  const hasAp = analysisData.has_ap;
  const hasLat = analysisData.has_lat;
  
  // Set image sources
  if (hasAp) {
    // Create a proper URL regardless of what the API returned
    // Extract the file ID from the URL or use a fallback
    let imageId = analysisData.analysis_id || 'default';
    
    // If ap_image_url contains a path with an ID, extract it
    if (analysisData.ap_image_url && analysisData.ap_image_url.includes('/images/')) {
      const match = analysisData.ap_image_url.match(/\/images\/([^\/]+)/);
      if (match && match[1]) {
        imageId = match[1];
      }
    }
    
    // Force the URL to be an HTTP URL with the correct host
    apAnalysisImage.src = `http://localhost:8000/static/images/${imageId}/ap.jpg`;
    apImageWrapper.classList.remove('hidden');
    
    // Add landmarks, lines, and measurements
    displayOverlays(analysisData, 'ap');
  } else {
    apImageWrapper.classList.add('hidden');
  }
  
  if (hasLat) {
    // Similar approach for lateral image
    let imageId = analysisData.analysis_id || 'default';
    
    if (analysisData.lat_image_url && analysisData.lat_image_url.includes('/images/')) {
      const match = analysisData.lat_image_url.match(/\/images\/([^\/]+)/);
      if (match && match[1]) {
        imageId = match[1];
      }
    }
    
    latAnalysisImage.src = `http://localhost:8000/static/images/${imageId}/lat.jpg`;
    latImageWrapper.classList.remove('hidden');
    
    // Add landmarks, lines, and measurements
    displayOverlays(analysisData, 'lat');
  } else {
    latImageWrapper.classList.add('hidden');
  }
  
  // Determine which view to show based on available images
  if (hasAp && hasLat) {
    setActiveView('both');
  } else if (hasAp) {
    setActiveView('ap');
  } else if (hasLat) {
    setActiveView('lat');
  }
}

/**
 * Display overlays (landmarks, reference lines, measurements) on the images
 * @param {Object} analysisData - The analysis data from the API
 * @param {string} view - The view type ('ap' or 'lat')
 */
function displayOverlays(analysisData, view) {
  const landmarksContainer = view === 'ap' ? apLandmarks : latLandmarks;
  const linesContainer = view === 'ap' ? apReferenceLines : latReferenceLines;
  const measurementsContainer = view === 'ap' ? apMeasurements : latMeasurements;
  
  // Clear existing overlays
  landmarksContainer.innerHTML = '';
  linesContainer.innerHTML = '';
  measurementsContainer.innerHTML = '';
  
  // Get measurements for this view
  const viewMeasurements = analysisData.measurements.filter(m => m.view === view);
  
  // Add landmarks
  if (viewMeasurements.length > 0 && viewMeasurements[0].landmarks) {
    viewMeasurements[0].landmarks.forEach((landmark, index) => {
      const landmarkElement = document.createElement('div');
      landmarkElement.className = 'landmark';
      landmarkElement.style.top = `${landmark.y}%`;
      landmarkElement.style.left = `${landmark.x}%`;
      
      const labelElement = document.createElement('span');
      labelElement.className = 'landmark-label';
      labelElement.textContent = landmark.label || `L${index + 1}`;
      
      landmarkElement.appendChild(labelElement);
      landmarksContainer.appendChild(landmarkElement);
    });
  }
  
  // Add reference lines
  if (viewMeasurements.length > 0 && viewMeasurements[0].lines) {
    viewMeasurements[0].lines.forEach((line, index) => {
      const lineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      lineElement.setAttribute('x1', `${line.x1}%`);
      lineElement.setAttribute('y1', `${line.y1}%`);
      lineElement.setAttribute('x2', `${line.x2}%`);
      lineElement.setAttribute('y2', `${line.y2}%`);
      lineElement.setAttribute('stroke', line.color || (view === 'ap' ? 'red' : 'blue'));
      lineElement.setAttribute('stroke-width', '0.5');
      
      linesContainer.appendChild(lineElement);
    });
  }
  
  // Add measurement annotations
  if (viewMeasurements.length > 0) {
    viewMeasurements.forEach(measurement => {
      if (measurement.position) {
        const measurementElement = document.createElement('div');
        measurementElement.className = 'measurement';
        measurementElement.style.top = `${measurement.position.y}%`;
        measurementElement.style.left = `${measurement.position.x}%`;
        
        const labelElement = document.createElement('span');
        labelElement.className = 'measurement-label';
        labelElement.textContent = `${measurement.value}${measurement.unit || ''}`;
        
        measurementElement.appendChild(labelElement);
        measurementsContainer.appendChild(measurementElement);
      }
    });
  }
  
  // If no real data is available, add some placeholder data for demonstration
  if (landmarksContainer.children.length === 0 && view === 'ap') {
    // Mock landmarks for AP view
    addMockLandmark(landmarksContainer, 45, 50, 'L1');
    addMockLandmark(landmarksContainer, 50, 55, 'L2');
    addMockLandmark(landmarksContainer, 55, 45, 'L3');
    
    // Mock lines
    addMockLine(linesContainer, 40, 40, 60, 60, 'red');
    addMockLine(linesContainer, 45, 50, 65, 50, 'yellow');
    
    // Mock measurement
    addMockMeasurement(measurementsContainer, 60, 55, '23°');
  } else if (landmarksContainer.children.length === 0 && view === 'lat') {
    // Mock landmarks for lateral view
    addMockLandmark(landmarksContainer, 48, 52, 'L4');
    addMockLandmark(landmarksContainer, 53, 57, 'L5');
    
    // Mock lines
    addMockLine(linesContainer, 42, 42, 62, 62, 'blue');
    addMockLine(linesContainer, 47, 52, 67, 52, 'cyan');
    
    // Mock measurement
    addMockMeasurement(measurementsContainer, 62, 57, '18°');
  }
}

/**
 * Add a mock landmark for demonstration
 */
function addMockLandmark(container, top, left, label) {
  const landmarkElement = document.createElement('div');
  landmarkElement.className = 'landmark';
  landmarkElement.style.top = `${top}%`;
  landmarkElement.style.left = `${left}%`;
  
  const labelElement = document.createElement('span');
  labelElement.className = 'landmark-label';
  labelElement.textContent = label;
  
  landmarkElement.appendChild(labelElement);
  container.appendChild(landmarkElement);
}

/**
 * Add a mock line for demonstration
 */
function addMockLine(container, x1, y1, x2, y2, color) {
  const lineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  lineElement.setAttribute('x1', x1);
  lineElement.setAttribute('y1', y1);
  lineElement.setAttribute('x2', x2);
  lineElement.setAttribute('y2', y2);
  lineElement.setAttribute('stroke', color);
  lineElement.setAttribute('stroke-width', '0.5');
  
  container.appendChild(lineElement);
}

/**
 * Add a mock measurement for demonstration
 */
function addMockMeasurement(container, top, left, value) {
  const measurementElement = document.createElement('div');
  measurementElement.className = 'measurement';
  measurementElement.style.top = `${top}%`;
  measurementElement.style.left = `${left}%`;
  
  const labelElement = document.createElement('span');
  labelElement.className = 'measurement-label';
  labelElement.textContent = value;
  
  measurementElement.appendChild(labelElement);
  container.appendChild(measurementElement);
}

/**
 * Set the active view (both, ap, or lat)
 * @param {string} view - The view to set active
 */
function setActiveView(view) {
  // Update state
  viewState.currentView = view;
  
  // Update CSS class on container
  imageContainer.className = `image-container ${view}`;
  
  // Update button states
  bothViewBtn.classList.toggle('active', view === 'both');
  apViewBtn.classList.toggle('active', view === 'ap');
  latViewBtn.classList.toggle('active', view === 'lat');
}

/**
 * Update the state of view buttons based on available images
 */
function updateViewButtonsState() {
  if (!currentAnalysis) return;
  
  const hasAp = currentAnalysis.has_ap;
  const hasLat = currentAnalysis.has_lat;
  
  // Disable buttons for unavailable views
  bothViewBtn.disabled = !(hasAp && hasLat);
  apViewBtn.disabled = !hasAp;
  latViewBtn.disabled = !hasLat;
}

/**
 * Zoom in on the X-ray images
 */
function zoomIn() {
  if (viewState.zoomLevel < 3) {
    viewState.zoomLevel += 0.25;
    apAnalysisImage.style.transform = `scale(${viewState.zoomLevel})`;
    latAnalysisImage.style.transform = `scale(${viewState.zoomLevel})`;
  }
}

/**
 * Zoom out on the X-ray images
 */
function zoomOut() {
  if (viewState.zoomLevel > 0.5) {
    viewState.zoomLevel -= 0.25;
    apAnalysisImage.style.transform = `scale(${viewState.zoomLevel})`;
    latAnalysisImage.style.transform = `scale(${viewState.zoomLevel})`;
  }
}

/**
 * Reset the zoom level
 */
function resetZoom() {
  viewState.zoomLevel = 1;
  apAnalysisImage.style.transform = 'scale(1)';
  latAnalysisImage.style.transform = 'scale(1)';
}

/**
 * Clear the current analysis display
 */
function clearAnalysis() {
  currentAnalysis = null;
  
  // Show empty state
  analysisEmptyState.classList.remove('hidden');
  
  // Hide images
  apImageWrapper.classList.add('hidden');
  latImageWrapper.classList.add('hidden');
  
  // Clear overlays
  apLandmarks.innerHTML = '';
  latLandmarks.innerHTML = '';
  apReferenceLines.innerHTML = '';
  latReferenceLines.innerHTML = '';
  apMeasurements.innerHTML = '';
  latMeasurements.innerHTML = '';
  
  // Reset measurements table
  clearMeasurementsTable();
  
  // Reset analysis info
  clearAnalysisInfo();
}