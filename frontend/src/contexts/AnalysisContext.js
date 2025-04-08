import React, { createContext, useState, useContext, useEffect } from 'react';

const AnalysisContext = createContext();

export const useAnalysis = () => useContext(AnalysisContext);

export const AnalysisProvider = ({ children }) => {
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [viewState, setViewState] = useState({
    currentView: 'both', // 'both', 'ap', or 'lat'
    zoomLevel: 1,
  });
  const [settings, setSettings] = useState({
    showLandmarks: true,
    showReferenceLines: true,
    showMeasurements: true,
  });
  const [uploadState, setUploadState] = useState({
    apImage: null,
    latImage: null,
    patientId: '',
    notes: '',
  });
  
  // Add functions to modify state
  const setActiveView = (view) => {
    setViewState(prev => ({ ...prev, currentView: view }));
  };
  
  const zoomIn = () => {
    setViewState(prev => ({ 
      ...prev, 
      zoomLevel: prev.zoomLevel < 3 ? prev.zoomLevel + 0.25 : prev.zoomLevel 
    }));
  };
  
  const zoomOut = () => {
    setViewState(prev => ({ 
      ...prev, 
      zoomLevel: prev.zoomLevel > 0.5 ? prev.zoomLevel - 0.25 : prev.zoomLevel 
    }));
  };
  
  const resetZoom = () => {
    setViewState(prev => ({ ...prev, zoomLevel: 1 }));
  };
  
  const clearAnalysis = () => {
    setCurrentAnalysis(null);
  };
  
  // Add a custom setCurrentAnalysis wrapper that ensures image flags are set
  const setAnalysisWithImageFlags = (analysisData) => {
    if (!analysisData) {
      setCurrentAnalysis(null);
      return;
    }
    
    // Create a copy to avoid modifying the original
    const updatedAnalysis = { ...analysisData };
    
    // Ensure has_ap and has_lat flags are set if image URLs exist
    if (updatedAnalysis.ap_image_url && !updatedAnalysis.has_ap) {
      console.log('Setting has_ap flag based on ap_image_url');
      updatedAnalysis.has_ap = true;
    }
    
    if (updatedAnalysis.lat_image_url && !updatedAnalysis.has_lat) {
      console.log('Setting has_lat flag based on lat_image_url');
      updatedAnalysis.has_lat = true;
    }
    
    setCurrentAnalysis(updatedAnalysis);
  };
  
  // Debug logging for analysis changes
  useEffect(() => {
    if (currentAnalysis) {
      console.log('Analysis updated in context:', {
        id: currentAnalysis.id,
        has_ap: currentAnalysis.has_ap,
        has_lat: currentAnalysis.has_lat,
        ap_image_url: currentAnalysis.ap_image_url,
        lat_image_url: currentAnalysis.lat_image_url
      });
    }
  }, [currentAnalysis]);
  
  const value = {
    currentAnalysis,
    setCurrentAnalysis: setAnalysisWithImageFlags, // Replace with enhanced version
    viewState,
    settings,
    setSettings,
    uploadState,
    setUploadState,
    setActiveView,
    zoomIn,
    zoomOut,
    resetZoom,
    clearAnalysis
  };
  
  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
};