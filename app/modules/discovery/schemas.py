from pydantic import BaseModel
from uuid import UUID
from typing import Optional


class ProblemCreate(BaseModel):
    workspace_id: int
    title: str
    description: Optional[str]


class ProblemResponse(ProblemCreate):
    id: UUID
    status: str

    class Config:
        from_attributes = True


class PersonaCreate(BaseModel):
    problem_id: UUID
    name: str
    context: Optional[str]
    goal: Optional[str]
    main_pain: Optional[str]


class PersonaResponse(PersonaCreate):
    id: UUID

    class Config:
        from_attributes = True


class HypothesisCreate(BaseModel):
    problem_id: UUID
    statement: str
    metric: Optional[str]
    success_criteria: Optional[str]


class HypothesisResponse(HypothesisCreate):
    id: UUID
    status: str

    class Config:
        from_attributes = True


class MVPCreate(BaseModel):
    hypothesis_id: UUID
    description: Optional[str]
    scope: Optional[str]


class MVPResponse(MVPCreate):
    id: UUID
    status: str

    class Config:
        from_attributes = True
