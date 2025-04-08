/**
 * API Service for WristSight AI
 * Handles all communication with the backend API
 */

// API Base URL - replace with your actual API URL
const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Run analysis on X-ray images
 * @param {FormData} formData - Form data containing patient ID, notes, and images
 * @returns {Promise<Object>} - The analysis result
 */
export const runAnalysis = async (formData) => {
  try {
    // Step 1: Submit the images for analysis
    console.log('Submitting images for analysis...');
    const submitResponse = await fetch(`${API_BASE_URL}/analyses`, {
      method: 'POST',
      body: formData,
    });
    
    if (!submitResponse.ok) {
      throw new Error(`API error: ${submitResponse.status} ${submitResponse.statusText}`);
    }
    
    const submitData = await submitResponse.json();
    console.log('Submit response:', submitData);
    
    // Step 2: Get the full analysis results using the returned ID
    if (submitData.analysis_id) {
      console.log('Fetching full analysis results for ID:', submitData.analysis_id);
      const analysisResponse = await fetch(`${API_BASE_URL}/analyses/${submitData.analysis_id}`);
      
      if (!analysisResponse.ok) {
        throw new Error(`API error: ${analysisResponse.status} ${analysisResponse.statusText}`);
      }
      
      const analysisData = await analysisResponse.json();
      console.log('Full analysis data:', analysisData);
      
      return analysisData;
    } else {
      throw new Error('No analysis ID returned from server');
    }
  } catch (error) {
    console.error('Error running analysis:', error);
    
    // For development/testing, return mock data
    if (process.env.NODE_ENV === 'development') {
      return generateMockAnalysis();
    }
    
    throw error;
  }
};

/**
 * Fetch patient history
 * @param {Object} params - Optional query parameters
 * @returns {Promise<Array>} - List of history records
 */
export const fetchPatientHistory = async (params = {}) => {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await fetch(`${API_BASE_URL}/history${queryString}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching history:', error);
    
    // For development/testing, return mock data
    if (process.env.NODE_ENV === 'development') {
      return generateMockHistory();
    }
    
    throw error;
  }
};

/**
 * Generate mock analysis data for development/testing
 * @returns {Object} - Mock analysis data
 */
const generateMockAnalysis = () => {
  return {
    id: `MOCK-${Date.now()}`,
    patient_id: 'PATIENT-001',
    timestamp: new Date().toISOString(),
    ap_image_url: 'https://via.placeholder.com/500x600?text=AP+View',
    lat_image_url: 'https://via.placeholder.com/500x600?text=Lateral+View',
    has_ap: true,
    has_lat: true,
    notes: 'This is a mock analysis for testing purposes.',
    status: 'Complete',
    measurements: generateMockMeasurements(),
    summary: 'All radiographic measurements are within normal limits. No significant abnormalities detected.'
  };
};

/**
 * Generate mock measurements for development/testing
 * @returns {Array} - Mock measurements data
 */
const generateMockMeasurements = () => {
  return [
    {
      name: 'Radial Inclination',
      value: '23',
      unit: '°',
      normal_range: '22-23°',
      status: 'Normal',
      view: 'ap',
      position: { x: 60, y: 40 }
    },
    {
      name: 'Radial Height',
      value: '12',
      unit: 'mm',
      normal_range: '9-14mm',
      status: 'Normal',
      view: 'ap',
      position: { x: 70, y: 50 }
    },
    {
      name: 'Ulnar Variance',
      value: '1.2',
      unit: 'mm',
      normal_range: '-2-2mm',
      status: 'Normal',
      view: 'ap',
      position: { x: 45, y: 55 }
    },
    {
      name: 'Volar Tilt',
      value: '11',
      unit: '°',
      normal_range: '10-15°',
      status: 'Normal',
      view: 'lat',
      position: { x: 55, y: 45 }
    },
  ];
};

/**
 * Generate mock history data for development/testing
 * @returns {Array} - Mock history records
 */
const generateMockHistory = () => {
  return Array.from({ length: 25 }, (_, i) => ({
    id: `MOCK-${i + 1}`,
    patient_id: `PATIENT-${(i % 10) + 1}`.padStart(10, '0'),
    timestamp: new Date(Date.now() - i * 86400000).toISOString(), // each record is one day apart
    ap_image_url: 'https://via.placeholder.com/500x600?text=AP+View',
    lat_image_url: 'https://via.placeholder.com/500x600?text=Lateral+View',
    has_ap: Math.random() > 0.2, // 80% chance of having AP view
    has_lat: Math.random() > 0.3, // 70% chance of having Lateral view
    notes: i % 3 === 0 ? 'Follow-up exam' : i % 5 === 0 ? 'Initial assessment' : '',
    status: i % 10 === 0 ? 'In Progress' : i % 7 === 0 ? 'Error' : 'Complete',
    measurements: generateMockMeasurements(),
    summary: i % 4 === 0 
      ? 'Increased volar tilt outside of normal range. Consider follow-up.' 
      : 'All radiographic measurements are within normal limits. No significant abnormalities detected.'
  }));
};