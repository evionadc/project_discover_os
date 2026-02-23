# app/core/security.py
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings
import hashlib

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _pre_hash_password(password: str) -> str:
    """
    Aplica SHA-256 para normalizar o tamanho da senha
    antes de usar bcrypt.
    """
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def hash_password(password: str) -> str:
    pre_hashed = _pre_hash_password(password)
    return pwd_context.hash(pre_hashed)


def verify_password(password: str, hashed: str) -> bool:
    pre_hashed = _pre_hash_password(password)
    return pwd_context.verify(pre_hashed, hashed)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    to_encode.update({"exp": expire})
    return jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm
    )

