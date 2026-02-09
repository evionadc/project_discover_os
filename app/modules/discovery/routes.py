from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.discovery import models, schemas

router = APIRouter(prefix="/discovery", tags=["Discovery"])

@router.get("/problems")
def list_problems(db: Session = Depends(get_db)):
    return db.query(models.Problem).all()

@router.post("/problems", response_model=schemas.ProblemResponse)
def create_problem(data: schemas.ProblemCreate, db: Session = Depends(get_db)):
    problem = models.Problem(**data.dict())
    db.add(problem)
    db.commit()
    db.refresh(problem)
    return problem


@router.get("/personas", response_model=list[schemas.PersonaResponse])
def list_personas(db: Session = Depends(get_db)):
    return db.query(models.Persona).all()


@router.post("/personas", response_model=schemas.PersonaResponse)
def create_persona(data: schemas.PersonaCreate, db: Session = Depends(get_db)):
    persona = models.Persona(**data.dict())
    db.add(persona)
    db.commit()
    db.refresh(persona)
    return persona


@router.get("/hypotheses", response_model=list[schemas.HypothesisResponse])
def list_hypotheses(db: Session = Depends(get_db)):
    return db.query(models.Hypothesis).all()


@router.post("/hypotheses")
def create_hypothesis(data: schemas.HypothesisCreate, db: Session = Depends(get_db)):
    hypothesis = models.Hypothesis(**data.dict())
    db.add(hypothesis)
    db.commit()
    return {"status": "created"}


@router.get("/mvps", response_model=list[schemas.MVPResponse])
def list_mvps(db: Session = Depends(get_db)):
    return db.query(models.MVP).all()


@router.post("/mvps")
def create_mvp(data: schemas.MVPCreate, db: Session = Depends(get_db)):
    mvp = models.MVP(**data.dict())
    db.add(mvp)
    db.commit()
    return {"status": "created"}
