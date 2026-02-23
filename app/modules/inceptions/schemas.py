from pydantic import BaseModel
from typing import Any, Optional
from uuid import UUID


class InceptionCreate(BaseModel):
    workspace_id: int
    type: str
    title: str
    description: Optional[str] = None


class InceptionResponse(InceptionCreate):
    id: UUID
    status: str

    class Config:
        from_attributes = True


class InceptionStepUpsert(BaseModel):
    payload: dict[str, Any]


class InceptionStepResponse(BaseModel):
    id: UUID
    inception_id: UUID
    step_key: str
    payload: dict[str, Any]

    class Config:
        from_attributes = True


class InceptionDetailResponse(InceptionResponse):
    steps: list[InceptionStepResponse] = []


class InceptionPublishProductRequest(BaseModel):
    name: str | None = None


class InceptionPublishProductResponse(BaseModel):
    product_id: int
    workspace_id: int
    name: str
    blueprint_id: int
