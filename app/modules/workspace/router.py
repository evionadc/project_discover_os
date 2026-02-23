# app/modules/workspace/router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.inceptions.models import InceptionStep
from app.modules.workspace.models import ProductBlueprint, Workspace, WorkspaceMember, WorkspaceProduct
from app.modules.workspace.schemas import (
    WorkspaceCreate,
    WorkspaceMemberAdd,
    WorkspaceMemberResponse,
    WorkspaceProductCreate,
    WorkspaceProductDetailResponse,
    WorkspaceProductResponse,
    WorkspaceProductUpdate,
    WorkspaceResponse,
)

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.post("", response_model=WorkspaceResponse)
def create_workspace(data: WorkspaceCreate, db: Session = Depends(get_db)):
    workspace = Workspace(name=data.name, owner_id=data.owner_id)
    db.add(workspace)
    db.commit()
    db.refresh(workspace)

    member_ids = set(data.member_ids)
    member_ids.add(data.owner_id)
    for user_id in member_ids:
        db.add(WorkspaceMember(workspace_id=workspace.id, user_id=user_id))
    db.commit()
    db.refresh(workspace)
    return workspace


@router.get("", response_model=list[WorkspaceResponse])
def list_workspaces(user_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Workspace)
    if user_id is not None:
        query = query.outerjoin(
            WorkspaceMember,
            WorkspaceMember.workspace_id == Workspace.id,
        ).filter(
            or_(
                Workspace.owner_id == user_id,
                WorkspaceMember.user_id == user_id,
            )
        )
    return query.order_by(Workspace.id.asc()).all()


@router.post("/{workspace_id}/members", response_model=WorkspaceMemberResponse)
def add_member(workspace_id: int, data: WorkspaceMemberAdd, db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    existing = (
        db.query(WorkspaceMember)
        .filter(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == data.user_id,
        )
        .first()
    )
    if existing:
        return existing

    member = WorkspaceMember(workspace_id=workspace_id, user_id=data.user_id)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.get("/{workspace_id}/members", response_model=list[WorkspaceMemberResponse])
def list_members(workspace_id: int, db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return (
        db.query(WorkspaceMember)
        .filter(WorkspaceMember.workspace_id == workspace_id)
        .order_by(WorkspaceMember.user_id.asc())
        .all()
    )


@router.post("/{workspace_id}/products", response_model=WorkspaceProductResponse)
def create_product(workspace_id: int, data: WorkspaceProductCreate, db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    product = WorkspaceProduct(
        workspace_id=workspace_id,
        name=data.name,
        description=data.description,
        status=data.status,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/{workspace_id}/products", response_model=list[WorkspaceProductResponse])
def list_products(workspace_id: int, db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return (
        db.query(WorkspaceProduct)
        .filter(WorkspaceProduct.workspace_id == workspace_id)
        .order_by(WorkspaceProduct.id.asc())
        .all()
    )


@router.get("/{workspace_id}/products/{product_id}", response_model=WorkspaceProductDetailResponse)
def get_product(workspace_id: int, product_id: int, db: Session = Depends(get_db)):
    product = (
        db.query(WorkspaceProduct)
        .filter(
            WorkspaceProduct.workspace_id == workspace_id,
            WorkspaceProduct.id == product_id,
        )
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    blueprint = (
        db.query(ProductBlueprint)
        .filter(ProductBlueprint.product_id == product.id)
        .first()
    )
    vision = blueprint.vision if blueprint and blueprint.vision else product.description
    boundaries = blueprint.boundaries if blueprint else None

    # Backward compatibility:
    # products published before boundaries support may have source inception
    # but boundaries still null in blueprint. Recover from inception step.
    if (
        blueprint
        and not boundaries
        and blueprint.source_inception_id is not None
    ):
        boundaries_step = (
            db.query(InceptionStep)
            .filter(
                InceptionStep.inception_id == blueprint.source_inception_id,
                InceptionStep.step_key == "boundaries",
            )
            .first()
        )
        if boundaries_step and boundaries_step.payload:
            recovered = {
                "is": boundaries_step.payload.get("is") or [],
                "is_not": boundaries_step.payload.get("is_not") or [],
                "does": boundaries_step.payload.get("does") or [],
                "does_not": boundaries_step.payload.get("does_not") or [],
            }
            blueprint.boundaries = recovered
            db.commit()
            boundaries = recovered

    return WorkspaceProductDetailResponse(
        id=product.id,
        workspace_id=product.workspace_id,
        name=product.name,
        description=product.description,
        status=product.status,
        created_at=product.created_at,
        vision=vision,
        boundaries=boundaries,
    )


@router.put("/{workspace_id}/products/{product_id}", response_model=WorkspaceProductDetailResponse)
def update_product(workspace_id: int, product_id: int, data: WorkspaceProductUpdate, db: Session = Depends(get_db)):
    product = (
        db.query(WorkspaceProduct)
        .filter(
            WorkspaceProduct.workspace_id == workspace_id,
            WorkspaceProduct.id == product_id,
        )
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if data.name is not None:
        name = data.name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="Product name cannot be empty")
        product.name = name

    if data.vision is not None:
        product.description = data.vision
        blueprint = (
            db.query(ProductBlueprint)
            .filter(ProductBlueprint.product_id == product.id)
            .first()
        )
        if blueprint:
            blueprint.vision = data.vision
        else:
            blueprint = ProductBlueprint(
                product_id=product.id,
                vision=data.vision,
                source_inception_id=None,
            )
            db.add(blueprint)

    if data.boundaries is not None:
        blueprint = (
            db.query(ProductBlueprint)
            .filter(ProductBlueprint.product_id == product.id)
            .first()
        )
        if blueprint:
            blueprint.boundaries = data.boundaries
        else:
            blueprint = ProductBlueprint(
                product_id=product.id,
                boundaries=data.boundaries,
                source_inception_id=None,
            )
            db.add(blueprint)

    db.commit()
    db.refresh(product)
    return get_product(workspace_id, product_id, db)
