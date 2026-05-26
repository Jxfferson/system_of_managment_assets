from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from datetime import datetime
import os
from sqlalchemy.orm import Session
from app.config.database import SessionLocal
from app.models.almacen import Almacen
import logging
from typing import Optional  # ← AGREGAR ESTE IMPORT

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
    monitorLocation: Optional[str] = None  # ← CORREGIDO: Optional[str] en lugar de str


@router.post("/ticket-approved")
async def ticket_approved(
    request: TicketApprovalRequest,
    x_api_token: str = Header(...)
):
    print(f"🔔 ENDPOINT /api/ticket-approved EJECUTADO")
    logger.info(f"🎫 WEBHOOK HIT: ticketId={request.ticketId}")
    logger.info(f"📍 deskLocation RECIBIDO: '{request.deskLocation}'")
    logger.info(f"📦 assetItem RECIBIDO: '{request.assetItem}'")
    logger.info(f"🔧 assetCondition: {request.assetCondition}")
    
    # 🔹 CORRECCIÓN CLAVE: Normalizar monitorLocation
    monitor_location = request.monitorLocation
    if monitor_location is None or monitor_location == 'None' or monitor_location == '':
        monitor_location = None
    
    logger.info(f"📡 monitorLocation procesado: '{monitor_location}'")  # Ahora mostrará 'Left', 'Right' o None
    logger.info(f"🔑 Token recibido: '{x_api_token}'")
    logger.info(f"🔑 Token esperado: '{os.getenv('INVENTORY_API_KEY')}'")

    api_key = os.getenv("INVENTORY_API_KEY", "")
    if x_api_token != api_key:
        logger.error("❌ Token inválido")
        raise HTTPException(status_code=401, detail="No autorizado")
    
    valid_conditions = ['Return', 'Damage', 'Missing']
    if request.assetCondition not in valid_conditions:
        logger.error(f"❌ Condición inválida: {request.assetCondition}")
        raise HTTPException(status_code=400, detail="Asset condition no válido")
    
    db: Session = SessionLocal()
    
    try:
        # Mostrar activos en esa estación
        todos_en_estacion = db.query(Almacen).filter(
            Almacen.Destino == request.deskLocation
        ).all()
        logger.info(f"📋 Activos en '{request.deskLocation}':")
        for a in todos_en_estacion:
            logger.info(f"   - ID:{a.ID} | Item:'{a.Item}' | Serial:{a.Serial} | Fecha_Salida:{a.Fecha_Salida} | Monitor:{a.Monitor_Location}")
        
        # 🔹 Búsqueda base: Item + Destino + Disponible
        query = db.query(Almacen).filter(
            Almacen.Item.ilike(f"%{request.assetItem.strip()}%"),
            Almacen.Destino == request.deskLocation.strip(),
            Almacen.Fecha_Salida == None
        )
        
        # 🔹 FILTRO CLAVE: Si el ticket especifica Left/Right, lo aplicamos
        if monitor_location:  # ← Solo si es 'Left' o 'Right' (no None, no 'None', no '')
            query = query.filter(Almacen.Monitor_Location == monitor_location)
            logger.info(f"🎯 Buscando activo con Monitor_Location='{monitor_location}'")
        
        # Ejecutar búsqueda principal
        activo_retornado = query.first()
        
        # 🔹 Fallback 1: Si no encontró con filtro de monitor, buscar sin ese filtro
        if not activo_retornado and monitor_location:
            logger.info(f"⚠️ No se encontró '{request.assetItem}' con Monitor_Location='{monitor_location}'. Buscando cualquier disponible...")
            activo_retornado = db.query(Almacen).filter(
                Almacen.Item.ilike(f"%{request.assetItem.strip()}%"),
                Almacen.Destino == request.deskLocation.strip(),
                Almacen.Fecha_Salida == None
            ).first()
        
        # 🔹 Fallback 2: Buscar incluso si tiene Fecha_Salida (último recurso)
        if not activo_retornado:
            logger.info("🔄 Intentando búsqueda incluyendo activos ya asignados...")
            activo_retornado = db.query(Almacen).filter(
                Almacen.Item.ilike(f"%{request.assetItem.strip()}%"),
                Almacen.Destino == request.deskLocation.strip()
            ).first()
        
        # 🔹 Fallback 3: Por componente (reverse map)
        if not activo_retornado and request.assetItem in _REVERSE_COMPONENT_MAP:
            component_key = _REVERSE_COMPONENT_MAP[request.assetItem]
            logger.info(f"🔄 Fallback por componente: '{component_key}'")
            activo_retornado = db.query(Almacen).filter(
                Almacen.Item.ilike(f"%{component_key}%"),
                Almacen.Destino == request.deskLocation.strip(),
                Almacen.Fecha_Salida == None
            ).first()
            # Si tiene monitorLocation, aplicarlo también en este fallback
            if monitor_location and activo_retornado:
                if activo_retornado.Monitor_Location != monitor_location:
                    logger.info(f"⚠️ Activo encontrado pero Monitor_Location no coincide")
                    activo_retornado = None  # Forzar que no lo tome si no coincide
        
        if not activo_retornado:
            logger.error(f"❌ NO se encontró '{request.assetItem}' en '{request.deskLocation}'")
            disponibles = [a for a in todos_en_estacion if a.Fecha_Salida is None]
            logger.info(f"✅ Disponibles: {[a.Item for a in disponibles]}")
            raise HTTPException(
                status_code=404, 
                detail=f"No se encontró '{request.assetItem}' en {request.deskLocation}"
            )
        
        logger.info(f"✅ Activo ENCONTRADO: ID={activo_retornado.ID}, Serial={activo_retornado.Serial}, Monitor={activo_retornado.Monitor_Location}")
        
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