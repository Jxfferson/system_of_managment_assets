from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.database import engine, Base
from app.routers import almacen

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API InventarioColombiaIT",
    description="Sistema de Gestión de Activos",
    version="1.0.0",
)

# CORS - permite peticiones desde el Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/")
def root():
    return {"message": "API InventarioColombiaIT funcionando correctamente"}

# Registrar rutas
app.include_router(almacen.router)