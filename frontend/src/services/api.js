/**
 * API Service for WristSight AI
 * Handles all communication with the backend API
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to inject token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication API Methods
 */

/**
 * Login user
 * @param {string} username - Username or email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Response with access token
 */
export const loginUser = async (username, password) => {
  try {
    // FastAPI OAuth2 expects form data
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - New user data
 */
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Get current user profile
 * @returns {Promise<Object>} - User profile data
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

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
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!submitResponse.ok) {
      throw new Error(`API error: ${submitResponse.status} ${submitResponse.statusText}`);
    }
    
    const submitData = await submitResponse.json();
    console.log('Submit response:', submitData);
    
    // Step 2: Get the full analysis results using the returned ID
    if (submitData.analysis_id) {
      console.log('Fetching full analysis results for ID:', submitData.analysis_id);
      const analysisResponse = await fetch(`${API_BASE_URL}/analyses/${submitData.analysis_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
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
    
    const response = await fetch(`${API_BASE_URL}/history${queryString}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
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