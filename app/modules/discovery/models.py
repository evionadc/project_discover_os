from sqlalchemy import Column, String, Text, ForeignKey, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base


class ProblemStatus(str, enum.Enum):
    open = "open"
    validated = "validated"
    discarded = "discarded"


class HypothesisStatus(str, enum.Enum):
    testing = "testing"
    validated = "validated"
    invalidated = "invalidated"


class MVPStatus(str, enum.Enum):
    defined = "defined"
    building = "building"
    delivered = "delivered"


class Problem(Base):
    __tablename__ = "problems"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum(ProblemStatus), default=ProblemStatus.open)

    personas = relationship("Persona", back_populates="problem")
    hypotheses = relationship("Hypothesis", back_populates="problem")


class Persona(Base):
    __tablename__ = "personas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id"))
    name = Column(String(100), nullable=False)
    context = Column(Text)
    goal = Column(Text)
    main_pain = Column(Text)

    problem = relationship("Problem", back_populates="personas")


class Hypothesis(Base):
    __tablename__ = "hypotheses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id"))
    statement = Column(Text, nullable=False)
    metric = Column(String(255))
    success_criteria = Column(String(255))
    status = Column(Enum(HypothesisStatus), default=HypothesisStatus.testing)

    problem = relationship("Problem", back_populates="hypotheses")
    mvp = relationship("MVP", back_populates="hypothesis", uselist=False)


class MVP(Base):
    __tablename__ = "mvps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hypothesis_id = Column(UUID(as_uuid=True), ForeignKey("hypotheses.id"))
    description = Column(Text)
    scope = Column(Text)
    status = Column(Enum(MVPStatus), default=MVPStatus.defined)

    hypothesis = relationship("Hypothesis", back_populates="mvp")
