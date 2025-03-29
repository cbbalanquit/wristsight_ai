# WristSight AI Frontend

A web application for radiologists and orthopedic doctors to analyze X-ray images using automated radiographic measurements.

## Overview

WristSight AI provides an intuitive interface to:
- Upload AP and lateral X-ray images
- View automated radiographic measurements and analysis
- Compare measurements to normal ranges
- Access patient history and previous analyses
- Export and share analysis results

## Setup Instructions

### Prerequisites

- A running WristSight AI backend server (FastAPI)
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/wristsight-frontend.git
cd wristsight-frontend
```

2. Set up the project structure:
```bash
mkdir -p css js assets
```

3. Copy the provided files into the appropriate directories:
- HTML file in the root directory
- CSS files in the `css` directory
- JavaScript files in the `js` directory
- Assets (like logo.svg) in the `assets` directory

4. Configure the API connection:
Open `js/api.js` and update the `API_BASE_URL` to match your backend server:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

### Running the Application

Since this is a simple HTML/CSS/JavaScript application, you can:

1. Open the `index.html` file directly in your browser
2. Use any basic web server to serve the files

Example using Python's built-in HTTP server:
```bash
python -m http.server 8080
```

Then visit `http://localhost:8080` in your browser.

## Backend Integration

This frontend is designed to work with the WristSight AI FastAPI backend. Make sure your backend server:

1. Is running and accessible
2. Has CORS enabled to allow requests from the frontend
3. Implements the expected API endpoints:
   - `POST /api/analyses` - Create a new analysis
   - `GET /api/analyses/{analysis_id}` - Get analysis details
   - `DELETE /api/analyses/{analysis_id}` - Delete an analysis
   - `GET /api/history` - Get analysis history
   - `GET /api/patients/{patient_id}/history` - Get patient history

## Development

For development and testing, the application includes a "Load Mock Data" button (visible when running locally) that populates the UI with sample data to help visualize the interface without needing to upload real images.

## Structure

- `index.html` - Main HTML structure
- `css/styles.css` - Main stylesheet
- `js/api.js` - API communication functions
- `js/app.js` - Main application logic
- `js/upload.js` - X-ray image upload functionality
- `js/analysis.js` - Analysis view functionality
- `js/controls.js` - Analysis controls functionality 
- `js/measurements.js` - Measurements table functionality
- `js/history.js` - Patient history functionality

## Customization

You can customize the application by:
- Modifying the CSS in `css/styles.css` for appearance changes
- Updating the API endpoint URLs in `js/api.js`
- Adding additional features by extending the JavaScript modules