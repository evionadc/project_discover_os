from sqlalchemy import Column, String, Text, ForeignKey, Enum, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base


class ProblemStatus(str, enum.Enum):
    open = "open"
    validated = "validated"
    discarded = "discarded"


class Problem(Base):
    __tablename__ = "problems"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum(ProblemStatus), default=ProblemStatus.open)

    personas = relationship("Persona", back_populates="problem")


class Persona(Base):
    __tablename__ = "personas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id"))
    name = Column(String(100), nullable=False)
    context = Column(Text)
    goal = Column(Text)
    main_pain = Column(Text)

    problem = relationship("Problem", back_populates="personas")
    journeys = relationship("UserJourney", back_populates="persona", cascade="all, delete-orphan")


class UserJourney(Base):
    __tablename__ = "user_journeys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    persona_id = Column(UUID(as_uuid=True), ForeignKey("personas.id"), nullable=False)
    name = Column(String(255), nullable=False)
    stages = Column(JSON, nullable=False, default=list)

    persona = relationship("Persona", back_populates="journeys")


class ProductOKR(Base):
    __tablename__ = "product_okrs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(Integer, ForeignKey("workspace_products.id"), nullable=False)
    objective = Column(Text, nullable=False)
    key_results = Column(JSON, nullable=False, default=list)
