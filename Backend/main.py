from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.database import engine, Base
from app.routers import almacen
from app.routers import ticket_webhook
import httpx
from bs4 import BeautifulSoup
import re
from datetime import datetime

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API InventarioColombiaIT",
    description="Sistema de Gestión de Activos",
    version="1.0.0",
)

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
    Obtiene USD/COP usando SOLO APIs confiables (sin scraping).
    """
    import httpx
    from datetime import datetime
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            
            # 🔹 API 1: Exchangerate-API (Funciona 100%)
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
            
            # 🔹 API 2: Fallback (Open Exchange Rates)
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

app.include_router(almacen.router)
app.include_router(ticket_webhook.router)