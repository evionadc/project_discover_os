from pydantic import BaseModel
from uuid import UUID
from typing import Optional


class FeatureCreate(BaseModel):
    mvp_id: UUID
    title: str
    description: Optional[str]
    business_value: Optional[str]


class StoryCreate(BaseModel):
    feature_id: UUID
    title: str
    description: Optional[str]
    acceptance_criteria: Optional[str]
    estimate: Optional[int]
    