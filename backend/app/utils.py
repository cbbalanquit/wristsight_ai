import os
import shutil
import uuid
import json
from typing import Dict, Any, Optional
from fastapi import UploadFile
from PIL import Image

from app.config import settings

async def save_uploaded_file(file: UploadFile, destination: str) -> str:
    """
    Save an uploaded file to the specified destination.
    
    Args:
        file: The uploaded file
        destination: Path where the file should be saved
        
    Returns:
        str: Path to the saved file
    """
    # Ensure parent directory exists
    os.makedirs(os.path.dirname(destination), exist_ok=True)
    
    # Save the file
    with open(destination, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return destination

def generate_analysis_id() -> str:
    """
    Generate a unique ID for a new analysis.
    
    Returns:
        str: Unique ID
    """
    return str(uuid.uuid4())

def save_analysis_result(analysis_id: str, result: Dict[str, Any]) -> str:
    """
    Save analysis results to a JSON file.
    
    Args:
        analysis_id: Analysis identifier
        result: Analysis results to save
        
    Returns:
        str: Path to the saved results file
    """
    # Create result path
    result_path = os.path.join(settings.RESULTS_DIR, f"{analysis_id}.json")
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(result_path), exist_ok=True)
    
    # Save results as JSON
    with open(result_path, "w") as f:
        json.dump(result, f, indent=2)
    
    return result_path

def load_analysis_result(path: str) -> Dict[str, Any]:
    """
    Load analysis results from a JSON file.
    
    Args:
        path: Path to the results file
        
    Returns:
        Dict[str, Any]: Analysis results
    """
    with open(path, "r") as f:
        return json.load(f)

def generate_mock_analysis(ap_path: Optional[str], lat_path: Optional[str]) -> Dict[str, Any]:
    """
    Generate mock analysis data for development.
    
    Args:
        ap_path: Path to AP view image (optional)
        lat_path: Path to lateral view image (optional)
        
    Returns:
        Dict[str, Any]: Mock analysis results
    """
    # Initialize result
    result = {
        "ap_landmarks": [],
        "lat_landmarks": [],
        "ap_reference_lines": [],
        "lat_reference_lines": [],
        "measurements": [],
        "has_ap": ap_path is not None,
        "has_lat": lat_path is not None
    }
    
    # Get image dimensions if available
    ap_width, ap_height = (800, 600)  # Default dimensions
    lat_width, lat_height = (800, 600)  # Default dimensions
    
    if ap_path:
        try:
            img = Image.open(ap_path)
            ap_width, ap_height = img.size
        except:
            pass
    
    if lat_path:
        try:
            img = Image.open(lat_path)
            lat_width, lat_height = img.size
        except:
            pass
    
    # Add mock measurements
    result["measurements"] = [
        {"label": "Radial Angle", "value": "22.3", "unit": "°"},
        {"label": "Radial Length", "value": "12.1", "unit": "mm"},
        {"label": "Radial Shift", "value": "1.2", "unit": "mm"},
        {"label": "Ulnar Variance", "value": "0.5", "unit": "mm"},
        {"label": "Palmar Tilt", "value": "11.2", "unit": "°"},
        {"label": "Dorsal Shift", "value": "2.1", "unit": "mm"}
    ]
    
    # Generate summary
    if ap_path and lat_path:
        result["summary"] = "Analysis of both AP and lateral views shows normal wrist alignment with no significant abnormalities in bone structure or positioning."
    elif ap_path:
        result["summary"] = "Analysis of AP view indicates normal alignment of radius and ulna. Consider lateral view for complete evaluation of palmar tilt and dorsal shift."
    elif lat_path:
        result["summary"] = "Analysis of lateral view shows appropriate palmar tilt. Consider AP view for complete evaluation of radial angle and ulnar variance."
    
    return result

def cleanup_analysis_files(analysis_id: str) -> None:
    """
    Clean up all files associated with an analysis.
    
    Args:
        analysis_id: Analysis identifier
    """
    # Clean up image files
    image_dir = os.path.join(settings.IMAGES_DIR, analysis_id)
    if os.path.exists(image_dir):
        shutil.rmtree(image_dir)
    
    # Clean up results file
    result_path = os.path.join(settings.RESULTS_DIR, f"{analysis_id}.json")
    if os.path.exists(result_path):
        os.remove(result_path)
