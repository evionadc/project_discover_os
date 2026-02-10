from sqlalchemy import Column, String, Text, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Inception(Base):
    __tablename__ = "inceptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(ForeignKey("workspaces.id"), nullable=False)
    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(String(50), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    steps = relationship("InceptionStep", back_populates="inception", cascade="all, delete-orphan")


class InceptionStep(Base):
    __tablename__ = "inception_steps"
    __table_args__ = (
        UniqueConstraint("inception_id", "step_key", name="uq_inception_step_key"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inception_id = Column(UUID(as_uuid=True), ForeignKey("inceptions.id"), nullable=False)
    step_key = Column(String(100), nullable=False)
    payload = Column(JSONB, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    inception = relationship("Inception", back_populates="steps")
