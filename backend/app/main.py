from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.routers import analysis, history
from app.config import settings
from app.database import engine
from app import models

models.Base.metadata.create_all(bind=engine)

os.makedirs("static/images", exist_ok=True)
os.makedirs("static/results", exist_ok=True)

app = FastAPI(
    title="WristSight AI",
    description="API for X-ray analysis",
    version="1.0.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production you should specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(analysis.router, prefix="/api", tags=["analysis"])
app.include_router(history.router, prefix="/api", tags=["history"])

@app.get("/", tags=["root"])
async def root():
    """Root endpoint for API health check"""
    return {"message": "Welcome to WristSight AI API"}
