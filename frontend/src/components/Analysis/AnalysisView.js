import React, { useState } from 'react';
import { useAnalysis } from '../../contexts/AnalysisContext';
import UploadPanel from './UploadPanel';
import AnalysisControls from './AnalysisControls';
import ImageViewer from './ImageViewer';
import MeasurementsTable from './MeasurementsTable';
import LoadingSpinner from '../UI/LoadingSpinner';
import './AnalysisView.css';

const AnalysisView = () => {
  const { currentAnalysis } = useAnalysis();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="analysis-container">
      {isLoading && <LoadingSpinner message="Processing X-ray analysis..." />}
      
      {/* Left Panel */}
      <div className="left-panel">
        <UploadPanel setIsLoading={setIsLoading} />
        <AnalysisControls />
      </div>
      
      {/* Right Panel */}
      <div className="right-panel">
        <ImageViewer />
        <MeasurementsTable />
      </div>
    </div>
  );
};

export default AnalysisView;