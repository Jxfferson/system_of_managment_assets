from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError
import logging

from app.config.database import Base, engine
from app.routers import almacen, ticket_webhook, scanner, analytics

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(
    title="OTD Inventory Management",
    description="Sistema de Gestión de Activos",
    version="1.0.0",
)


@app.on_event("startup")
def create_tables() -> None:
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Tablas de base de datos creadas/verificadas")
    except OperationalError as exc:
        logger.warning(f"Skipping database initialization on startup: {exc}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "API InventarioColombiaIT funcionando correctamente"}

@app.get("/api/almacen/trm-tiempo-real")
async def get_trm_tiempo_real():
    """
    Obtiene Uusd y cop (sin scraping).
    """
    import httpx
    from datetime import datetime
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            
            # API 1: Exchangerate-API (Funciona 100%)
            res = await client.get("https://api.exchangerate-api.com/v4/latest/USD")
            if res.status_code == 200:
                data = res.json()
                cop = data.get("rates", {}).get("COP")
                if cop and 3000 < cop < 6000:
                    return {
                        "valor": cop,
                        "fuente": "exchangerate-api.com",
                        "success": True,
                        "timestamp": datetime.now().isoformat()
                    }
            
            # API 2: Fallback (Open Exchange Rates)
            res2 = await client.get("https://open.er-api.com/v6/latest/USD")
            if res2.status_code == 200:
                data2 = res2.json()
                cop2 = data2.get("rates", {}).get("COP")
                if cop2 and 3000 < cop2 < 6000:
                    return {
                        "valor": cop2,
                        "fuente": "open.er-api.com",
                        "success": True,
                        "timestamp": datetime.now().isoformat()
                    }
        
        return {"error": "APIs no respondieron", "valor": 3700, "success": False}
        
    except Exception as e:
        return {"error": str(e), "valor": 3700, "success": False}

# routers
app.include_router(almacen.router)
app.include_router(ticket_webhook.router)
app.include_router(scanner.router)
app.include_router(analytics.router)