from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

from app.core.database import get_db
from app.modules.inceptions import models, schemas
from app.modules.workspace.models import ProductBlueprint, WorkspaceProduct
from app.modules.discovery.models import Persona, ProductOKR, UserJourney

router = APIRouter(prefix="/inceptions", tags=["Inceptions"])


@router.get("", response_model=list[schemas.InceptionResponse])
def list_inceptions(type: str | None = None, include_archived: bool = False, db: Session = Depends(get_db)):
    query = db.query(models.Inception)
    if type:
        query = query.filter(models.Inception.type == type)
    if not include_archived:
        query = query.filter(models.Inception.status != "archived")
    return query.order_by(models.Inception.created_at.desc()).all()


@router.post("", response_model=schemas.InceptionResponse)
def create_inception(data: schemas.InceptionCreate, db: Session = Depends(get_db)):
    inception = models.Inception(**data.dict())
    db.add(inception)
    db.commit()
    db.refresh(inception)
    return inception


@router.get("/{inception_id}", response_model=schemas.InceptionDetailResponse)
def get_inception(inception_id: str, db: Session = Depends(get_db)):
    inception = db.query(models.Inception).filter(models.Inception.id == inception_id).first()
    if not inception:
        raise HTTPException(status_code=404, detail="Inception not found")
    return inception


@router.delete("/{inception_id}", status_code=204)
def delete_inception(inception_id: str, db: Session = Depends(get_db)):
    inception = db.query(models.Inception).filter(models.Inception.id == inception_id).first()
    if not inception:
        raise HTTPException(status_code=404, detail="Inception not found")
    db.delete(inception)
    db.commit()
    return None


@router.get("/{inception_id}/steps", response_model=list[schemas.InceptionStepResponse])
def list_steps(inception_id: str, db: Session = Depends(get_db)):
    return (
        db.query(models.InceptionStep)
        .filter(models.InceptionStep.inception_id == inception_id)
        .order_by(models.InceptionStep.step_key.asc())
        .all()
    )


@router.get("/{inception_id}/steps/{step_key}", response_model=schemas.InceptionStepResponse)
def get_step(inception_id: str, step_key: str, db: Session = Depends(get_db)):
    step = (
        db.query(models.InceptionStep)
        .filter(
            models.InceptionStep.inception_id == inception_id,
            models.InceptionStep.step_key == step_key,
        )
        .first()
    )
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")
    return step


@router.put("/{inception_id}/steps/{step_key}", response_model=schemas.InceptionStepResponse)
def upsert_step(
    inception_id: str,
    step_key: str,
    data: schemas.InceptionStepUpsert,
    db: Session = Depends(get_db),
):
    inception = db.query(models.Inception).filter(models.Inception.id == inception_id).first()
    if not inception:
        raise HTTPException(status_code=404, detail="Inception not found")
    if inception.status == "archived":
        raise HTTPException(status_code=409, detail="Archived inception cannot be edited")

    step = (
        db.query(models.InceptionStep)
        .filter(
            models.InceptionStep.inception_id == inception_id,
            models.InceptionStep.step_key == step_key,
        )
        .first()
    )
    if step:
        step.payload = data.payload
    else:
        step = models.InceptionStep(
            inception_id=inception_id,
            step_key=step_key,
            payload=data.payload,
        )
        db.add(step)
    db.commit()
    db.refresh(step)
    return step


def _build_product_vision_summary(product_vision: dict) -> str:
    target_audience = (product_vision.get("target_audience") or "").strip()
    product_name = (product_vision.get("product_name") or "").strip()
    problem_statement = (product_vision.get("problem_statement") or "").strip()
    product_category = (product_vision.get("product_category") or "").strip()
    key_benefit = (product_vision.get("key_benefit") or "").strip()
    alternatives = (product_vision.get("alternatives") or "").strip()
    differential = (product_vision.get("differential") or "").strip()

    base_parts: list[str] = []
    if target_audience:
        base_parts.append(f"Para {target_audience}")
    if product_name:
        base_parts.append(f"o {product_name}")
    if problem_statement:
        base_parts.append(f"resolve {problem_statement}")
    if product_category:
        base_parts.append(f"como {product_category}")
    if key_benefit:
        base_parts.append(f"trazendo {key_benefit}")

    summary = ", ".join(base_parts)
    if summary:
        summary += "."

    if alternatives and differential:
        summary += f" Diferentemente de {alternatives}, o nosso produto {differential}."
    elif alternatives:
        summary += f" Diferentemente de {alternatives}."
    elif differential:
        summary += f" O nosso diferencial e {differential}."
    return summary.strip()


@router.post("/{inception_id}/publish-product", response_model=schemas.InceptionPublishProductResponse)
def publish_inception_product(
    inception_id: str,
    data: schemas.InceptionPublishProductRequest,
    db: Session = Depends(get_db),
):
    inception = db.query(models.Inception).filter(models.Inception.id == inception_id).first()
    if not inception:
        raise HTTPException(status_code=404, detail="Inception not found")
    if inception.status == "archived":
        raise HTTPException(status_code=409, detail="Inception already archived")

    steps = (
        db.query(models.InceptionStep)
        .filter(models.InceptionStep.inception_id == inception.id)
        .all()
    )
    step_map: dict[str, dict] = {step.step_key: step.payload or {} for step in steps}

    product_vision_payload = step_map.get("product_vision", {})
    personas_payload = step_map.get("personas", {})
    journeys_payload = step_map.get("journey_map", {})
    metrics_payload = step_map.get("product_metrics", {})
    boundaries_payload = step_map.get("boundaries", {})
    feature_review_payload = step_map.get("feature_review", {})
    expected_result_payload = step_map.get("expected_result", {})
    cost_timeline_payload = step_map.get("cost_timeline", {})

    product_name = (data.name or product_vision_payload.get("product_name") or inception.title or "").strip()
    if not product_name:
        raise HTTPException(status_code=400, detail="Product name is required to publish")

    vision_summary = _build_product_vision_summary(product_vision_payload)
    product = WorkspaceProduct(
        workspace_id=inception.workspace_id,
        name=product_name,
        description=vision_summary or inception.description,
        status="active",
    )
    db.add(product)
    db.flush()

    persona_ids: list[str] = personas_payload.get("persona_ids") or []
    valid_persona_ids: list[uuid.UUID] = []
    for persona_id in persona_ids:
        try:
            valid_persona_ids.append(uuid.UUID(str(persona_id)))
        except ValueError:
            continue
    personas = (
        db.query(Persona)
        .filter(Persona.id.in_(valid_persona_ids))
        .all()
        if valid_persona_ids
        else []
    )
    personas_snapshot = [
        {
            "id": str(persona.id),
            "name": persona.name,
            "context": persona.context,
            "goal": persona.goal,
            "main_pain": persona.main_pain,
        }
        for persona in personas
    ]

    journeys_snapshot = journeys_payload.get("journeys") or []
    if not journeys_snapshot and journeys_payload.get("stages"):
        journeys_snapshot = [
            {
                "name": "Jornada principal",
                "persona_id": None,
                "stages": journeys_payload.get("stages", []),
            }
        ]

    features_snapshot = feature_review_payload.get("features") or []
    sequencing_snapshot = (feature_review_payload.get("sequencing") or {})
    roadmap_snapshot = {
        "sequencing": sequencing_snapshot,
        "waves": cost_timeline_payload.get("waves") or [],
    }

    blueprint = ProductBlueprint(
        product_id=product.id,
        source_inception_id=inception.id,
        vision=vision_summary,
        boundaries={
            "is": boundaries_payload.get("is") or [],
            "is_not": boundaries_payload.get("is_not") or [],
            "does": boundaries_payload.get("does") or [],
            "does_not": boundaries_payload.get("does_not") or [],
        },
        personas=personas_snapshot,
        journeys=journeys_snapshot,
        metrics={
            "objectives": metrics_payload.get("objectives") or [],
            "text": metrics_payload.get("text"),
        },
        features=features_snapshot,
        roadmap=roadmap_snapshot,
        expected_result=expected_result_payload.get("text"),
        cost_timeline={
            "total_cost": cost_timeline_payload.get("total_cost"),
            "waves": cost_timeline_payload.get("waves") or [],
            "text": cost_timeline_payload.get("text"),
        },
    )
    db.add(blueprint)
    metric_objectives = metrics_payload.get("objectives") or []
    if not metric_objectives and metrics_payload.get("objective"):
        metric_objectives = [
            {
                "objective": metrics_payload.get("objective"),
                "key_results": metrics_payload.get("key_results") or [],
            }
        ]
    for objective_item in metric_objectives:
        objective_text = str(objective_item.get("objective") or "").strip()
        if not objective_text:
            continue
        key_results = objective_item.get("key_results") or []
        db.add(
            ProductOKR(
                product_id=product.id,
                objective=objective_text,
                key_results=[str(kr).strip() for kr in key_results if str(kr).strip()],
            )
        )
    # Mirror journeys into Discovery module so they are editable there after publish.
    if journeys_snapshot:
        valid_persona_ids = {str(persona.id) for persona in personas}
        for journey in journeys_snapshot:
            persona_id = journey.get("persona_id")
            name = (journey.get("name") or "").strip()
            if not persona_id or persona_id not in valid_persona_ids or not name:
                continue
            existing = (
                db.query(UserJourney)
                .filter(
                    UserJourney.persona_id == uuid.UUID(persona_id),
                    UserJourney.name == name,
                )
                .first()
            )
            if existing:
                continue
            raw_stages = journey.get("stages") or []
            stages: list[str] = []
            for stage in raw_stages:
                if isinstance(stage, dict):
                    text = str(stage.get("stage") or "").strip()
                else:
                    text = str(stage).strip()
                if text:
                    stages.append(text)
            db.add(
                UserJourney(
                    persona_id=uuid.UUID(persona_id),
                    name=name,
                    stages=stages,
                )
            )
    inception.status = "archived"
    db.commit()
    db.refresh(blueprint)
    db.refresh(product)

    return schemas.InceptionPublishProductResponse(
        product_id=product.id,
        workspace_id=product.workspace_id,
        name=product.name,
        blueprint_id=blueprint.id,
    )
