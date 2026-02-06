# app/modules/workspace/models.py
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Workspace(Base):
    __tablename__ = "workspaces"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
