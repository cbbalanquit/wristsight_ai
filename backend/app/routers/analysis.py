import os
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.database import get_db
from app.models import Analysis
from app.schemas import AnalysisResponse, AnalysisDetail
from app.utils import (
    save_uploaded_file,
    generate_analysis_id,
    generate_mock_analysis,
    save_analysis_result,
    load_analysis_result,
    cleanup_analysis_files
)
from app.config import settings

# Create router
router = APIRouter()

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/analyses", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def create_analysis(
    ap_image: Optional[UploadFile] = File(None),
    lat_image: Optional[UploadFile] = File(None),
    patient_id: str = Form(...),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Create a new X-ray analysis.
    
    At least one image (AP or lateral view) must be provided.
    """
    # Validate input
    if not ap_image and not lat_image:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one X-ray image (AP or lateral) is required"
        )
    
    # Generate analysis ID
    analysis_id = generate_analysis_id()
    logger.info(f"Creating analysis {analysis_id} for patient {patient_id}")
    
    # Create directories for this analysis
    analysis_dir = os.path.join(settings.IMAGES_DIR, analysis_id)
    os.makedirs(analysis_dir, exist_ok=True)
    
    # Initialize paths
    ap_path = None
    lat_path = None
    
    try:
        # Save uploaded files if they exist
        if ap_image:
            ap_path = os.path.join(analysis_dir, "ap.jpg")
            await save_uploaded_file(ap_image, ap_path)
        
        if lat_image:
            lat_path = os.path.join(analysis_dir, "lat.jpg")
            await save_uploaded_file(lat_image, lat_path)
        
        # Generate analysis results (mock or real)
        if settings.USE_MOCK:
            analysis_result = generate_mock_analysis(ap_path, lat_path)
        else:
            # Here you would call your real analysis function
            # For now, just use mock data
            analysis_result = generate_mock_analysis(ap_path, lat_path)
        
        # Save results to file
        result_path = save_analysis_result(analysis_id, analysis_result)
        
        # Save to database
        db_analysis = Analysis(
            id=analysis_id,
            patient_id=patient_id,
            ap_image_path=ap_path,
            lat_image_path=lat_path,
            result_path=result_path,
            notes=notes
        )
        db.add(db_analysis)
        db.commit()
        
        return {"analysis_id": analysis_id}
    
    except Exception as e:
        # Clean up on error
        cleanup_analysis_files(analysis_id)
        logger.error(f"Error in create_analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing analysis: {str(e)}"
        )

@router.get("/analyses/{analysis_id}", response_model=AnalysisDetail)
async def get_analysis(analysis_id: str, db: Session = Depends(get_db)):
    """
    Get detailed analysis results by ID.
    """
    # Get analysis from database
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis with ID {analysis_id} not found"
        )
    
    try:
        # Load analysis results
        analysis_result = load_analysis_result(analysis.result_path)

        ap_image_url = f"/static/images/{analysis_id}/ap.jpg" if analysis.ap_image_path else None
        lat_image_url = f"/static/images/{analysis_id}/lat.jpg" if analysis.lat_image_path else None
        
        result = {
            "id": analysis.id,
            "patient_id": analysis.patient_id,
            "timestamp": analysis.timestamp,
            "ap_image_url": ap_image_url,
            "lat_image_url": lat_image_url,
            "has_ap": analysis.ap_image_path is not None,
            "has_lat": analysis.lat_image_path is not None,
            "notes": analysis.notes,
            "status": analysis.status,
            "measurements": analysis_result.get("measurements", []),
            "summary": analysis_result.get("summary", "No summary available")
        }
        
        return result
    
    except Exception as e:
        logger.error(f"Error in get_analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving analysis: {str(e)}"
        )

@router.delete("/analyses/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analysis(analysis_id: str, db: Session = Depends(get_db)):
    """
    Delete an analysis and associated files.
    """
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis with ID {analysis_id} not found"
        )
    
    try:
        db.delete(analysis)
        db.commit()

        cleanup_analysis_files(analysis_id)
        
        return None
    
    except Exception as e:
        logger.error(f"Error in delete_analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting analysis: {str(e)}"
        )
