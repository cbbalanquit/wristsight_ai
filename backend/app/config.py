import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME = "WristSight AI"

    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./wristsight.db")

    IMAGES_DIR = "static/images"
    RESULTS_DIR = "static/results"

    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    
    # Use mock analysis (for development without AI model)
    USE_MOCK = os.getenv("USE_MOCK", "True").lower() == "true"

settings = Settings()
