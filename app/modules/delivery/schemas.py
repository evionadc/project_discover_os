from pydantic import BaseModel
from uuid import UUID
from typing import Optional


class FeatureCreate(BaseModel):
    product_id: int
    persona_id: Optional[UUID] = None
    journey_id: Optional[UUID] = None
    title: str
    description: Optional[str]
    complexity: str
    business_estimate: Optional[int]
    effort_estimate: Optional[int]
    ux_estimate: Optional[int]
    status: Optional[str] = "todo"


class FeatureResponse(FeatureCreate):
    product_id: int | None = None
    id: UUID

    class Config:
        from_attributes = True


class FeatureUpdate(BaseModel):
    persona_id: Optional[UUID] = None
    journey_id: Optional[UUID] = None
    title: Optional[str] = None
    description: Optional[str] = None
    complexity: Optional[str] = None
    business_estimate: Optional[int] = None
    effort_estimate: Optional[int] = None
    ux_estimate: Optional[int] = None
    status: Optional[str] = None


class FeatureImportFromInceptionRequest(BaseModel):
    product_id: int
    inception_id: Optional[UUID] = None
    overwrite_existing: bool = False


class FeatureImportFromInceptionResponse(BaseModel):
    imported_count: int
    skipped_count: int


class StoryCreate(BaseModel):
    feature_id: Optional[UUID]
    workspace_id: Optional[int]
    title: str
    description: Optional[str]
    acceptance_criteria: Optional[str]
    estimate: Optional[int]
    status: Optional[str] = "todo"


class StoryResponse(StoryCreate):
    id: UUID
    status: str

    class Config:
        from_attributes = True


class StoryUpdate(BaseModel):
    feature_id: Optional[UUID] = None
    workspace_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    acceptance_criteria: Optional[str] = None
    estimate: Optional[int] = None
    status: Optional[str] = None
    
