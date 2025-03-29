from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# Analysis schemas
class AnalysisBase(BaseModel):
    patient_id: str
    notes: Optional[str] = None

class AnalysisCreate(AnalysisBase):
    pass

class AnalysisResponse(BaseModel):
    analysis_id: str

class Point(BaseModel):
    x: int
    y: int
    label: Optional[str] = None
    
class Measurement(BaseModel):
    label: str
    value: str
    unit: Optional[str] = None

class AnalysisDetail(BaseModel):
    id: str
    patient_id: str
    timestamp: datetime
    ap_image_url: Optional[str] = None
    lat_image_url: Optional[str] = None
    has_ap: bool
    has_lat: bool
    measurements: List[Measurement]
    summary: str
    status: str
    notes: Optional[str] = None
    
    class Config:
        orm_mode = True

class AnalysisSummary(BaseModel):
    id: str
    patient_id: str
    timestamp: datetime
    thumbnail_url: Optional[str] = None
    summary: str
    status: str
    
    class Config:
        orm_mode = True

# Patient schemas
class PatientBase(BaseModel):
    medical_record_number: str
    name: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: str
    
    class Config:
        orm_mode = True
