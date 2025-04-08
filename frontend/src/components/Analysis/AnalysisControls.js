import React from 'react';
import { useAnalysis } from '../../contexts/AnalysisContext';
import ToggleSwitch from '../UI/ToggleSwitch';
import './AnalysisControls.css';

const AnalysisControls = () => {
  const { currentAnalysis, settings, setSettings } = useAnalysis();
  
  const handleLandmarksToggle = () => {
    setSettings(prev => ({ ...prev, showLandmarks: !prev.showLandmarks }));
  };
  
  const handleReferenceLinesToggle = () => {
    setSettings(prev => ({ ...prev, showReferenceLines: !prev.showReferenceLines }));
  };
  
  const handleMeasurementsToggle = () => {
    setSettings(prev => ({ ...prev, showMeasurements: !prev.showMeasurements }));
  };
  
  return (
    <div className="analysis-controls">
      <h3>Analysis Controls</h3>
      
      <div className="control-list">
        <div className="control-item">
          <label htmlFor="toggle-landmarks">Show Landmarks</label>
          <ToggleSwitch 
            id="toggle-landmarks" 
            checked={settings.showLandmarks} 
            onChange={handleLandmarksToggle} 
          />
        </div>
        
        <div className="control-item">
          <label htmlFor="toggle-reference-lines">Show Reference Lines</label>
          <ToggleSwitch 
            id="toggle-reference-lines" 
            checked={settings.showReferenceLines} 
            onChange={handleReferenceLinesToggle} 
          />
        </div>
        
        <div className="control-item">
          <label htmlFor="toggle-measurements">Show Measurements</label>
          <ToggleSwitch 
            id="toggle-measurements" 
            checked={settings.showMeasurements} 
            onChange={handleMeasurementsToggle} 
          />
        </div>
      </div>
      
      {currentAnalysis && (
        <div id="analysis-info" className="analysis-info">
          <div className="info-item">
            <span className="info-label">Patient ID:</span>
            <span id="info-patient-id" className="info-value">
              {currentAnalysis.patient_id || '-'}
            </span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Analysis ID:</span>
            <span id="info-analysis-id" className="info-value">
              {currentAnalysis.id || '-'}
            </span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Date:</span>
            <span id="info-date" className="info-value">
              {currentAnalysis.timestamp ? new Date(currentAnalysis.timestamp).toLocaleString() : '-'}
            </span>
          </div>
          
          <div className="info-item notes">
            <span className="info-label">Notes:</span>
            <span id="info-notes" className="info-value">
              {currentAnalysis.notes || '-'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisControls;