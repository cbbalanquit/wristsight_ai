from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.sql.expression import text
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.orm import relationship
import enum

from datetime import datetime

from .database import Base

# Define user roles as an enum
class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    SUPERUSER = "SUPERUSER"
    NORMAL = "NORMAL"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.NORMAL, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow, nullable=False)

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

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user = relationship("User")
    
class Patient(Base):
    """Patient record model (basic implementation)"""
    __tablename__ = "patients"
    
    id = Column(String, primary_key=True, index=True)
    medical_record_number = Column(String, unique=True, index=True)
    name = Column(String, nullable=True)
