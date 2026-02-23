# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.modules.auth.router import router as auth_router
from app.modules.workspace.router import router as workspace_router
from app.modules.discovery.routes import router as discovery_router
from app.modules.delivery.routes import router as delivery_router
from app.modules.inceptions.routes import router as inceptions_router
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User







app = FastAPI(title="Product OS")

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "https://project-discover-os.vercel.app",
    "https://project-discover-os.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*(vercel\.app|onrender\.com)$|http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(workspace_router)
app.include_router(discovery_router)
app.include_router(delivery_router)
app.include_router(inceptions_router)


@app.on_event("startup")
def ensure_admin_user():
    """Create default admin user when ADMIN_EMAIL/ADMIN_PASSWORD are provided."""
    if not settings.admin_email or not settings.admin_password:
        return
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == settings.admin_email).first()
        if not user:
            db.add(
                User(
                    email=settings.admin_email,
                    password_hash=hash_password(settings.admin_password),
                )
            )
            db.commit()
    finally:
        db.close()

@app.get("/health")
def health():
    return {"status": "ok"}
