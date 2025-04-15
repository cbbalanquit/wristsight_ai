import React, { useEffect } from 'react';
import { useAnalysis } from '../../contexts/AnalysisContext';
import './ImageViewer.css';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const handleExportPdf = async () => {
    const pdf = new jsPDF('portrait', 'mm', 'a4');
  
    try {
      // Set up PDF title
      pdf.setFontSize(16);
      pdf.text('WristSight AI Analysis Report', 105, 15, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`Patient ID: ${currentAnalysis.patient_id || 'Unknown'}`, 105, 25, { align: 'center' });
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
      
      let yPosition = 40;
      
      // Capture the measurements table
      const measurementsElement = document.getElementById('table-wrapper');
      if (measurementsElement) {
        const measCanvas = await html2canvas(measurementsElement);
        const measImage = measCanvas.toDataURL('image/png');
        const measRatio = measCanvas.width / measCanvas.height;
        const measWidth = 180; // mm
        const measHeight = measWidth / measRatio;
        
        pdf.text('Measurements:', 15, yPosition);
        yPosition += 5;
        pdf.addImage(measImage, 'PNG', 15, yPosition, measWidth, measHeight);
        yPosition += measHeight + 10;
      }

      // Check if we need to add a new page for images
      if (yPosition > 200) {
        pdf.addPage();
        yPosition = 20;
      }
  
      // Capture and add AP image if available
      if (hasAp) {
        const apImageElement = document.getElementById('ap-analysis-image');
        if (apImageElement) {
          pdf.text('AP View:', 15, yPosition);
          yPosition += 5;
          
          const apCanvas = await html2canvas(apImageElement);
          const apImage = apCanvas.toDataURL('image/png');
          
          // Get AP calibration (same for X and Y)
          const apMmPerPixel = currentAnalysis?.calibration?.ap?.mm_per_pixel || 0.144;
          console.log('apMmPerPixel:', apMmPerPixel);
          
          // Calculate physical dimensions based on calibration
          const apWidthPixels = apCanvas.width;
          const apHeightPixels = apCanvas.height;
          const apWidthMm = apWidthPixels * apMmPerPixel;
          const apHeightMm = apHeightPixels * apMmPerPixel;
          
          // Scale to fit page width while maintaining true aspect ratio
          const maxWidthMm = 180;
          let scaleFactor = 1;
          
          if (apWidthMm > maxWidthMm) {
            scaleFactor = maxWidthMm / apWidthMm;
          }
          
          const finalWidthMm = apWidthMm * scaleFactor;
          const finalHeightMm = apHeightMm * scaleFactor;
          
          pdf.addImage(apImage, 'PNG', 15, yPosition, finalWidthMm, finalHeightMm);
          
          // Add calibration scale for AP view
          const scaleY = yPosition + finalHeightMm + 5;
          addCalibrationScale(pdf, 15, scaleY, 100, 'AP', scaleFactor);
          
          yPosition += finalHeightMm + 15; // Extra space for the scale
        }
      }
      
      // Add new page if needed for the lateral image
      if (hasLat) {
        if (yPosition > 200) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Capture the Lateral image
        const latImageElement = document.getElementById('lat-analysis-image');
        if (latImageElement) {
          pdf.text('Lateral View:', 15, yPosition);
          yPosition += 5;
          
          const latCanvas = await html2canvas(latImageElement);
          const latImage = latCanvas.toDataURL('image/png');
          
          // Get Lateral calibration (same for X and Y)
          const latMmPerPixel = currentAnalysis?.calibration?.lateral?.mm_per_pixel || 0.144;
          console.log('latMmPerPixel:',latMmPerPixel)
          
          // Calculate physical dimensions based on calibration
          const latWidthPixels = latCanvas.width;
          const latHeightPixels = latCanvas.height;
          const latWidthMm = latWidthPixels * latMmPerPixel;
          const latHeightMm = latHeightPixels * latMmPerPixel;
          
          // Scale to fit page width while maintaining true aspect ratio
          const maxWidthMm = 180;
          let scaleFactor = 1;
          
          if (latWidthMm > maxWidthMm) {
            scaleFactor = maxWidthMm / latWidthMm;
          }
          
          const finalWidthMm = latWidthMm * scaleFactor;
          const finalHeightMm = latHeightMm * scaleFactor;
          
          pdf.addImage(latImage, 'PNG', 15, yPosition, finalWidthMm, finalHeightMm);
          
          // Add calibration scale for Lateral view
          const scaleY = yPosition + finalHeightMm + 5;
          addCalibrationScale(pdf, 15, scaleY, 100, 'Lateral', scaleFactor);
        }
      }
  
      // Save the PDF with patient ID if available
      const fileName = currentAnalysis.patient_id 
        ? `wristsight_analysis_${currentAnalysis.patient_id}.pdf` 
        : 'wristsight_analysis.pdf';
      pdf.save(fileName);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('An error occurred while exporting the PDF. Please try again.');
    }
  };
  
  // Helper function to add calibration scale with appropriate scaling factor
  const addCalibrationScale = (pdf, x, y, width, viewType, scaleFactor = 1) => {
    // Default to 0.144mm per pixel as specified
    const mmPerPixel = currentAnalysis?.calibration?.[viewType.toLowerCase()]?.mm_per_pixel || 0.144;
    
    // Adjust for scaling applied to the image
    const effectiveMmPerPixel = mmPerPixel / scaleFactor;
    
    // Draw the scale container
    pdf.setDrawColor(0, 0, 0);
    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(x, y, width, 15, 2, 2, 'FD');
    
    // Draw the scale line
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(x + 5, y + 7.5, x + width - 5, y + 7.5);
    
    // Calculate how much real distance this scale represents
    const scaleWidthMm = width - 10; // Width of the actual scale line in mm on PDF
    const realDistanceRepresented = scaleWidthMm / scaleFactor; // How many real mm this represents
    
    // Calculate how many cm fit in our scale
    const cmInScale = Math.floor(realDistanceRepresented / 10); // How many complete cm
    const mmPerUnit = scaleWidthMm / realDistanceRepresented; // PDF mm per real mm
    
    // Add scale information
    pdf.setFontSize(8);
    pdf.text(`Calibration scale (${mmPerPixel.toFixed(3)} mm/pixel)`, x + 5, y + 3);
    
    // Draw cm ticks and labels
    for (let cm = 0; cm <= cmInScale; cm++) {
      const tickPosition = x + 5 + (cm * 10 * mmPerUnit);
      
      // Draw cm tick (longer)
      pdf.line(tickPosition, y + 5, tickPosition, y + 10);
      
      // Label cm marks
      if (cm > 0) {
        pdf.setFontSize(7);
        pdf.text(`${cm} cm`, tickPosition - 3, y + 13);
      }
      
      // Draw mm ticks (shorter) - but only if there's enough space
      if (mmPerUnit > 0.8) {
        for (let mm = 1; mm < 10; mm++) {
          const mmPosition = tickPosition + (mm * mmPerUnit);
          if (mmPosition < x + width - 5) {
            pdf.line(mmPosition, y + 6, mmPosition, y + 9);
          }
        }
      }
    }
  };

  // Log the current view state for debugging
  useEffect(() => {
    console.log('Current view state:', {
      currentView,
      hasAp,
      hasLat
    });
  }, [currentView, hasAp, hasLat]);

  useEffect(() => {
    if (currentAnalysis) {
      console.log('ImageViewer received analysis:', {
        id: currentAnalysis.id,
        has_ap: currentAnalysis.has_ap,
        has_lat: currentAnalysis.has_lat,
        ap_image_url: currentAnalysis.ap_image_url,
        lat_image_url: currentAnalysis.lat_image_url,
        original_image_urls: currentAnalysis.image_urls
      });
    }
  }, [currentAnalysis]);

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