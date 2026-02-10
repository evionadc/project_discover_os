from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.inceptions import models, schemas

router = APIRouter(prefix="/inceptions", tags=["Inceptions"])


@router.get("", response_model=list[schemas.InceptionResponse])
def list_inceptions(type: str | None = None, db: Session = Depends(get_db)):
    query = db.query(models.Inception)
    if type:
        query = query.filter(models.Inception.type == type)
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
