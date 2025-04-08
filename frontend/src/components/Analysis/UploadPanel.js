import React, { useState, useRef } from 'react';
import { useAnalysis } from '../../contexts/AnalysisContext';
import { runAnalysis } from '../../services/api';
import './UploadPanel.css';

const UploadPanel = ({ setIsLoading }) => {
  const { uploadState, setUploadState, setCurrentAnalysis } = useAnalysis();
  
  const apFileInputRef = useRef(null);
  const latFileInputRef = useRef(null);
  
  const [apPreview, setApPreview] = useState(null);
  const [latPreview, setLatPreview] = useState(null);

  const handlePatientIdChange = (e) => {
    setUploadState(prev => ({ ...prev, patientId: e.target.value }));
  };

  const handleNotesChange = (e) => {
    setUploadState(prev => ({ ...prev, notes: e.target.value }));
  };

  const handleApBrowseClick = () => {
    apFileInputRef.current.click();
  };

  const handleLatBrowseClick = () => {
    latFileInputRef.current.click();
  };

  const handleApFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadState(prev => ({ ...prev, apImage: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setApPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLatFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadState(prev => ({ ...prev, latImage: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLatPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApRemove = () => {
    setUploadState(prev => ({ ...prev, apImage: null }));
    setApPreview(null);
    if (apFileInputRef.current) {
      apFileInputRef.current.value = '';
    }
  };

  const handleLatRemove = () => {
    setUploadState(prev => ({ ...prev, latImage: null }));
    setLatPreview(null);
    if (latFileInputRef.current) {
      latFileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleApDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadState(prev => ({ ...prev, apImage: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setApPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLatDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadState(prev => ({ ...prev, latImage: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLatPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadState.patientId || (!uploadState.apImage && !uploadState.latImage)) {
      alert('Please enter a patient ID and upload at least one image.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('patient_id', uploadState.patientId);
      
      if (uploadState.notes) {
        formData.append('notes', uploadState.notes);
      }
      
      if (uploadState.apImage) {
        formData.append('ap_image', uploadState.apImage);
      }
      
      if (uploadState.latImage) {
        formData.append('lat_image', uploadState.latImage);
      }
      
      console.log('Submitting analysis request...', {
        patientId: uploadState.patientId,
        hasAp: !!uploadState.apImage,
        hasLat: !!uploadState.latImage,
      });
      
      // Call API service
      const analysisResult = await runAnalysis(formData);
      
      // Add debugging logs to see the API response
      console.log('Analysis API response:', analysisResult);
      
      // Check for image URLs and log them
      if (analysisResult.ap_image_url) {
        console.log('AP image URL received:', analysisResult.ap_image_url);
      }
      if (analysisResult.lat_image_url) {
        console.log('Lateral image URL received:', analysisResult.lat_image_url);
      }
      
      // Make sure the has_ap and has_lat flags are correctly set
      if (analysisResult.ap_image_url && !analysisResult.has_ap) {
        console.log('Adding has_ap flag to analysis result');
        analysisResult.has_ap = true;
      }
      
      if (analysisResult.lat_image_url && !analysisResult.has_lat) {
        console.log('Adding has_lat flag to analysis result');
        analysisResult.has_lat = true;
      }
      
      // Update analysis context
      setCurrentAnalysis(analysisResult);
      
    } catch (error) {
      console.error('Error running analysis:', error);
      alert('An error occurred while running the analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = uploadState.patientId && (uploadState.apImage || uploadState.latImage);

  return (
    <div className="upload-panel">
      <h2>Upload X-Ray Image</h2>
      
      <form id="upload-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="patient-id">Patient ID:</label>
          <input
            type="text"
            id="patient-id"
            value={uploadState.patientId}
            onChange={handlePatientIdChange}
            required
            placeholder="Enter patient ID"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="notes">Notes (Optional):</label>
          <textarea
            id="notes"
            value={uploadState.notes}
            onChange={handleNotesChange}
            placeholder="Add any relevant notes"
            rows="2"
          />
        </div>
        
        <div className="upload-container">
          <div className="upload-box">
            <div
              id="ap-dropzone"
              className="dropzone"
              onDragOver={handleDragOver}
              onDrop={handleApDrop}
            >
              {apPreview ? (
                <div id="ap-preview-container" className="preview-container">
                  <img id="ap-preview" src={apPreview} alt="AP view preview" className="image-preview" />
                  <button type="button" id="ap-remove-btn" className="remove-btn" onClick={handleApRemove}>×</button>
                </div>
              ) : (
                <div id="ap-upload-prompt" className="upload-prompt">
                  <div className="upload-icon">
                    <i className="fas fa-upload"></i>
                  </div>
                  <p>Upload an AP image</p>
                  <p className="or-text">or</p>
                  <button type="button" id="ap-browse-btn" className="browse-btn" onClick={handleApBrowseClick}>
                    Browse Files
                  </button>
                  <input
                    type="file"
                    id="ap-file-input"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={apFileInputRef}
                    onChange={handleApFileChange}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="upload-box">
            <div
              id="lat-dropzone"
              className="dropzone"
              onDragOver={handleDragOver}
              onDrop={handleLatDrop}
            >
              {latPreview ? (
                <div id="lat-preview-container" className="preview-container">
                  <img id="lat-preview" src={latPreview} alt="Lateral view preview" className="image-preview" />
                  <button type="button" id="lat-remove-btn" className="remove-btn" onClick={handleLatRemove}>×</button>
                </div>
              ) : (
                <div id="lat-upload-prompt" className="upload-prompt">
                  <div className="upload-icon">
                    <i className="fas fa-upload"></i>
                  </div>
                  <p>Upload a Lateral image</p>
                  <p className="or-text">or</p>
                  <button type="button" id="lat-browse-btn" className="browse-btn" onClick={handleLatBrowseClick}>
                    Browse Files
                  </button>
                  <input
                    type="file"
                    id="lat-file-input"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={latFileInputRef}
                    onChange={handleLatFileChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          id="run-analysis-btn"
          className="run-analysis-btn"
          disabled={!isFormValid}
        >
          Run Analysis
        </button>
      </form>
    </div>
  );
};

export default UploadPanel;