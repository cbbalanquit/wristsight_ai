/**
 * Upload Functionality for WristSight AI
 * Handles the X-ray image upload UI and logic
 */

// File upload state
const uploadState = {
    apImage: null,
    latImage: null,
    patientId: '',
    notes: ''
  };
  
  // DOM Elements
  const uploadForm = document.getElementById('upload-form');
  const patientIdInput = document.getElementById('patient-id');
  const notesInput = document.getElementById('notes');
  const runAnalysisBtn = document.getElementById('run-analysis-btn');
  
  // AP Image Elements
  const apDropzone = document.getElementById('ap-dropzone');
  const apFileInput = document.getElementById('ap-file-input');
  const apBrowseBtn = document.getElementById('ap-browse-btn');
  const apPreviewContainer = document.getElementById('ap-preview-container');
  const apUploadPrompt = document.getElementById('ap-upload-prompt');
  const apPreview = document.getElementById('ap-preview');
  const apRemoveBtn = document.getElementById('ap-remove-btn');
  
  // Lateral Image Elements
  const latDropzone = document.getElementById('lat-dropzone');
  const latFileInput = document.getElementById('lat-file-input');
  const latBrowseBtn = document.getElementById('lat-browse-btn');
  const latPreviewContainer = document.getElementById('lat-preview-container');
  const latUploadPrompt = document.getElementById('lat-upload-prompt');
  const latPreview = document.getElementById('lat-preview');
  const latRemoveBtn = document.getElementById('lat-remove-btn');
  
  /**
   * Initialize upload functionality
   */
  function initUpload() {
    // Patient ID input event
    patientIdInput.addEventListener('input', function() {
      uploadState.patientId = this.value.trim();
      updateSubmitButtonState();
    });
    
    // Notes input event
    notesInput.addEventListener('input', function() {
      uploadState.notes = this.value.trim();
    });
    
    // AP File input change event
    apFileInput.addEventListener('change', function(event) {
      handleFileSelect(event, 'ap');
    });
    
    // Lateral File input change event
    latFileInput.addEventListener('change', function(event) {
      handleFileSelect(event, 'lat');
    });
    
    // Browse button click events
    apBrowseBtn.addEventListener('click', function() {
      apFileInput.click();
    });
    
    latBrowseBtn.addEventListener('click', function() {
      latFileInput.click();
    });
    
    // Remove button click events
    apRemoveBtn.addEventListener('click', function(event) {
      event.stopPropagation();
      removeFile('ap');
    });
    
    latRemoveBtn.addEventListener('click', function(event) {
      event.stopPropagation();
      removeFile('lat');
    });
    
    // Dropzone click events
    apDropzone.addEventListener('click', function() {
      if (!uploadState.apImage) {
        apFileInput.click();
      }
    });
    
    latDropzone.addEventListener('click', function() {
      if (!uploadState.latImage) {
        latFileInput.click();
      }
    });
    
    // Drag and drop events for AP
    apDropzone.addEventListener('dragover', handleDragOver);
    apDropzone.addEventListener('drop', function(event) {
      handleDrop(event, 'ap');
    });
    
    // Drag and drop events for Lateral
    latDropzone.addEventListener('dragover', handleDragOver);
    latDropzone.addEventListener('drop', function(event) {
      handleDrop(event, 'lat');
    });
    
    // Form submission
    uploadForm.addEventListener('submit', handleSubmit);
  }
  
  /**
   * Handle file selection from file input
   * @param {Event} event - The change event
   * @param {string} view - The view type ('ap' or 'lat')
   */
  function handleFileSelect(event, view) {
    const file = event.target.files[0];
    if (!file) return;
  
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Update state and UI
    setFile(file, view);
  }
  
  /**
   * Handle drag over event
   * @param {Event} event - The drag over event
   */
  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
  }
  
  /**
   * Handle drop event
   * @param {Event} event - The drop event
   * @param {string} view - The view type ('ap' or 'lat')
   */
  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const view = event.currentTarget.id === 'ap-dropzone' ? 'ap' : 'lat';
    
    // Check if a file was dropped
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      
      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please drop an image file');
        return;
      }
      
      // Update state and UI
      setFile(file, view);
    }
  }
  
  /**
   * Set a file for a specific view
   * @param {File} file - The file object
   * @param {string} view - The view type ('ap' or 'lat')
   */
  function setFile(file, view) {
    // Update state
    if (view === 'ap') {
      uploadState.apImage = file;
    } else {
      uploadState.latImage = file;
    }
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = view === 'ap' ? apPreview : latPreview;
      preview.src = e.target.result;
      
      // Show preview, hide upload prompt
      if (view === 'ap') {
        apPreviewContainer.classList.remove('hidden');
        apUploadPrompt.classList.add('hidden');
      } else {
        latPreviewContainer.classList.remove('hidden');
        latUploadPrompt.classList.add('hidden');
      }
    };
    reader.readAsDataURL(file);
    
    // Update submit button state
    updateSubmitButtonState();
  }
  
  /**
   * Remove a file from a specific view
   * @param {string} view - The view type ('ap' or 'lat')
   */
  function removeFile(view) {
    // Update state
    if (view === 'ap') {
      uploadState.apImage = null;
      apFileInput.value = '';
      apPreviewContainer.classList.add('hidden');
      apUploadPrompt.classList.remove('hidden');
    } else {
      uploadState.latImage = null;
      latFileInput.value = '';
      latPreviewContainer.classList.add('hidden');
      latUploadPrompt.classList.remove('hidden');
    }
    
    // Update submit button state
    updateSubmitButtonState();
  }
  
  /**
   * Update the submit button state based on form validity
   */
  function updateSubmitButtonState() {
    const isValid = uploadState.patientId && (uploadState.apImage || uploadState.latImage);
    runAnalysisBtn.disabled = !isValid;
  }
  
  /**
   * Handle form submission
   * @param {Event} event - The submit event
   */
  async function handleSubmit(event) {
    event.preventDefault();
    
    if (!uploadState.patientId) {
      alert('Please enter a patient ID');
      return;
    }
    
    if (!uploadState.apImage && !uploadState.latImage) {
      alert('Please upload at least one X-ray image (AP or lateral)');
      return;
    }
    
    // Show loading spinner
    document.getElementById('loading-spinner').classList.remove('hidden');
    
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
      
      // Send to API
      const response = await api.createAnalysis(formData);
      
      // Get analysis details
      if (response.analysis_id) {
        const analysisData = await api.getAnalysis(response.analysis_id);
        
        // Process and display the analysis
        displayAnalysis(analysisData);
        
        // Reset the form
        resetForm();
      }
    } catch (error) {
      console.error('Error submitting analysis:', error);
      alert(`Error: ${error.message}`);
    } finally {
      // Hide loading spinner
      document.getElementById('loading-spinner').classList.add('hidden');
    }
  }
  
  /**
   * Reset the upload form
   */
  function resetForm() {
    // Reset state
    uploadState.apImage = null;
    uploadState.latImage = null;
    uploadState.patientId = '';
    uploadState.notes = '';
    
    // Reset form inputs
    patientIdInput.value = '';
    notesInput.value = '';
    apFileInput.value = '';
    latFileInput.value = '';
    
    // Reset preview images
    apPreviewContainer.classList.add('hidden');
    apUploadPrompt.classList.remove('hidden');
    latPreviewContainer.classList.add('hidden');
    latUploadPrompt.classList.remove('hidden');
    
    // Update submit button state
    updateSubmitButtonState();
  }