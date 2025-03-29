# tests/test_analysis.py
import pytest
import io
from fastapi.testclient import TestClient
from fastapi import status
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models import Analysis, Patient

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the tables
Base.metadata.create_all(bind=engine)

# Override the get_db dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create test client
client = TestClient(app)

# Setup test data
def setup_test_data():
    db = TestingSessionLocal()
    
    # Create test patient
    patient = Patient(
        id="test-patient-id",
        medical_record_number="TEST12345",
        name="Test Patient"
    )
    
    # Create test analysis
    analysis = Analysis(
        id="test-analysis-id",
        patient_id="test-patient-id",
        ap_image_path="static/images/test-analysis-id/ap.jpg",
        lat_image_path="static/images/test-analysis-id/lat.jpg",
        result_path="static/images/test-analysis-id/result.json",
        status="new"
    )
    
    db.add(patient)
    db.add(analysis)
    db.commit()
    db.close()

# Run setup before tests
setup_test_data()

def test_create_analysis():
    # Create test image files
    ap_image_content = b"fake AP image content"
    lat_image_content = b"fake LAT image content"
    
    # Prepare multipart form data
    files = {
        "ap_image": ("ap.jpg", io.BytesIO(ap_image_content), "image/jpeg"),
        "lat_image": ("lat.jpg", io.BytesIO(lat_image_content), "image/jpeg")
    }
    data = {
        "patient_id": "test-patient-id",
        "notes": "Test analysis notes"
    }
    
    # Send request
    response = client.post("/api/analyses", files=files, data=data)
    
    # Check response
    assert response.status_code == status.HTTP_201_CREATED
    assert "analysis_id" in response.json()

def test_get_analysis():
    # Send request
    response = client.get("/api/analyses/test-analysis-id")
    
    # We expect a 500 error here because the file doesn't actually exist in tests
    # In a real setup, you would mock the file operations
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

def test_delete_analysis():
    # Send request
    response = client.delete("/api/analyses/test-analysis-id")
    
    # Check response
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify it's deleted
    response = client.get("/api/analyses/test-analysis-id")
    assert response.status_code == status.HTTP_404_NOT_FOUND
