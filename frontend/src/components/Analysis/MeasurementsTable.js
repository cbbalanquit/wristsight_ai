import React from 'react';
import { useAnalysis } from '../../contexts/AnalysisContext';
import './MeasurementsTable.css';

const MeasurementsTable = () => {
  const { currentAnalysis } = useAnalysis();
  
  // Helper function to determine status
  const getStatusClass = (value, normalRange) => {
    if (!normalRange) return '';
    
    const [min, max] = normalRange.split('-').map(n => parseFloat(n.trim()));
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || isNaN(min) || isNaN(max)) {
      return '';
    }
    
    if (numValue < min) return 'status-low';
    if (numValue > max) return 'status-high';
    return 'status-normal';
  };
  
  // Generate mock measurements for demonstration
  const getMockMeasurements = () => {
    return [
      {
        name: 'Radial Inclination',
        value: '23',
        unit: '°',
        normal_range: '22-23°',
        view: 'ap'
      },
      {
        name: 'Radial Height',
        value: '12',
        unit: 'mm',
        normal_range: '9-14mm',
        view: 'ap'
      },
      {
        name: 'Ulnar Variance',
        value: '1.2',
        unit: 'mm',
        normal_range: '-2-2mm',
        view: 'ap'
      },
      {
        name: 'Volar Tilt',
        value: '11',
        unit: '°',
        normal_range: '10-15°',
        view: 'lat'
      },
    ];
  };

  // Use actual measurements or mock data
  const measurements = currentAnalysis?.measurements || getMockMeasurements();
  
  return (
    <div className="measurements-table-container scrollable">
      <h3>Measurements</h3>
      
      {!currentAnalysis ? (
        <div id="empty-measurements" className="empty-measurements">
          <p>No measurements available</p>
        </div>
      ) : (
        <div id="measurements-content" className="measurements-content">
          <div className="table-wrapper">
            <table className="measurements-table">
              <thead>
                <tr>
                  <th>Measurement</th>
                  <th>Value</th>
                  <th>Normal Range</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((measurement, index) => (
                  <tr key={`measurement-${index}`}>
                    <td>{measurement.label || measurement.name}</td>
                    <td>{measurement.value}{measurement.unit}</td>
                    <td>{measurement.normal_range || 'N/A'}</td>
                    <td className={getStatusClass(measurement.value, measurement.normal_range)}>
                      {
                        measurement.normal_range ? (
                          getStatusClass(measurement.value, measurement.normal_range) === 'status-normal' ? 'Normal' :
                          getStatusClass(measurement.value, measurement.normal_range) === 'status-low' ? 'Low' : 
                          'High'
                        ) : 'N/A'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="analysis-summary">
            <h4>Summary</h4>
            <p id="analysis-summary-text">
              {currentAnalysis.summary || 'All radiographic measurements are within normal limits. No significant abnormalities detected.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeasurementsTable;