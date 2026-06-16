from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, distinct, text
from typing import List, Optional
from datetime import datetime
import re
from pydantic import BaseModel

from app.config.database import get_db
from app.models.almacen import Almacen
from app.models.item import Item 
from app.schemas.almacen import AlmacenCreate, AlmacenUpdate, AlmacenResponse, SedeResponse, StationHistoryResponse, StationHistoryFullItem
from app.models.station_change_history import StationChangeHistory, ChangeType

router = APIRouter(prefix="/api/almacen", tags=["Almacen"])

SEDES_PERMITIDAS = ["Connecta 80", "Caracol", "American BPS"]

class ItemCreate(BaseModel):
    name: str
    serial_prefix: Optional[str] = None

class ItemResponse(BaseModel):
    name: str
    serial_prefix: str

class AlmacenBulkCreate(BaseModel):
    items: List[AlmacenCreate]

class ItemCreateDB(BaseModel):
    name: str
    prefix: Optional[str] = None
    price_cop: Optional[float] = 10000.0

class ItemUpdateDB(BaseModel):
    name: Optional[str] = None
    prefix: Optional[str] = None
    price_cop: Optional[float] = None

class ItemResponseDB(BaseModel):
    name: str
    prefix: Optional[str]
    price_cop: Optional[float]
    class Config:
        from_attributes = True

@router.get("/sedes", response_model=List[SedeResponse])
def get_available_sedes():
    return [{"value": sede, "label": sede} for sede in SEDES_PERMITIDAS]

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
                if match: prefix = match.group(1).upper()
            response_items.append({"name": item_name, "serial_prefix": prefix})
        return response_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/items-list", response_model=List[ItemResponseDB])
def get_items_list(db: Session = Depends(get_db)):
    try:
        items = db.query(Item).order_by(Item.name).all()
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/items", response_model=ItemResponseDB, status_code=201)
def create_item(data: ItemCreateDB, db: Session = Depends(get_db)):
    existing = db.query(Item).filter(Item.name == data.name).first()
    if existing: raise HTTPException(status_code=400, detail="Item ya existe")
    new_item = Item(name=data.name.strip(), prefix=data.prefix.strip().upper() if data.prefix else None, price_cop=data.price_cop or 10000.0)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/items/{item_name}", response_model=ItemResponseDB)
def update_item(item_name: str, data: ItemUpdateDB, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.name == item_name).first()
    if not item: raise HTTPException(status_code=404, detail="Item no encontrado")
    if data.name: item.name = data.name.strip()
    if data.prefix is not None: item.prefix = data.prefix.strip().upper() if data.prefix else None
    if data.price_cop is not None: item.price_cop = data.price_cop
    db.commit()
    db.refresh(item)
    return item

@router.delete("/items/{item_name}", status_code=200)
def delete_item(item_name: str, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.name == item_name).first()
    if not item: raise HTTPException(status_code=404, detail="Item no encontrado")
    db.delete(item)
    db.commit()
    return {"message": "Eliminado correctamente"}

@router.get("/", response_model=List[AlmacenResponse])
def get_all(
    search: Optional[str] = Query(None), 
    destino: Optional[str] = Query(None),  
    db: Session = Depends(get_db)
):
    query = db.query(Almacen)
    
    if destino:
        query = query.filter(Almacen.Destino == destino)
    elif search:
        term = f"%{search}%"
        query = query.filter(or_(
            Almacen.Item.like(term),
            Almacen.Serial.like(term),
            Almacen.Destino.like(term),
            Almacen.Sede_Actual.like(term),  
        ))
    return query.order_by(Almacen.ID.desc()).all()

@router.post("/", response_model=AlmacenResponse, status_code=201)
def create(data: AlmacenCreate, db: Session = Depends(get_db)):
    nuevo = Almacen(
        Item=data.Item,
        Serial=data.Serial,
        Fecha_Ingreso=data.Fecha_Ingreso,
        Fecha_Salida=data.Fecha_Salida,
        Destino=data.Destino,
        Tipo_Retorno=data.Tipo_Retorno,
        Observaciones_Retorno=data.Observaciones_Retorno,
        Sede_Actual=data.Sede_Actual,
        Monitor_Location=data.Monitor_Location
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    
    if data.Destino:
        log_station_change(
            db=db,
            station_code=data.Destino,
            change_type="ASSIGNED",
            current_asset={"serial": nuevo.Serial, "name": nuevo.Item},
            previous_asset=None
        )
    
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
                "Observaciones_Retorno": item.Observaciones_Retorno,
                "Sede_Actual": item.Sede_Actual,
                "Monitor_Location": item.Monitor_Location
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

@router.get("/{id:int}", response_model=AlmacenResponse)
def get_by_id(id: int, db: Session = Depends(get_db)):
    item = db.query(Almacen).filter(Almacen.ID == id).first()
    if not item: raise HTTPException(status_code=404, detail="No encontrado")
    return item

@router.put("/{id:int}", response_model=AlmacenResponse)
def update(id: int, data: AlmacenUpdate, db: Session = Depends(get_db)):
    item = db.query(Almacen).filter(Almacen.ID == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    previous_station = item.Destino
    previous_serial = item.Serial
    previous_name = item.Item
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    
    if 'Destino' in update_data:
        new_station = update_data['Destino']
        
        if new_station and not previous_station:
            log_station_change(
                db=db,
                station_code=new_station,
                change_type="ASSIGNED",
                current_asset={"serial": item.Serial, "name": item.Item},
                previous_asset=None
            )
        elif new_station and previous_station and new_station != previous_station:
            log_station_change(
                db=db,
                station_code=new_station,
                change_type="MOVED_TO",
                current_asset={"serial": item.Serial, "name": item.Item},
                previous_asset={"serial": previous_serial, "name": previous_name}
            )
            log_station_change(
                db=db,
                station_code=previous_station,
                change_type="MOVED_FROM",
                current_asset=None,
                previous_asset={"serial": previous_serial, "name": previous_name}
            )
        elif previous_station and not new_station:
            log_station_change(
                db=db,
                station_code=previous_station,
                change_type="UNASSIGNED",
                current_asset=None,
                previous_asset={"serial": previous_serial, "name": previous_name}
            )
    
    return item

@router.delete("/{id:int}")
def delete(id: int, db: Session = Depends(get_db)):
    item = db.query(Almacen).filter(Almacen.ID == id).first()
    if not item: raise HTTPException(status_code=404, detail="No encontrado")
    db.delete(item)
    db.commit()
    return {"message": "Eliminado"}

def log_station_change(db: Session, station_code: str, change_type: str, 
                       current_asset: dict = None, previous_asset: dict = None,
                       changed_by: int = None, ticket_id: int = None):
    try:
        db.add(StationChangeHistory(
            station_code=station_code,
            asset_serial=current_asset.get("serial") if current_asset else None,
            asset_name=current_asset.get("name") if current_asset else None,
            previous_asset_serial=previous_asset.get("serial") if previous_asset else None,
            previous_asset_name=previous_asset.get("name") if previous_asset else None,
            change_type=ChangeType(change_type),
            changed_by=changed_by,
            ticket_id=ticket_id
        ))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Warning: Could not log station change: {e}")

@router.get("/station/{station_code}/history", response_model=StationHistoryResponse)
def get_station_history(station_code: str, db: Session = Depends(get_db)):
    result = db.execute(
        text("""
            SELECT 
                station_code,
                asset_serial,
                asset_name,
                previous_asset_serial,
                previous_asset_name,
                change_type,
                changed_at,
                (SELECT COUNT(*) FROM station_change_history WHERE station_code = :code) as total_changes
            FROM station_change_history
            WHERE station_code = :code
            ORDER BY changed_at DESC
            LIMIT 1
        """),
        {"code": station_code}
    ).fetchone()
    
    if not result:
        return StationHistoryResponse(
            station_code=station_code,
            last_change_at=None,
            last_change_type=None,
            current_asset_serial=None,
            current_asset_name=None,
            previous_asset_serial=None,
            previous_asset_name=None,
            total_changes=0
        )
    
    return StationHistoryResponse(
        station_code=result.station_code,
        last_change_at=result.changed_at.isoformat() if result.changed_at else None,
        last_change_type=result.change_type,
        current_asset_serial=result.asset_serial,
        current_asset_name=result.asset_name,
        previous_asset_serial=result.previous_asset_serial,
        previous_asset_name=result.previous_asset_name,
        total_changes=result.total_changes or 0
    )

@router.get("/station/{station_code}/history/full", response_model=List[StationHistoryFullItem])
def get_full_station_history(station_code: str, db: Session = Depends(get_db)):
    """Obtiene los últimos 50 cambios - Maneja IDs y nombres"""
    results = db.execute(
        text("""
            SELECT 
                h.id_change,
                h.station_code,
                h.asset_serial,
                h.asset_name,
                h.previous_asset_serial,
                h.previous_asset_name,
                h.change_type,
                h.changed_at,
                h.ticket_id,
                h.reviewed_by,
                h.approved_by,
                h.asset_condition
            FROM station_change_history h
            WHERE h.station_code = :code
            ORDER BY h.changed_at DESC
            LIMIT 50
        """),
        {"code": station_code}
    ).fetchall()
    
    def format_time_ago(dt):
        if not dt:
            return "N/A"
        now = datetime.now()
        diff = now - dt
        
        if diff.days >= 365:
            years = diff.days // 365
            return f"hace {years} año{'s' if years > 1 else ''}"
        if diff.days >= 30:
            months = diff.days // 30
            return f"hace {months} mes{'es' if months > 1 else ''}"
        if diff.days >= 7:
            weeks = diff.days // 7
            return f"hace {weeks} semana{'s' if weeks > 1 else ''}"
        if diff.days >= 1:
            return f"hace {diff.days} día{'s' if diff.days > 1 else ''}"
        if diff.seconds >= 3600:
            hours = diff.seconds // 3600
            return f"hace {hours} hora{'s' if hours > 1 else ''}"
        if diff.seconds >= 60:
            minutes = diff.seconds // 60
            return f"hace {minutes} minuto{'s' if minutes > 1 else ''}"
        return "hace poco"
    
    def format_user_field(value):
        """Convierte ID o nombre a string"""
        if value is None:
            return None
        if isinstance(value, str):
            return value  # Ya es un nombre
        return f"User #{value}"  # Es un ID numérico
    
    return [
        {
            "id_change": r.id_change,
            "station_code": r.station_code,
            "asset_serial": r.asset_serial,
            "asset_name": r.asset_name,
            "previous_asset_serial": r.previous_asset_serial,
            "previous_asset_name": r.previous_asset_name,
            "change_type": r.change_type,
            "changed_at": r.changed_at.isoformat() if r.changed_at else None,
            "ticket_id": r.ticket_id,
            "time_ago": format_time_ago(r.changed_at),
            "reviewed_by": format_user_field(r.reviewed_by),
            "approved_by": format_user_field(r.approved_by),
            "asset_condition": r.asset_condition
        }
        for r in results
    ]