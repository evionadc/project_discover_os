# app/modules/workspace/router.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.modules.workspace.models import Workspace

router = APIRouter(prefix="/workspaces", tags=["workspaces"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_workspace(name: str, owner_id: int, db: Session = Depends(get_db)):
    ws = Workspace(name=name, owner_id=owner_id)
    db.add(ws)
    db.commit()
    db.refresh(ws)
    return ws

