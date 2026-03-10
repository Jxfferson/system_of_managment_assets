from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, distinct, text
from typing import List, Optional
import re
from pydantic import BaseModel

from app.config.database import get_db
from app.models.almacen import Almacen
from app.schemas.almacen import AlmacenCreate, AlmacenUpdate, AlmacenResponse

router = APIRouter(prefix="/api/almacen", tags=["Almacen"])

class ItemCreate(BaseModel):
    name: str
    serial_prefix: Optional[str] = None

class ItemResponse(BaseModel):
    name: str
    serial_prefix: str

class AlmacenBulkCreate(BaseModel):
    items: List[AlmacenCreate]

@router.get("/items", response_model=List[ItemResponse])
def get_available_items(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("""
            WITH first_serials AS (
                SELECT Item, Serial,
                       ROW_NUMBER() OVER (PARTITION BY Item ORDER BY ID) as rn
                FROM ALMACEN 
                WHERE Item IS NOT NULL AND Item != '' AND Serial IS NOT NULL AND Serial != ''
            )
            SELECT DISTINCT a.Item, fs.Serial
            FROM ALMACEN a
            LEFT JOIN first_serials fs ON a.Item = fs.Item AND fs.rn = 1
            WHERE a.Item IS NOT NULL AND a.Item != ''
            ORDER BY a.Item ASC
        """))
        
        response_items = []
        for item_name, serial in result.fetchall():
            prefix = "ITM"
            if serial:
                match = re.match(r'^([A-Za-z]+)', serial)
                if match:
                    prefix = match.group(1).upper()
            response_items.append({"name": item_name, "serial_prefix": prefix})
        return response_items
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[AlmacenResponse])
def get_all(search: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Almacen)
    if search:
        term = f"%{search}%"
        query = query.filter(or_(
            Almacen.Item.like(term),
            Almacen.Serial.like(term),
            Almacen.Destino.like(term),
        ))
    return query.order_by(Almacen.ID.desc()).all()

@router.get("/{id}", response_model=AlmacenResponse)
def get_by_id(id: int, db: Session = Depends(get_db)):
    item = db.query(Almacen).filter(Almacen.ID == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    return item

@router.post("/", response_model=AlmacenResponse, status_code=201)
def create(data: AlmacenCreate, db: Session = Depends(get_db)):
    nuevo = Almacen(
        Item=data.Item,
        Serial=data.Serial,
        Fecha_Ingreso=data.Fecha_Ingreso,
        Fecha_Salida=data.Fecha_Salida,
        Destino=data.Destino,
        Tipo_Retorno=data.Tipo_Retorno,
        Observaciones_Retorno=data.Observaciones_Retorno
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.post("/bulk", status_code=201)
def create_bulk(data: AlmacenBulkCreate, db: Session = Depends(get_db)):
    try:
        seriales = [item.Serial for item in data.items if item.Serial]
        if len(seriales) != len(set(seriales)):
            raise HTTPException(status_code=400, detail="Hay seriales duplicados en el lote")
        
        existentes = db.execute(
            text("SELECT Serial FROM ALMACEN WHERE Serial IN :seriales"),
            {"seriales": tuple(seriales)}
        ).fetchall()
        
        if existentes:
            duplicados = [s[0] for s in existentes]
            raise HTTPException(status_code=400, detail=f"Seriales ya existen: {', '.join(duplicados[:5])}")
        
        db.bulk_insert_mappings(Almacen, [
            {
                "Item": item.Item,
                "Serial": item.Serial,
                "Fecha_Ingreso": item.Fecha_Ingreso,
                "Fecha_Salida": item.Fecha_Salida,
                "Destino": item.Destino,
                "Tipo_Retorno": item.Tipo_Retorno,
                "Observaciones_Retorno": item.Observaciones_Retorno
            } for item in data.items
        ])
        db.commit()
        return {"message": f"{len(data.items)} registros creados", "count": len(data.items)}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{id}", response_model=AlmacenResponse)
def update(id: int, data: AlmacenUpdate, db: Session = Depends(get_db)):
    item = db.query(Almacen).filter(Almacen.ID == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    return item 

@router.delete("/{id}")
def delete(id: int, db: Session = Depends(get_db)):
    item = db.query(Almacen).filter(Almacen.ID == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    db.delete(item)
    db.commit()
    return {"message": "Eliminado"}