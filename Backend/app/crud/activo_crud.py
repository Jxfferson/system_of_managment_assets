from sqlalchemy.orm import Session
from app.models.activo import Activo
from app.schemas.activo_schema import ActivoCreate

def get_activos(db: Session):
    return db.query(Activo).all()

def create_activo(db: Session, activo: ActivoCreate):
    db_activo = Activo(**activo.dict())
    db.add(db_activo)
    db.commit()
    db.refresh(db_activo)
    return db_activo