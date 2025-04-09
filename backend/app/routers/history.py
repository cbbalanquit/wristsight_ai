from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
import logging

from app.database import get_db
from app.models import Analysis, UserRole, User
from app.schemas import AnalysisSummary
from app.utils import load_analysis_result
from app import auth_utils  # Import the auth utilities

# Create router
router = APIRouter()

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get("/history", response_model=List[AnalysisSummary])
async def get_analysis_history(
    patient_id: Optional[str] = Query(None, description="Filter by patient ID"),
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of records to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_utils.get_current_user)  # Add authentication
):
    """
    Get analysis history with optional filtering.
    """
    try:
        # Start query
        query = db.query(Analysis)
        
        # Apply role-based filtering
        # Admin and superusers can see all analyses
        if current_user.role not in [UserRole.ADMIN, UserRole.SUPERUSER]:
            # Normal users can only see their own analyses
            query = query.filter(Analysis.user_id == current_user.id)
        
        # Apply additional filters
        if patient_id:
            query = query.filter(Analysis.patient_id == patient_id)
        
        if start_date:
            query = query.filter(Analysis.timestamp >= start_date)
        
        if end_date:
            query = query.filter(Analysis.timestamp <= end_date)
        
        # Get total count (for pagination info if needed)
        total_count = query.count()
        
        # Apply pagination and ordering
        analyses = query.order_by(desc(Analysis.timestamp)).offset(skip).limit(limit).all()
        
        # Prepare results
        results = []
        for analysis in analyses:
            try:
                analysis_result = load_analysis_result(analysis.result_path)
                summary = analysis_result.get("summary", "No summary available")
                
                image_urls = {
                    "ap_image_url": f"/static/images/{analysis.id}/ap.jpg" if analysis.ap_image_path else None,
                    "lat_image_url": f"/static/images/{analysis.id}/lat.jpg" if analysis.lat_image_path else None
                }

                results.append({
                    "id": analysis.id,
                    "patient_id": analysis.patient_id,
                    "timestamp": analysis.timestamp,
                    "image_urls": image_urls,
                    "summary": summary,
                    "status": analysis.status,
                    "user_id": analysis.user_id
                })
            except Exception as e:
                logger.error(f"Error processing analysis {analysis.id}: {str(e)}")

                results.append({
                    "id": analysis.id,
                    "patient_id": analysis.patient_id,
                    "timestamp": analysis.timestamp,
                    "image_urls": None,
                    "summary": "Error retrieving summary",
                    "status": analysis.status,
                    "user_id": analysis.user_id
                })
        
        return results
    
    except Exception as e:
        logger.error(f"Error in get_analysis_history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving history: {str(e)}"
        )

@router.get("/patients/{patient_id}/history", response_model=List[AnalysisSummary])
async def get_patient_history(
    patient_id: str,
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_utils.get_current_user)  # Add authentication
):
    """
    Get all analysis records for a specific patient.
    """
    try:
        # Start query for this patient
        query = db.query(Analysis).filter(Analysis.patient_id == patient_id)
        
        # Apply role-based filtering
        if current_user.role not in [UserRole.ADMIN, UserRole.SUPERUSER]:
            # Normal users can only see their own analyses
            query = query.filter(Analysis.user_id == current_user.id)
        
        # Get analyses with ordering and limit
        analyses = query.order_by(desc(Analysis.timestamp)).limit(limit).all()
        
        # Process results (reuse logic from previous endpoint)
        results = []
        for analysis in analyses:
            try:
                # Load analysis result for summary
                analysis_result = load_analysis_result(analysis.result_path)
                summary = analysis_result.get("summary", "No summary available")
                
                # Determine thumbnail URL
                if analysis.ap_image_path:
                    thumbnail_url = f"/static/images/{analysis.id}/ap.jpg"
                elif analysis.lat_image_path:
                    thumbnail_url = f"/static/images/{analysis.id}/lat.jpg"
                else:
                    thumbnail_url = None
                
                # Add to results
                results.append({
                    "id": analysis.id,
                    "patient_id": analysis.patient_id,
                    "timestamp": analysis.timestamp,
                    "thumbnail_url": thumbnail_url,
                    "summary": summary,
                    "status": analysis.status
                })
            except Exception as e:
                logger.error(f"Error processing analysis {analysis.id}: {str(e)}")
                # Still include the analysis in results but with minimal info
                results.append({
                    "id": analysis.id,
                    "patient_id": analysis.patient_id,
                    "timestamp": analysis.timestamp,
                    "thumbnail_url": None,
                    "summary": "Error retrieving summary",
                    "status": analysis.status
                })
        
        return results
    
    except Exception as e:
        logger.error(f"Error in get_patient_history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving patient history: {str(e)}"
        )

# Add this new endpoint to get all patients accessible to the user
@router.get("/patients", response_model=List[str])
async def get_accessible_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_utils.get_current_user)
):
    """
    Get all patient IDs accessible to the current user.
    """
    try:
        # Start query
        query = db.query(Analysis.patient_id).distinct()
        
        # Apply role-based filtering
        if current_user.role not in [UserRole.ADMIN, UserRole.SUPERUSER]:
            # Normal users can only see their own patients
            query = query.filter(Analysis.user_id == current_user.id)
        
        # Get unique patient IDs
        patient_ids = [row[0] for row in query.all()]
        
        return patient_ids
    
    except Exception as e:
        logger.error(f"Error in get_accessible_patients: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving patients: {str(e)}"
        )