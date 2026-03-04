from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from src.core.database import get_db
from . import schemas, service, security, dependencies, models

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_internal_user(
    user: schemas.UserCreate, 
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(dependencies.require_role([models.UserRole.ADMIN]))
):
    if user.role == models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Operation denied: An administrator cannot create other administrators."
        )

    db_user = service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return service.create_user(db=db, user=user)

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/change-password")
def change_first_password(
    request: schemas.PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_active_user)
):
    if not current_user.must_change_password:
        raise HTTPException(status_code=400, detail="User does not require a password change")
    
    current_user.hashed_password = security.get_password_hash(request.new_password)
    current_user.must_change_password = False 
    
    db.commit()
    return {"message": "Password updated successfully"}

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(dependencies.get_current_active_user)):
    return current_user

