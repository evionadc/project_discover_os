# app/core/config.py
from dataclasses import dataclass
import os

try:
    from dotenv import load_dotenv
except Exception:  # pragma: no cover - optional dependency at runtime
    def load_dotenv() -> None:
        return None


load_dotenv()


@dataclass(frozen=True)
class Settings:
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    secret_key: str = os.getenv("SECRET_KEY", "change-me")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    )


settings = Settings()
