from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from app.config.database import get_db
from app.models.almacen import Almacen
from app.schemas.almacen import AlmacenCreate, AlmacenUpdate, AlmacenResponse

router = APIRouter(prefix="/api/almacen", tags=["Almacen"])


# GET /api/almacen  (con búsqueda opcional: ?search=cable)
@router.get("/", response_model=List[AlmacenResponse])
def get_all(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Almacen)
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Almacen.Item.like(term),
                Almacen.Serial.like(term),
                Almacen.Destino.like(term),
            )
        )
    return query.order_by(Almacen.ID.desc()).all()


# GET /api/almacen/{id}
@router.get("/{id}", response_model=AlmacenResponse)
def get_by_id(id: int, db: Session = Depends(get_db)):
    item = db.query(Almacen).filter(Almacen.ID == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    return item


# POST /api/almacen
@router.post("/", response_model=AlmacenResponse, status_code=201)
def create(data: AlmacenCreate, db: Session = Depends(get_db)):
    nuevo = Almacen(**data.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


# PUT /api/almacen/{id}
@router.put("/{id}", response_model=AlmacenResponse)
def update(id: int, data: AlmacenUpdate, db: Session = Depends(get_db)):
    item = db.query(Almacen).filter(Almacen.ID == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


# DELETE /api/almacen/{id}
@router.delete("/{id}")
def delete(id: int, db: Session = Depends(get_db)):
    item = db.query(Almacen).filter(Almacen.ID == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    db.delete(item)
    db.commit()
    return {"message": "Item eliminado exitosamente"}
