# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.modules.auth.router import router as auth_router
from app.modules.workspace.router import router as workspace_router
from app.modules.discovery.routes import router as discovery_router
from app.modules.delivery.routes import router as delivery_router
from app.modules.inceptions.routes import router as inceptions_router
from app.modules.workspace.models import Workspace, WorkspaceMember
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
    """Ensure at least one user/workspace pair exists for discovery records."""
    db = SessionLocal()
    try:
        user = None
        if settings.admin_email:
            user = db.query(User).filter(User.email == settings.admin_email).first()

        if not user and settings.admin_email and settings.admin_password:
            user = User(
                email=settings.admin_email,
                password_hash=hash_password(settings.admin_password),
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        if not user:
            user = db.query(User).order_by(User.id.asc()).first()
        if not user:
            return

        workspace = db.query(Workspace).order_by(Workspace.id.asc()).first()
        if not workspace:
            workspace = Workspace(name="Default", owner_id=user.id)
            db.add(workspace)
            db.commit()
            db.refresh(workspace)

        member = (
            db.query(WorkspaceMember)
            .filter(
                WorkspaceMember.workspace_id == workspace.id,
                WorkspaceMember.user_id == user.id,
            )
            .first()
        )
        if not member:
            db.add(WorkspaceMember(workspace_id=workspace.id, user_id=user.id))
            db.commit()
    finally:
        db.close()

@app.get("/health")
def health():
    return {"status": "ok"}
