# routers/auth.py
from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import schemas, models
from app.models import UserRole
from app import auth_utils

router = APIRouter(
    prefix="/auth",
    tags=['Authentication']
)

@router.post("/register", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if email exists
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                            detail="Email already registered")
    
    # Check if username exists
    existing_username = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                            detail="Username already taken")
    
    # Hash the password
    hashed_password = auth_utils.hash_password(user.password)
    
    # Create the user (default role is NORMAL)
    new_user = models.User(
        email=user.email,
        username=user.username,
        password=hashed_password,
        role=UserRole.NORMAL
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm returns username field (can be email or username)
    # Find user by either email or username
    user = db.query(models.User).filter(
        (models.User.email == user_credentials.username) | 
        (models.User.username == user_credentials.username)
    ).first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                            detail="Invalid credentials")
    
    if not auth_utils.verify_password(user_credentials.password, user.password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                            detail="Invalid credentials")
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                           detail="Account is disabled")
    
    # Create a token
    access_token = auth_utils.create_access_token(data={"user_id": user.id})
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserOut)
def get_current_user(current_user: models.User = Depends(auth_utils.get_current_user)):
    return current_user

# Admin-only endpoint to update user roles
@router.patch("/users/{user_id}/role", response_model=schemas.UserOut)
def update_user_role(
    user_id: int, 
    role_update: schemas.UserRoleUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.is_admin)  # Using the is_admin dependency
):
    # Get user to update
    user_query = db.query(models.User).filter(models.User.id == user_id)
    user = user_query.first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    
    # Update user role
    user_query.update({"role": role_update.role}, synchronize_session=False)
    db.commit()
    db.refresh(user)
    
    return user

# Admin/Superuser endpoint to get all users
@router.get("/users", response_model=List[schemas.UserOut])
def get_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.is_admin_or_superuser),  # Using combined role check
    skip: int = 0,
    limit: int = 100
):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users