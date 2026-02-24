from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.discovery import models, schemas
from app.modules.workspace.models import ProductBlueprint, Workspace, WorkspaceProduct
import uuid

router = APIRouter(prefix="/discovery", tags=["Discovery"])


def _first_workspace_id(db: Session) -> int | None:
    workspace = db.query(Workspace).order_by(Workspace.id.asc()).first()
    return workspace.id if workspace else None


def _first_problem_id(db: Session):
    problem = db.query(models.Problem).order_by(models.Problem.title.asc()).first()
    return problem.id if problem else None


def _first_persona_id(db: Session):
    persona = db.query(models.Persona).order_by(models.Persona.name.asc()).first()
    return persona.id if persona else None


def _first_product_id(db: Session) -> int | None:
    product = db.query(WorkspaceProduct).order_by(WorkspaceProduct.id.asc()).first()
    return product.id if product else None

@router.get("/problems")
def list_problems(db: Session = Depends(get_db)):
    return db.query(models.Problem).all()

@router.post("/problems", response_model=schemas.ProblemResponse)
def create_problem(data: schemas.ProblemCreate, db: Session = Depends(get_db)):
    payload = data.dict()
    if not db.query(Workspace).filter(Workspace.id == data.workspace_id).first():
        fallback_workspace_id = _first_workspace_id(db)
        if fallback_workspace_id is None:
            raise HTTPException(
                status_code=400,
                detail="No workspace found. Create a workspace first.",
            )
        payload["workspace_id"] = fallback_workspace_id

    problem = models.Problem(**payload)
    db.add(problem)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Invalid workspace_id: {data.workspace_id}",
        )
    db.refresh(problem)
    return problem


@router.get("/problems/{problem_id}", response_model=schemas.ProblemResponse)
def get_problem(problem_id: str, db: Session = Depends(get_db)):
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem


@router.put("/problems/{problem_id}", response_model=schemas.ProblemResponse)
def update_problem(problem_id: str, data: schemas.ProblemUpdate, db: Session = Depends(get_db)):
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    updates = data.dict(exclude_unset=True)
    if "workspace_id" in updates and updates["workspace_id"] is not None:
        workspace_exists = db.query(Workspace).filter(Workspace.id == updates["workspace_id"]).first()
        if not workspace_exists:
            fallback_workspace_id = _first_workspace_id(db)
            if fallback_workspace_id is None:
                raise HTTPException(status_code=400, detail="No workspace found. Create a workspace first.")
            updates["workspace_id"] = fallback_workspace_id
    if "title" in updates and isinstance(updates["title"], str):
        updates["title"] = updates["title"].strip()
        if not updates["title"]:
            raise HTTPException(status_code=400, detail="Problem title cannot be empty")

    for field, value in updates.items():
        setattr(problem, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid problem payload")
    db.refresh(problem)
    return problem


@router.delete("/problems/{problem_id}", status_code=204)
def delete_problem(problem_id: str, db: Session = Depends(get_db)):
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    linked_personas = db.query(models.Persona).filter(models.Persona.problem_id == problem.id).first()
    if linked_personas:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete problem with linked personas",
        )

    db.delete(problem)
    db.commit()
    return None


@router.get("/personas", response_model=list[schemas.PersonaResponse])
def list_personas(db: Session = Depends(get_db)):
    return db.query(models.Persona).all()


@router.post("/personas", response_model=schemas.PersonaResponse)
def create_persona(data: schemas.PersonaCreate, db: Session = Depends(get_db)):
    payload = data.dict()
    if not db.query(models.Problem).filter(models.Problem.id == data.problem_id).first():
        fallback_problem_id = _first_problem_id(db)
        if fallback_problem_id is None:
            raise HTTPException(status_code=400, detail="No problem found. Create a problem first.")
        payload["problem_id"] = fallback_problem_id
    persona = models.Persona(**payload)
    db.add(persona)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid problem_id for persona")
    db.refresh(persona)
    return persona


@router.get("/personas/{persona_id}", response_model=schemas.PersonaResponse)
def get_persona(persona_id: str, db: Session = Depends(get_db)):
    persona = db.query(models.Persona).filter(models.Persona.id == persona_id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    return persona


@router.put("/personas/{persona_id}", response_model=schemas.PersonaResponse)
def update_persona(persona_id: str, data: schemas.PersonaUpdate, db: Session = Depends(get_db)):
    persona = db.query(models.Persona).filter(models.Persona.id == persona_id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")

    updates = data.dict(exclude_unset=True)
    if "problem_id" in updates and updates["problem_id"] is not None:
        problem_exists = db.query(models.Problem).filter(models.Problem.id == updates["problem_id"]).first()
        if not problem_exists:
            fallback_problem_id = _first_problem_id(db)
            if fallback_problem_id is None:
                raise HTTPException(status_code=400, detail="No problem found. Create a problem first.")
            updates["problem_id"] = fallback_problem_id
    if "name" in updates and isinstance(updates["name"], str):
        updates["name"] = updates["name"].strip()
        if not updates["name"]:
            raise HTTPException(status_code=400, detail="Persona name cannot be empty")

    for field, value in updates.items():
        setattr(persona, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid persona payload")
    db.refresh(persona)
    return persona


@router.delete("/personas/{persona_id}", status_code=204)
def delete_persona(persona_id: str, db: Session = Depends(get_db)):
    persona = db.query(models.Persona).filter(models.Persona.id == persona_id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    db.delete(persona)
    db.commit()
    return None


@router.get("/journeys", response_model=list[schemas.UserJourneyResponse])
def list_journeys(db: Session = Depends(get_db)):
    # Backfill old published products:
    # if blueprint has journeys and discovery table still misses them, create once.
    existing = db.query(models.UserJourney).all()
    existing_pairs = {(str(item.persona_id), item.name.strip().lower()) for item in existing}
    valid_persona_ids = {str(persona.id) for persona in db.query(models.Persona).all()}

    blueprints = db.query(ProductBlueprint).filter(ProductBlueprint.journeys.isnot(None)).all()
    created_any = False
    for blueprint in blueprints:
        raw_journeys = blueprint.journeys or []
        for journey in raw_journeys:
            persona_id = str(journey.get("persona_id") or "").strip()
            name = str(journey.get("name") or "").strip()
            if not persona_id or not name or persona_id not in valid_persona_ids:
                continue
            pair = (persona_id, name.lower())
            if pair in existing_pairs:
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
                models.UserJourney(
                    persona_id=uuid.UUID(persona_id),
                    name=name,
                    stages=stages,
                )
            )
            existing_pairs.add(pair)
            created_any = True

    if created_any:
        db.commit()

    return db.query(models.UserJourney).order_by(models.UserJourney.name.asc()).all()


@router.post("/journeys", response_model=schemas.UserJourneyResponse)
def create_journey(data: schemas.UserJourneyCreate, db: Session = Depends(get_db)):
    name = data.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Journey name cannot be empty")
    persona_id = data.persona_id
    if not db.query(models.Persona).filter(models.Persona.id == data.persona_id).first():
        fallback_persona_id = _first_persona_id(db)
        if fallback_persona_id is None:
            raise HTTPException(status_code=400, detail="No persona found. Create a persona first.")
        persona_id = fallback_persona_id
    journey = models.UserJourney(
        persona_id=persona_id,
        name=name,
        stages=data.stages or [],
    )
    db.add(journey)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid persona_id for journey")
    db.refresh(journey)
    return journey


@router.get("/journeys/{journey_id}", response_model=schemas.UserJourneyResponse)
def get_journey(journey_id: str, db: Session = Depends(get_db)):
    journey = db.query(models.UserJourney).filter(models.UserJourney.id == journey_id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    return journey


@router.put("/journeys/{journey_id}", response_model=schemas.UserJourneyResponse)
def update_journey(journey_id: str, data: schemas.UserJourneyUpdate, db: Session = Depends(get_db)):
    journey = db.query(models.UserJourney).filter(models.UserJourney.id == journey_id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")

    updates = data.dict(exclude_unset=True)
    if "persona_id" in updates and updates["persona_id"] is not None:
        persona_exists = db.query(models.Persona).filter(models.Persona.id == updates["persona_id"]).first()
        if not persona_exists:
            fallback_persona_id = _first_persona_id(db)
            if fallback_persona_id is None:
                raise HTTPException(status_code=400, detail="No persona found. Create a persona first.")
            updates["persona_id"] = fallback_persona_id
    if "name" in updates and isinstance(updates["name"], str):
        updates["name"] = updates["name"].strip()
        if not updates["name"]:
            raise HTTPException(status_code=400, detail="Journey name cannot be empty")

    for field, value in updates.items():
        setattr(journey, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid journey payload")
    db.refresh(journey)
    return journey


@router.delete("/journeys/{journey_id}", status_code=204)
def delete_journey(journey_id: str, db: Session = Depends(get_db)):
    journey = db.query(models.UserJourney).filter(models.UserJourney.id == journey_id).first()
    if not journey:
        raise HTTPException(status_code=404, detail="Journey not found")
    db.delete(journey)
    db.commit()
    return None


@router.get("/okrs", response_model=list[schemas.ProductOKRResponse])
def list_okrs(product_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(models.ProductOKR)
    if product_id is not None:
        query = query.filter(models.ProductOKR.product_id == product_id)

        # Backfill old published products from Lean Inception blueprint metrics.
        existing = query.all()
        existing_keys = {
            (item.product_id, item.objective.strip().lower())
            for item in existing
        }
        blueprints = (
            db.query(ProductBlueprint)
            .filter(ProductBlueprint.product_id == product_id)
            .all()
        )
        created_any = False
        for blueprint in blueprints:
            metrics = blueprint.metrics or {}
            objectives = metrics.get("objectives") or []
            if not objectives and metrics.get("objective"):
                objectives = [
                    {
                        "objective": metrics.get("objective"),
                        "key_results": metrics.get("key_results") or [],
                    }
                ]
            for objective_item in objectives:
                objective_text = str(objective_item.get("objective") or "").strip()
                if not objective_text:
                    continue
                key = (blueprint.product_id, objective_text.lower())
                if key in existing_keys:
                    continue
                key_results = objective_item.get("key_results") or []
                db.add(
                    models.ProductOKR(
                        product_id=blueprint.product_id,
                        objective=objective_text,
                        key_results=[str(kr).strip() for kr in key_results if str(kr).strip()],
                    )
                )
                existing_keys.add(key)
                created_any = True
        if created_any:
            db.commit()
        return (
            db.query(models.ProductOKR)
            .filter(models.ProductOKR.product_id == product_id)
            .order_by(models.ProductOKR.objective.asc())
            .all()
        )

    return query.order_by(models.ProductOKR.objective.asc()).all()


@router.post("/okrs", response_model=schemas.ProductOKRResponse)
def create_okr(data: schemas.ProductOKRCreate, db: Session = Depends(get_db)):
    objective = data.objective.strip()
    if not objective:
        raise HTTPException(status_code=400, detail="OKR objective cannot be empty")
    product_id = data.product_id
    if not db.query(WorkspaceProduct).filter(WorkspaceProduct.id == data.product_id).first():
        fallback_product_id = _first_product_id(db)
        if fallback_product_id is None:
            raise HTTPException(status_code=400, detail="No product found. Create a product first.")
        product_id = fallback_product_id
    okr = models.ProductOKR(
        product_id=product_id,
        objective=objective,
        key_results=[str(kr).strip() for kr in data.key_results if str(kr).strip()],
    )
    db.add(okr)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid product_id for OKR")
    db.refresh(okr)
    return okr


@router.get("/okrs/{okr_id}", response_model=schemas.ProductOKRResponse)
def get_okr(okr_id: str, db: Session = Depends(get_db)):
    okr = db.query(models.ProductOKR).filter(models.ProductOKR.id == okr_id).first()
    if not okr:
        raise HTTPException(status_code=404, detail="OKR not found")
    return okr


@router.put("/okrs/{okr_id}", response_model=schemas.ProductOKRResponse)
def update_okr(okr_id: str, data: schemas.ProductOKRUpdate, db: Session = Depends(get_db)):
    okr = db.query(models.ProductOKR).filter(models.ProductOKR.id == okr_id).first()
    if not okr:
        raise HTTPException(status_code=404, detail="OKR not found")
    updates = data.dict(exclude_unset=True)
    if "product_id" in updates and updates["product_id"] is not None:
        product_exists = db.query(WorkspaceProduct).filter(WorkspaceProduct.id == updates["product_id"]).first()
        if not product_exists:
            fallback_product_id = _first_product_id(db)
            if fallback_product_id is None:
                raise HTTPException(status_code=400, detail="No product found. Create a product first.")
            updates["product_id"] = fallback_product_id
    if "objective" in updates and isinstance(updates["objective"], str):
        updates["objective"] = updates["objective"].strip()
        if not updates["objective"]:
            raise HTTPException(status_code=400, detail="OKR objective cannot be empty")
    if "key_results" in updates and isinstance(updates["key_results"], list):
        updates["key_results"] = [str(kr).strip() for kr in updates["key_results"] if str(kr).strip()]
    for field, value in updates.items():
        setattr(okr, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid OKR payload")
    db.refresh(okr)
    return okr


@router.delete("/okrs/{okr_id}", status_code=204)
def delete_okr(okr_id: str, db: Session = Depends(get_db)):
    okr = db.query(models.ProductOKR).filter(models.ProductOKR.id == okr_id).first()
    if not okr:
        raise HTTPException(status_code=404, detail="OKR not found")
    db.delete(okr)
    db.commit()
    return None

