# app/modules/auth/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import verify_password, create_access_token, hash_password
from app.models.user import User
from app.modules.auth import schemas

router = APIRouter(prefix="/auth", tags=["auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=schemas.AuthResponse, status_code=status.HTTP_201_CREATED)
def register(data: schemas.RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    if len(data.password.strip()) < 6:
        raise HTTPException(status_code=400, detail="Password must contain at least 6 characters")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email})
    return schemas.AuthResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
    )


@router.post("/login", response_model=schemas.AuthResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.email})
    return schemas.AuthResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
    )
