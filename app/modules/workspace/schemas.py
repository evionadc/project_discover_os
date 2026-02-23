from datetime import datetime
from pydantic import BaseModel


class WorkspaceCreate(BaseModel):
    name: str
    owner_id: int
    member_ids: list[int] = []


class WorkspaceResponse(BaseModel):
    id: int
    name: str
    owner_id: int

    class Config:
        from_attributes = True


class WorkspaceMemberAdd(BaseModel):
    user_id: int


class WorkspaceMemberResponse(BaseModel):
    workspace_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class WorkspaceProductCreate(BaseModel):
    name: str
    description: str | None = None
    status: str = "active"


class WorkspaceProductResponse(BaseModel):
    id: int
    workspace_id: int
    name: str
    description: str | None = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class WorkspaceProductDetailResponse(WorkspaceProductResponse):
    vision: str | None = None
    boundaries: dict | None = None


class WorkspaceProductUpdate(BaseModel):
    name: str | None = None
    vision: str | None = None
    boundaries: dict | None = None
