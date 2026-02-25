from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.schemas.activo_schema import ActivoCreate, ActivoResponse
from app.crud.activo_crud import get_activos, create_activo

router = APIRouter(prefix="/activos", tags=["Activos"])

# Dependency DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[ActivoResponse])
def listar_activos(db: Session = Depends(get_db)):
    return get_activos(db)

@router.post("/", response_model=ActivoResponse)
def crear_activo(activo: ActivoCreate, db: Session = Depends(get_db)):
    return create_activo(db, activo)