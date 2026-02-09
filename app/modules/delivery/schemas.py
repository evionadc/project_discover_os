from pydantic import BaseModel
from uuid import UUID
from typing import Optional


class FeatureCreate(BaseModel):
    hypothesis_id: Optional[UUID]
    mvp_id: Optional[UUID]
    title: str
    description: Optional[str]
    business_value: Optional[str]


class FeatureResponse(FeatureCreate):
    id: UUID
    status: str

    class Config:
        from_attributes = True


class StoryCreate(BaseModel):
    feature_id: Optional[UUID]
    workspace_id: Optional[int]
    title: str
    description: Optional[str]
    acceptance_criteria: Optional[str]
    estimate: Optional[int]


class StoryResponse(StoryCreate):
    id: UUID
    status: str

    class Config:
        from_attributes = True
    
