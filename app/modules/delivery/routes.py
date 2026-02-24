from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.core.database import get_db
from app.modules.delivery import models, schemas
from app.modules.workspace.models import ProductBlueprint, Workspace, WorkspaceProduct
from app.modules.discovery.models import Persona, UserJourney
from app.modules.inceptions.models import InceptionStep

router = APIRouter(prefix="/delivery", tags=["Delivery"])


def _first_product_id(db: Session) -> int | None:
    product = db.query(WorkspaceProduct).order_by(WorkspaceProduct.id.asc()).first()
    return product.id if product else None


def _first_workspace_id(db: Session) -> int | None:
    workspace = db.query(Workspace).order_by(Workspace.id.asc()).first()
    return workspace.id if workspace else None


def _validate_feature_links(
    db: Session,
    persona_id,
    journey_id,
):
    journey = None
    if journey_id is not None:
        journey = db.query(UserJourney).filter(UserJourney.id == journey_id).first()
        if not journey:
            raise HTTPException(status_code=404, detail="Journey not found")
    if persona_id is not None:
        persona = db.query(Persona).filter(Persona.id == persona_id).first()
        if not persona:
            raise HTTPException(status_code=404, detail="Persona not found")
        if journey and journey.persona_id != persona.id:
            raise HTTPException(status_code=400, detail="Journey does not belong to selected persona")


@router.get("/features", response_model=list[schemas.FeatureResponse])
def list_features(product_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(models.Feature)
    if product_id is not None:
        query = query.filter(models.Feature.product_id == product_id)
    return query.all()


@router.post("/features", response_model=schemas.FeatureResponse)
def create_feature(data: schemas.FeatureCreate, db: Session = Depends(get_db)):
    if data.complexity not in {"low", "medium", "high"}:
        raise HTTPException(status_code=400, detail="Invalid complexity. Use low, medium, or high.")
    if data.status not in {"todo", "doing", "done"}:
        raise HTTPException(status_code=400, detail="Invalid status. Use todo, doing, or done.")
    product_id = data.product_id
    if not db.query(WorkspaceProduct).filter(WorkspaceProduct.id == data.product_id).first():
        fallback_product_id = _first_product_id(db)
        if fallback_product_id is None:
            raise HTTPException(status_code=400, detail="No product found. Create a product first.")
        product_id = fallback_product_id
    _validate_feature_links(db, data.persona_id, data.journey_id)
    payload = data.model_dump()
    payload["product_id"] = product_id
    feature = models.Feature(**payload)
    db.add(feature)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid feature payload")
    db.refresh(feature)
    return feature


@router.put("/features/{feature_id}", response_model=schemas.FeatureResponse)
def update_feature(feature_id: str, data: schemas.FeatureUpdate, db: Session = Depends(get_db)):
    feature = db.query(models.Feature).filter(models.Feature.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")

    payload = data.model_dump(exclude_unset=True)
    complexity = payload.get("complexity")
    status = payload.get("status")
    persona_id = payload.get("persona_id", feature.persona_id)
    journey_id = payload.get("journey_id", feature.journey_id)

    if complexity is not None and complexity not in {"low", "medium", "high"}:
        raise HTTPException(status_code=400, detail="Invalid complexity. Use low, medium, or high.")
    if status is not None and status not in {"todo", "doing", "done"}:
        raise HTTPException(status_code=400, detail="Invalid status. Use todo, doing, or done.")

    _validate_feature_links(db, persona_id, journey_id)

    for field, value in payload.items():
        setattr(feature, field, value)

    db.commit()
    db.refresh(feature)
    return feature


@router.delete("/features/{feature_id}", status_code=204)
def delete_feature(feature_id: str, db: Session = Depends(get_db)):
    feature = db.query(models.Feature).filter(models.Feature.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    has_story = db.query(models.Story).filter(models.Story.feature_id == feature.id).first()
    if has_story:
        raise HTTPException(status_code=400, detail="Cannot delete feature with linked stories")
    db.delete(feature)
    db.commit()
    return None


def _complexity_from_confidence(what: str, how: str) -> str:
    if what == "high" and how == "high":
        return "low"
    if (what == "medium" and how == "high") or (what == "high" and how == "medium"):
        return "medium"
    return "high"


def _parse_estimate(value: object) -> int | None:
    if value in (None, ""):
        return None
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return None
    if parsed < 1 or parsed > 3:
        return None
    return parsed


@router.post("/features/import-from-inception", response_model=schemas.FeatureImportFromInceptionResponse)
def import_features_from_inception(
    data: schemas.FeatureImportFromInceptionRequest,
    db: Session = Depends(get_db),
):
    product_id = data.product_id
    if not db.query(WorkspaceProduct).filter(WorkspaceProduct.id == product_id).first():
        fallback_product_id = _first_product_id(db)
        if fallback_product_id is None:
            raise HTTPException(status_code=400, detail="No product found. Create a product first.")
        product_id = fallback_product_id

    snapshot_features: list[dict] = []
    if data.inception_id is not None:
        step = (
            db.query(InceptionStep)
            .filter(
                InceptionStep.inception_id == data.inception_id,
                InceptionStep.step_key == "feature_review",
            )
            .first()
        )
        if not step:
            raise HTTPException(status_code=404, detail="Lean Inception step feature_review not found")
        payload = step.payload or {}
        snapshot_features = payload.get("features") or []
    else:
        blueprint = db.query(ProductBlueprint).filter(ProductBlueprint.product_id == product_id).first()
        if not blueprint:
            raise HTTPException(status_code=404, detail="Product blueprint not found")
        snapshot_features = blueprint.features or []

    if not snapshot_features:
        return schemas.FeatureImportFromInceptionResponse(imported_count=0, skipped_count=0)

    if data.overwrite_existing:
        db.query(models.Feature).filter(models.Feature.product_id == product_id).delete()
        db.flush()

    imported_count = 0
    skipped_count = 0
    for item in snapshot_features:
        title = str(item.get("text") or "").strip()
        if not title:
            skipped_count += 1
            continue
        exists = (
            db.query(models.Feature)
            .filter(
                and_(
                    models.Feature.product_id == product_id,
                    models.Feature.title == title,
                )
            )
            .first()
        )
        if exists:
            skipped_count += 1
            continue

        what = str(item.get("what") or "medium").strip().lower()
        how = str(item.get("how") or "medium").strip().lower()
        complexity = _complexity_from_confidence(what, how)
        business_estimate = _parse_estimate(item.get("business"))
        effort_estimate = _parse_estimate(item.get("effort"))
        ux_estimate = _parse_estimate(item.get("ux"))

        feature = models.Feature(
            product_id=product_id,
            title=title,
            description=None,
            complexity=complexity,
            business_estimate=business_estimate,
            effort_estimate=effort_estimate,
            ux_estimate=ux_estimate,
            status=models.FeatureStatus.todo,
        )
        db.add(feature)
        imported_count += 1

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid feature import payload")
    return schemas.FeatureImportFromInceptionResponse(
        imported_count=imported_count,
        skipped_count=skipped_count,
    )


@router.get("/stories", response_model=list[schemas.StoryResponse])
def list_stories(db: Session = Depends(get_db)):
    return db.query(models.Story).all()


@router.post("/stories", response_model=schemas.StoryResponse)
def create_story(data: schemas.StoryCreate, db: Session = Depends(get_db)):
    if data.feature_id is None and data.workspace_id is None:
        raise HTTPException(status_code=400, detail="Story requires feature_id or workspace_id")
    payload = data.model_dump()
    if payload.get("feature_id") is not None:
        feature = db.query(models.Feature).filter(models.Feature.id == payload["feature_id"]).first()
        if not feature:
            raise HTTPException(status_code=400, detail="Feature not found for story")
        if payload.get("workspace_id") is None:
            product = db.query(WorkspaceProduct).filter(WorkspaceProduct.id == feature.product_id).first()
            if product:
                payload["workspace_id"] = product.workspace_id

    if payload.get("workspace_id") is not None:
        workspace = db.query(Workspace).filter(Workspace.id == payload["workspace_id"]).first()
        if not workspace:
            fallback_workspace_id = _first_workspace_id(db)
            if fallback_workspace_id is None:
                raise HTTPException(status_code=400, detail="No workspace found. Create a workspace first.")
            payload["workspace_id"] = fallback_workspace_id

    story = models.Story(**payload)
    db.add(story)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid story payload")
    db.refresh(story)
    return story


@router.put("/stories/{story_id}", response_model=schemas.StoryResponse)
def update_story(story_id: str, data: schemas.StoryUpdate, db: Session = Depends(get_db)):
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    payload = data.model_dump(exclude_unset=True)
    if "feature_id" in payload and payload["feature_id"] is None and payload.get("workspace_id") is None and story.workspace_id is None:
        raise HTTPException(status_code=400, detail="Story requires feature_id or workspace_id")
    if "feature_id" in payload and payload["feature_id"] is not None:
        feature = db.query(models.Feature).filter(models.Feature.id == payload["feature_id"]).first()
        if not feature:
            raise HTTPException(status_code=400, detail="Feature not found for story")
    if "workspace_id" in payload and payload["workspace_id"] is not None:
        workspace = db.query(Workspace).filter(Workspace.id == payload["workspace_id"]).first()
        if not workspace:
            fallback_workspace_id = _first_workspace_id(db)
            if fallback_workspace_id is None:
                raise HTTPException(status_code=400, detail="No workspace found. Create a workspace first.")
            payload["workspace_id"] = fallback_workspace_id

    for field, value in payload.items():
        setattr(story, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid story payload")
    db.refresh(story)
    return story


@router.delete("/stories/{story_id}", status_code=204)
def delete_story(story_id: str, db: Session = Depends(get_db)):
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    db.delete(story)
    db.commit()
    return None
