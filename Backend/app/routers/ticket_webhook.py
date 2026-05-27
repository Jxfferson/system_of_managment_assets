from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from datetime import datetime
import os
from sqlalchemy.orm import Session
from app.config.database import SessionLocal
from app.models.almacen import Almacen
import logging
from typing import Optional

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__) 

router = APIRouter(prefix="/api", tags=["ticket-webhook"])

_HARDWARE_COMPONENT_MAP = {
    "pantalla-derecha": "Right screen",
    "pantalla-izquierda": "Left screen",
    "teclado": "Teclado ESENSES Basico USB",
    "mouse": "Mouse Alámbrico HP Óptico negro 100",
    "cpu": "CPU",
    "cable-vga": "Cable Display Port a VGA 1,8",
    "cable-vga-vga": "Cable Display VGA a VGA 1,8",
    "extension": "Extension de Cable eléctrico",
    "cable-hdmi": "Cable HDMI a HDMI 1,8 Metros",
    "cable-vga-hdmi": "Cable VGA a HDMI 1,8 Metros",
    "cable-display-hdmi": "Cable Display Port a HDMI 1,8",
    "cable-lan": "Cable LAN-RJ45 1,8 Metros",
    "conversor-vga": "Conversores Displayport a VGA Hembra",
    "ethernet": "Ethernet 3,0 LAN a USB",
    "ethernet-usb": "Ethernet USB",
    "ethernet-usb-2": "Ethernet USB 2,0",
}

_REVERSE_COMPONENT_MAP = {v: k for k, v in _HARDWARE_COMPONENT_MAP.items()}


class TicketApprovalRequest(BaseModel):
    ticketId: str
    deskLocation: str
    assetItem: str
    assetCondition: str
    description: str = ""
    monitorLocation: Optional[str] = None


@router.post("/ticket-approved")
async def ticket_approved(
    request: TicketApprovalRequest,
    x_api_token: str = Header(...)
):
    print(f"ENDPOINT /api/ticket-approved EJECUTADO")

    monitor_location = request.monitorLocation
    if monitor_location is None or monitor_location == 'None' or monitor_location == '':
        monitor_location = None

    api_key = os.getenv("INVENTORY_API_KEY", "")
    if x_api_token != api_key:
        raise HTTPException(status_code=401, detail="No autorizado")

    valid_conditions = ['Return', 'Damage', 'Missing']
    if request.assetCondition not in valid_conditions:
        raise HTTPException(status_code=400, detail="Asset condition no válido")

    db: Session = SessionLocal()

    try:
        todos_en_estacion = db.query(Almacen).filter(
            Almacen.Destino == request.deskLocation
        ).all()
        for a in todos_en_estacion:
            logger.info(f"   - ID:{a.ID} | Item:'{a.Item}' | Serial:{a.Serial} | Fecha_Salida:{a.Fecha_Salida} | Monitor:{a.Monitor_Location}")

        query = db.query(Almacen).filter(
            Almacen.Item.ilike(f"%{request.assetItem.strip()}%"),
            Almacen.Destino == request.deskLocation.strip(),
            Almacen.Fecha_Salida == None
        )

        if monitor_location:  
            query = query.filter(Almacen.Monitor_Location.ilike(f"%{monitor_location}%"))

        activo_retornado = query.first()

        if not activo_retornado and monitor_location:
            activo_retornado = db.query(Almacen).filter(
                Almacen.Item.ilike(f"%{request.assetItem.strip()}%"),
                Almacen.Destino == request.deskLocation.strip(),
                Almacen.Fecha_Salida == None
            ).first()

        if not activo_retornado:
            activo_retornado = db.query(Almacen).filter(
                Almacen.Item.ilike(f"%{request.assetItem.strip()}%"),
                Almacen.Destino == request.deskLocation.strip()
            ).first()

        if not activo_retornado and request.assetItem in _REVERSE_COMPONENT_MAP:
            component_key = _REVERSE_COMPONENT_MAP[request.assetItem]
            activo_retornado = db.query(Almacen).filter(
                Almacen.Item.ilike(f"%{component_key}%"),
                Almacen.Destino == request.deskLocation.strip(),
                Almacen.Fecha_Salida == None
            ).first()

            if monitor_location and activo_retornado:
                if activo_retornado.Monitor_Location and monitor_location.lower() not in activo_retornado.Monitor_Location.lower():
                    activo_retornado = None

        if not activo_retornado:
            disponibles = [a for a in todos_en_estacion if a.Fecha_Salida is None]
            raise HTTPException(
                status_code=404,
                detail=f"No se encontró '{request.assetItem}' en {request.deskLocation}"
            )

        item_tipo = activo_retornado.Item
        activo_retornado.Fecha_Salida = None
        activo_retornado.Destino = None
        activo_retornado.Tipo_Retorno = request.assetCondition
        activo_retornado.Observaciones_Retorno = request.description or f"Ticket #{request.ticketId}"
        activo_retornado.Sede_Actual = None
        db.commit()
        db.refresh(activo_retornado)

        # Reemplazo automático
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
        elif request.assetCondition in ['Damage', 'Missing']:
            response_data["warning"] = "No hay activo de reemplazo disponible"

        return response_data

    except HTTPException as he:
        db.rollback()
        logger.error(f"HTTPException: {he.detail}")
        raise he
    except Exception as e:
        db.rollback()
        logger.error(f"Error interno: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
    finally:
        db.close()


@router.get("/test")
async def test_webhook():
    return {"status": "ok", "message": "ticket_webhook router is working"}