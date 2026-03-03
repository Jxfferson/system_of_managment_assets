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


# ==================== SCHEMAS ====================
class ItemCreate(BaseModel):
    name: str
    serial_prefix: Optional[str] = None

class ItemResponse(BaseModel):
    name: str
    serial_prefix: str
# ===========================================================


# ✅ GET: Items únicos desde ALMACEN
@router.get("/items", response_model=List[ItemResponse])
def get_available_items(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("""
            SELECT DISTINCT Item FROM ALMACEN 
            WHERE Item IS NOT NULL AND Item != '' 
            ORDER BY Item ASC
        """))
        items_names = [row[0] for row in result.fetchall()]
        
        response_items = []
        for item_name in items_names:
            serial_result = db.execute(text("""
                SELECT Serial FROM ALMACEN 
                WHERE Item = :item AND Serial IS NOT NULL AND Serial != ''
                LIMIT 1
            """), {"item": item_name})
            serial_row = serial_result.first()
            prefix = "ITM"
            if serial_row and serial_row[0]:
                match = re.match(r'^([A-Za-z]+)', serial_row[0])
                if match:
                    prefix = match.group(1).upper()
            response_items.append({"name": item_name, "serial_prefix": prefix})
        return response_items
    except Exception as e:
        print(f"Error: {e}")
        return []


# ✅ POST: Solo generar prefijo (NO valida, NO guarda)
@router.post("/items", response_model=ItemResponse)
def create_item_type(item: ItemCreate, db: Session = Depends(get_db)):
    prefix = item.serial_prefix
    if not prefix:
        prefix = ''.join(c for c in item.name.upper() if c.isalnum())[:6] or 'ITM'
    return {"name": item.name, "serial_prefix": prefix.upper()}


# ==================== ENDPOINTS PRINCIPALES - SIN VALIDACIONES ====================

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

# ✅ POST PRINCIPAL - GUARDA DIRECTO SIN VALIDAR ITEM
@router.post("/", response_model=AlmacenResponse, status_code=201)
def create(data: AlmacenCreate, db: Session = Depends(get_db)):
    # Guardar directamente, sin validar si el item "existe"
    nuevo = Almacen(
        Item=data.Item,
        Serial=data.Serial,
        Fecha_Ingreso=data.Fecha_Ingreso,
        Fecha_Salida=data.Fecha_Salida,
        Destino=data.Destino
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.put("/{id}", response_model=AlmacenResponse)
def update(id: int, data: AlmacenUpdate, db: Session = Depends(get_db)):
    item = db.query(Almacen).filter(Almacen.ID == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    # Actualizar campos
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    
    return {
        "ID": item.ID,
        "Item": item.Item,
        "Serial": item.Serial,
        "Fecha_Ingreso": item.Fecha_Ingreso,
        "Fecha_Salida": item.Fecha_Salida,
        "Destino": item.Destino
    }

@router.delete("/{id}")
def delete(id: int, db: Session = Depends(get_db)):
    item = db.query(Almacen).filter(Almacen.ID == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    db.delete(item)
    db.commit()
    return {"message": "Eliminado"}