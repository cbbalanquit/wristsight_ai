# auth_utils.py
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import Depends, status, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app import schemas, models
from app.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 setup for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def hash_password(password: str):
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    """Create a JWT access token with expiration time"""
    to_encode = data.copy()
    
    # Set token expiration time
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # Encode the JWT
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt

def verify_access_token(token: str, credentials_exception):
    """Verify a JWT access token"""
    try:
        # Decode the token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        # Extract user ID from token
        id: int = payload.get("user_id")
        
        if id is None:
            raise credentials_exception
        
        token_data = schemas.TokenData(id=id)
    except JWTError:
        raise credentials_exception
    
    return token_data

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get the current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verify token
    token_data = verify_access_token(token, credentials_exception)
    
    # Get user from database
    user = db.query(models.User).filter(models.User.id == token_data.id).first()
    
    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )
    
    return user

# Role-based authorization functions
def is_admin(current_user: models.User = Depends(get_current_user)):
    """Check if current user is an admin"""
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

def is_admin_or_superuser(current_user: models.User = Depends(get_current_user)):
    """Check if current user is an admin or superuser"""
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.SUPERUSER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or superuser privileges required"
        )
    return current_user

def can_access_analysis(analysis_id: int, db: Session, current_user: models.User):
    """Check if user can access a specific analysis"""
    # Get the analysis
    analysis = db.query(models.Analysis).filter(models.Analysis.id == analysis_id).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis with id {analysis_id} not found"
        )
    
    # Admins and superusers can access any analysis
    if current_user.role in [models.UserRole.ADMIN, models.UserRole.SUPERUSER]:
        return analysis
    
    # Normal users can only access their own analyses
    if analysis.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this analysis"
        )
    
    return analysis
