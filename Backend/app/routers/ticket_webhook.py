from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from datetime import datetime
import os
from sqlalchemy.orm import Session
from app.config.database import SessionLocal

from app.models.almacen import Almacen

router = APIRouter(prefix="/api", tags=["ticket-webhook"])


class TicketApprovalRequest(BaseModel):
    ticketId: str
    deskLocation: str
    assetCondition: str
    description: str = ""


@router.post("/ticket-approved")
async def ticket_approved(
    request: TicketApprovalRequest,
    x_api_token: str = Header(...)
):
    """
    Recibe aprobación de tickets y actualiza el activo en inventario
    """
    # 1. Validar token de seguridad
    api_key = os.getenv("INVENTORY_API_KEY", "")
    if x_api_token != api_key:
        raise HTTPException(status_code=401, detail="No autorizado")
    
    # 2. Validar asset condition
    valid_conditions = ['Needs Repair', 'Needs Replacement', 'Missing']
    if request.assetCondition not in valid_conditions:
        raise HTTPException(status_code=400, detail="Asset condition no válido")
    
    # 3. Conectar a base de datos
    db: Session = SessionLocal()
    
    try:
        # 4. Buscar activo por destino (deskLocation)
        activo = db.query(Almacen).filter(Almacen.Destino == request.deskLocation).first()
        
        if not activo:
            raise HTTPException(
                status_code=404, 
                detail=f"No se encontró activo en la estación {request.deskLocation}"
            )
        
        # 5. Actualizar el activo con los nombres exactos de los campos
        activo.Fecha_Salida = None  # ← LIMPIAR EXIT DATE (queda vacío/null) ✅
        activo.Destino = None  # Se libera la estación ✅
        activo.Tipo_Retorno = request.assetCondition  # Missing, Needs Repair, etc. ✅
        activo.Observaciones_Retorno = request.description or f"Ticket #{request.ticketId}"  # ✅
        
        db.commit()
        db.refresh(activo)
        
        return {
            "success": True,
            "message": "Activo actualizado correctamente",
            "asset": {
                "id": activo.ID,
                "serial": activo.Serial,
                "tipo_retorno": activo.Tipo_Retorno,
                "observaciones": activo.Observaciones_Retorno
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
    finally:
        db.close()