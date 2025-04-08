import React, { useEffect } from 'react';
import { useAnalysis } from '../../contexts/AnalysisContext';
import './ImageViewer.css';

const ImageViewer = () => {
  const { 
    currentAnalysis, 
    viewState, 
    settings,
    setActiveView, 
    zoomIn, 
    zoomOut, 
    resetZoom 
  } = useAnalysis();
  
  const { currentView, zoomLevel } = viewState;
  const { showLandmarks, showReferenceLines, showMeasurements } = settings;

  // Determine if AP and LAT images are available
  const hasAp = currentAnalysis?.has_ap;
  const hasLat = currentAnalysis?.has_lat;

  // Export PDF function
  const handleExportPdf = () => {
    console.log('Export as PDF clicked');
    // Implement export functionality
  };

  // Log the current view state for debugging
  useEffect(() => {
    console.log('Current view state:', {
      currentView,
      hasAp,
      hasLat
    });
  }, [currentView, hasAp, hasLat]);

  // Generate mock landmarks, lines, and measurements for demonstration
  const generateMockLandmarks = (view) => {
    if (view === 'ap') {
      return [
        { x: 45, y: 50, label: 'L1' },
        { x: 50, y: 55, label: 'L2' },
        { x: 55, y: 45, label: 'L3' }
      ];
    } else {
      return [
        { x: 48, y: 52, label: 'L4' },
        { x: 53, y: 57, label: 'L5' }
      ];
    }
  };

  const generateMockLines = (view) => {
    if (view === 'ap') {
      return [
        { x1: 40, y1: 40, x2: 60, y2: 60, color: 'red' },
        { x1: 45, y1: 50, x2: 65, y2: 50, color: 'yellow' }
      ];
    } else {
      return [
        { x1: 42, y1: 42, x2: 62, y2: 62, color: 'blue' },
        { x1: 47, y1: 52, x2: 67, y2: 52, color: 'cyan' }
      ];
    }
  };

  const generateMockMeasurements = (view) => {
    if (view === 'ap') {
      return [
        { x: 60, y: 55, value: '23°' }
      ];
    } else {
      return [
        { x: 62, y: 57, value: '18°' }
      ];
    }
  };

  // Render landmarks
  const renderLandmarks = (view) => {
    if (!showLandmarks) return null;
    
    const landmarks = currentAnalysis?.measurements?.find(m => m.view === view)?.landmarks 
      || generateMockLandmarks(view);
    
    return landmarks.map((landmark, index) => (
      <div
        key={`${view}-landmark-${index}`}
        className="landmark"
        style={{ top: `${landmark.y}%`, left: `${landmark.x}%` }}
      >
        <span className="landmark-label">{landmark.label || `L${index + 1}`}</span>
      </div>
    ));
  };

  // Render reference lines
  const renderReferenceLines = (view) => {
    if (!showReferenceLines) return null;
    
    const lines = currentAnalysis?.measurements?.find(m => m.view === view)?.lines 
      || generateMockLines(view);
    
    return lines.map((line, index) => (
      <line
        key={`${view}-line-${index}`}
        x1={`${line.x1}%`}
        y1={`${line.y1}%`}
        x2={`${line.x2}%`}
        y2={`${line.y2}%`}
        stroke={line.color || (view === 'ap' ? 'red' : 'blue')}
        strokeWidth="0.5"
      />
    ));
  };

  // Render measurement annotations
  const renderMeasurements = (view) => {
    if (!showMeasurements) return null;
    
    const measurements = currentAnalysis?.measurements?.filter(m => m.view === view && m.position)
      || generateMockMeasurements(view);
    
    return measurements.map((measurement, index) => (
      <div
        key={`${view}-measurement-${index}`}
        className="measurement"
        style={{ 
          top: `${measurement.y || measurement.position?.y}%`, 
          left: `${measurement.x || measurement.position?.x}%` 
        }}
      >
        <span className="measurement-label">
          {measurement.value}{measurement.unit || ''}
        </span>
      </div>
    ));
  };

  // Determine if the AP image should be shown based on currentView
  const showApImage = hasAp && (currentView === 'both' || currentView === 'ap');
  
  // Determine if the Lateral image should be shown based on currentView
  const showLatImage = hasLat && (currentView === 'both' || currentView === 'lateral');

  return (
    <div className="analysis-view">
      <div className="view-controls">
        <div className="view-selector">
          <button 
            id="both-view-btn" 
            className={`view-btn ${currentView === 'both' ? 'active' : ''}`}
            onClick={() => setActiveView('both')}
            disabled={!(hasAp && hasLat)}
          >
            Both Views
          </button>
          <button 
            id="ap-view-btn" 
            className={`view-btn ${currentView === 'ap' ? 'active' : ''}`}
            onClick={() => setActiveView('ap')}
            disabled={!hasAp}
          >
            AP View
          </button>
          <button 
            id="lat-view-btn" 
            className={`view-btn ${currentView === 'lateral' ? 'active' : ''}`}
            onClick={() => setActiveView('lateral')}
            disabled={!hasLat}
          >
            Lateral View
          </button>
        </div>
        
        {currentAnalysis && (
          <button 
            id="export-pdf-btn" 
            className="export-btn" 
            onClick={handleExportPdf}
            title="Export as PDF"
          >
            <img src="/pdf_icon.png" alt="PDF" className="pdf-icon" />
          </button>
        )}
      </div>
      
      <div id="image-container" className={`image-container ${currentView}`}>
        {!currentAnalysis && (
          <div id="analysis-empty-state" className="empty-state">
            <i className="fas fa-x-ray fa-4x"></i>
            <p>Upload X-ray images to see analysis results</p>
          </div>
        )}
        
        {/* AP Image - Only show if currentView is 'both' or 'ap' */}
        {showApImage && (
          <div 
            id="ap-image-wrapper" 
            className={`xray-image-wrapper ap ${!currentAnalysis ? 'hidden' : ''}`}
          >
            <div className="image-overlay-container">
              <img 
                id="ap-analysis-image" 
                src={currentAnalysis?.ap_image_url || ''} 
                alt="AP X-ray view" 
                className="xray-image"
                style={{ transform: `scale(${zoomLevel})` }}
                onError={(e) => {
                  console.error('Error loading AP image:', e);
                  e.target.src = 'https://via.placeholder.com/500x600?text=AP+Image+Error';
                  e.target.onerror = null; // Prevent infinite loops
                }}
              />
              
              <div id="ap-landmarks" className="landmarks-overlay">
                {renderLandmarks('ap')}
              </div>
              
              <svg id="ap-reference-lines" className="lines-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
                {renderReferenceLines('ap')}
              </svg>
              
              <div id="ap-measurements" className="measurements-overlay">
                {renderMeasurements('ap')}
              </div>
            </div>
            <div className="view-label">AP View</div>
          </div>
        )}
        
        {/* Lateral Image - Only show if currentView is 'both' or 'lateral' */}
        {showLatImage && (
          <div 
            id="lat-image-wrapper" 
            className={`xray-image-wrapper lat ${!currentAnalysis ? 'hidden' : ''}`}
          >
            <div className="image-overlay-container">
              <img 
                id="lat-analysis-image" 
                src={currentAnalysis?.lat_image_url || ''} 
                alt="Lateral X-ray view" 
                className="xray-image" 
                style={{ transform: `scale(${zoomLevel})` }}
                onError={(e) => {
                  console.error('Error loading Lateral image:', e);
                  e.target.src = 'https://via.placeholder.com/500x600?text=Lateral+Image+Error';
                  e.target.onerror = null; // Prevent infinite loops
                }}
              />
              
              <div id="lat-landmarks" className="landmarks-overlay">
                {renderLandmarks('lat')}
              </div>
              
              <svg id="lat-reference-lines" className="lines-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
                {renderReferenceLines('lat')}
              </svg>
              
              <div id="lat-measurements" className="measurements-overlay">
                {renderMeasurements('lat')}
              </div>
            </div>
            <div className="view-label">Lateral View</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer;