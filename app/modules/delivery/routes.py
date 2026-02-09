from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.delivery import models, schemas

router = APIRouter(prefix="/delivery", tags=["Delivery"])


@router.get("/features", response_model=list[schemas.FeatureResponse])
def list_features(db: Session = Depends(get_db)):
    return db.query(models.Feature).all()


@router.post("/features", response_model=schemas.FeatureResponse)
def create_feature(data: schemas.FeatureCreate, db: Session = Depends(get_db)):
    if data.mvp_id is None and data.hypothesis_id is None:
        raise HTTPException(status_code=400, detail="Feature requires hypothesis_id or mvp_id")
    feature = models.Feature(**data.dict())
    db.add(feature)
    db.commit()
    db.refresh(feature)
    return feature


@router.get("/stories", response_model=list[schemas.StoryResponse])
def list_stories(db: Session = Depends(get_db)):
    return db.query(models.Story).all()


@router.post("/stories", response_model=schemas.StoryResponse)
def create_story(data: schemas.StoryCreate, db: Session = Depends(get_db)):
    if data.feature_id is None and data.workspace_id is None:
        raise HTTPException(status_code=400, detail="Story requires feature_id or workspace_id")
    story = models.Story(**data.dict())
    db.add(story)
    db.commit()
    db.refresh(story)
    return story
