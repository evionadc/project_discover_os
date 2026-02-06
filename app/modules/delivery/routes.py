from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.delivery import models, schemas

router = APIRouter(prefix="/delivery", tags=["Delivery"])


@router.post("/features")
def create_feature(data: schemas.FeatureCreate, db: Session = Depends(get_db)):
    feature = models.Feature(**data.dict())
    db.add(feature)
    db.commit()
    return {"status": "feature_created"}


@router.post("/stories")
def create_story(data: schemas.StoryCreate, db: Session = Depends(get_db)):
    story = models.Story(**data.dict())
    db.add(story)
    db.commit()
    return {"status": "story_created"}
