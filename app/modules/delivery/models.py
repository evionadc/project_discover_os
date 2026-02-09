from sqlalchemy import Column, String, Text, ForeignKey, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base


class FeatureStatus(str, enum.Enum):
    draft = "draft"
    ready = "ready"
    in_progress = "in_progress"
    done = "done"


class StoryStatus(str, enum.Enum):
    todo = "todo"
    doing = "doing"
    done = "done"


class Feature(Base):
    __tablename__ = "features"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hypothesis_id = Column(UUID(as_uuid=True), ForeignKey("hypotheses.id"), nullable=True)
    mvp_id = Column(UUID(as_uuid=True), ForeignKey("mvps.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    business_value = Column(String(255))
    status = Column(Enum(FeatureStatus), default=FeatureStatus.draft)

    stories = relationship("Story", back_populates="feature")


class Story(Base):
    __tablename__ = "stories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    feature_id = Column(UUID(as_uuid=True), ForeignKey("features.id"), nullable=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    acceptance_criteria = Column(Text)
    estimate = Column(Integer)
    status = Column(Enum(StoryStatus), default=StoryStatus.todo)

    feature = relationship("Feature", back_populates="stories")
