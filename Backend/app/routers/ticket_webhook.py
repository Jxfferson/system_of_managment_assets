from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from datetime import datetime
import os
from sqlalchemy.orm import Session
from app.config.database import SessionLocal
from app.models.almacen import Almacen
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["ticket-webhook"])


class TicketApprovalRequest(BaseModel):
    ticketId: str
    deskLocation: str
    assetItem: str
    assetCondition: str
    description: str = ""


@router.post("/ticket-approved")
async def ticket_approved(
    request: TicketApprovalRequest,
    x_api_token: str = Header(...)
):
    api_key = os.getenv("INVENTORY_API_KEY", "")
    if x_api_token != api_key:
        raise HTTPException(status_code=401, detail="No autorizado")
    
    valid_conditions = ['Return', 'Damage', 'Missing']
    if request.assetCondition not in valid_conditions:
        raise HTTPException(status_code=400, detail="Asset condition no válido")
    
    db: Session = SessionLocal()
    
    try:
        activo_retornado = db.query(Almacen).filter(
            Almacen.Item == request.assetItem,     
            Almacen.Destino == request.deskLocation 
        ).first()
        
        if not activo_retornado:
            activos_en_estacion = db.query(Almacen).filter(
                Almacen.Destino == request.deskLocation
            ).all()
            activos_info = [f"{a.Serial} ({a.Item})" for a in activos_en_estacion]
            
            raise HTTPException(
                status_code=404, 
                detail=f"No se encontró '{request.assetItem}' en {request.deskLocation}. "
                       f"Activos en esa estación: {', '.join(activos_info) if activos_info else 'Ninguno'}"
            )
        
        item_tipo = activo_retornado.Item
        
        activo_retornado.Fecha_Salida = None
        activo_retornado.Destino = None
        activo_retornado.Tipo_Retorno = request.assetCondition
        activo_retornado.Observaciones_Retorno = request.description or f"Ticket #{request.ticketId}"
        activo_retornado.Sede_Actual = None
        
        db.commit()
        db.refresh(activo_retornado)
        
        replacement_asset = None
        if request.assetCondition in ['Damage', 'Missing']:
            replacement_asset = db.query(Almacen).filter(
                Almacen.Item == item_tipo,
                Almacen.Destino == None,
                Almacen.ID != activo_retornado.ID,
                Almacen.Tipo_Retorno == None
            ).first()
            
            if replacement_asset:
                replacement_asset.Destino = request.deskLocation
                replacement_asset.Fecha_Salida = datetime.now().strftime('%Y-%m-%d')
                replacement_asset.Tipo_Retorno = None
                replacement_asset.Observaciones_Retorno = None
                replacement_asset.Sede_Actual = None
                
                db.commit()
                db.refresh(replacement_asset)
        
        db.commit()
        
        response_data = {
            "success": True,
            "message": "Activo actualizado correctamente",
            "returned_asset": {
                "id": activo_retornado.ID,
                "serial": activo_retornado.Serial,
                "item": activo_retornado.Item,
                "tipo_retorno": activo_retornado.Tipo_Retorno,
                "observaciones": activo_retornado.Observaciones_Retorno
            }
        }
        
        if replacement_asset:
            response_data["replacement_asset"] = {
                "id": replacement_asset.ID,
                "serial": replacement_asset.Serial,
                "item": replacement_asset.Item,
                "destino": replacement_asset.Destino,
                "fecha_salida": replacement_asset.Fecha_Salida,
                "message": "Reemplazo automático asignado"
            }
        else:
            if request.assetCondition in ['Damage', 'Missing']:
                response_data["warning"] = "No hay activo de reemplazo disponible"
        
        return response_data
        
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
    finally:
        db.close()