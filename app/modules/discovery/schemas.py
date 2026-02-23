from pydantic import BaseModel, Field
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


class ProblemUpdate(BaseModel):
    workspace_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


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


class PersonaUpdate(BaseModel):
    problem_id: Optional[UUID] = None
    name: Optional[str] = None
    context: Optional[str] = None
    goal: Optional[str] = None
    main_pain: Optional[str] = None


class UserJourneyCreate(BaseModel):
    persona_id: UUID
    name: str
    stages: list[str] = Field(default_factory=list)


class UserJourneyUpdate(BaseModel):
    persona_id: Optional[UUID] = None
    name: Optional[str] = None
    stages: Optional[list[str]] = None


class UserJourneyResponse(UserJourneyCreate):
    id: UUID

    class Config:
        from_attributes = True


class ProductOKRCreate(BaseModel):
    product_id: int
    objective: str
    key_results: list[str] = Field(default_factory=list)


class ProductOKRUpdate(BaseModel):
    product_id: Optional[int] = None
    objective: Optional[str] = None
    key_results: Optional[list[str]] = None


class ProductOKRResponse(ProductOKRCreate):
    id: UUID

    class Config:
        from_attributes = True
