from sqlalchemy import Column, String, Text, ForeignKey, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base


class FeatureStatus(str, enum.Enum):
    todo = "todo"
    doing = "doing"
    done = "done"


class StoryStatus(str, enum.Enum):
    todo = "todo"
    doing = "doing"
    done = "done"


class FeatureComplexity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Feature(Base):
    __tablename__ = "features"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(Integer, ForeignKey("workspace_products.id"), nullable=True, index=True)
    persona_id = Column(UUID(as_uuid=True), ForeignKey("personas.id"), nullable=True)
    journey_id = Column(UUID(as_uuid=True), ForeignKey("user_journeys.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    complexity = Column(Enum(FeatureComplexity), nullable=False, default=FeatureComplexity.medium)
    business_estimate = Column(Integer, nullable=True)
    effort_estimate = Column(Integer, nullable=True)
    ux_estimate = Column(Integer, nullable=True)
    status = Column(Enum(FeatureStatus), default=FeatureStatus.todo)

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
