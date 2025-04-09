import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME = "WristSight AI"

    # Generate with: python -c "import secrets; print(secrets.token_hex(32))"
    SECRET_KEY: str = "05d77b26ca61e0325100847ad13c748b49e8fa83ab1f5ef47337dcd241cb75ac" 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./wristsight.db")

    IMAGES_DIR = "static/images"
    RESULTS_DIR = "static/results"

    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    
    # Use mock analysis (for development without AI model)
    USE_MOCK = os.getenv("USE_MOCK", "True").lower() == "true"

settings = Settings()
