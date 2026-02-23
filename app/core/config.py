import os
from dataclasses import dataclass

try:
    from dotenv import load_dotenv
except Exception:  # pragma: no cover - optional dependency at runtime
    def load_dotenv(*args, **kwargs):
        return None

# Only load .env when DATABASE_URL is not already provided by the environment
if "DATABASE_URL" not in os.environ:
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
