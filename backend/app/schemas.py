from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# Define enum for role validation in Pydantic models
class UserRole(str, Enum):
    ADMIN = "ADMIN"
    SUPERUSER = "SUPERUSER"
    NORMAL = "NORMAL"

# User schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    # By default, new users will be normal users

class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str
    role: UserRole
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email_or_username: str
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    is_active: Optional[bool] = None

class UserRoleUpdate(BaseModel):
    role: UserRole

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[int] = None

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
    user_id: int
    
    class Config:
        orm_mode = True

class AnalysisSummary(BaseModel):
    id: str
    patient_id: str
    timestamp: datetime
    image_urls: Optional[Dict] = None
    summary: str
    status: str
    user_id: int
    
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
