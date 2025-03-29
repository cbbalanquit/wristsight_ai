/**
 * API Service for WristSight AI
 * Handles all communication with the backend API
 */

// API base URL (update this to match your backend URL)
const API_BASE_URL = 'http://localhost:8000/api';

// API service object
const api = {
  /**
   * Create a new X-ray analysis
   * @param {FormData} formData - Form data with patient info and images
   * @returns {Promise<Object>} - Analysis response
   */
  createAnalysis: async function(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/analyses`, {
        method: 'POST',
        body: formData
        // Let browser set the Content-Type header with boundary
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error creating analysis');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating analysis:', error);
      throw error;
    }
  },
  
  /**
   * Get analysis details by ID
   * @param {string} analysisId - Analysis ID
   * @returns {Promise<Object>} - Analysis details
   */
  getAnalysis: async function(analysisId) {
    try {
      const response = await fetch(`${API_BASE_URL}/analyses/${analysisId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error fetching analysis');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching analysis:', error);
      throw error;
    }
  },
  
  /**
   * Delete analysis by ID
   * @param {string} analysisId - Analysis ID
   * @returns {Promise<boolean>} - Success status
   */
  deleteAnalysis: async function(analysisId) {
    try {
      const response = await fetch(`${API_BASE_URL}/analyses/${analysisId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error deleting analysis');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting analysis:', error);
      throw error;
    }
  },
  
  /**
   * Get analysis history with filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} - List of analysis summaries
   */
  getHistory: async function(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add query parameters if provided
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const url = `${API_BASE_URL}/history?${queryParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error fetching history');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  },
  
  /**
   * Get history for a specific patient
   * @param {string} patientId - Patient ID
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Array>} - List of analysis summaries
   */
  getPatientHistory: async function(patientId, limit = 100) {
    try {
      const url = `${API_BASE_URL}/patients/${patientId}/history?limit=${limit}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error fetching patient history');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching patient history:', error);
      throw error;
    }
  }
};