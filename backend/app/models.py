from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base

class Analysis(Base):
    """Analysis record model"""
    __tablename__ = "analyses"
    
    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, index=True)
    ap_image_path = Column(String, nullable=True)
    lat_image_path = Column(String, nullable=True)
    result_path = Column(String)
    timestamp = Column(DateTime, default=func.now(), index=True)
    notes = Column(Text, nullable=True)
    status = Column(String, default="new")  # "new", "reviewed", "finalized"
    
    
class Patient(Base):
    """Patient record model (basic implementation)"""
    __tablename__ = "patients"
    
    id = Column(String, primary_key=True, index=True)
    medical_record_number = Column(String, unique=True, index=True)
    name = Column(String, nullable=True)
