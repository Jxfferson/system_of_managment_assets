from fastapi import FastAPI
from app.db.base import Base
from app.db.session import engine
from app.api.activo_routes import router as activo_router

# Crear tablas automáticamente (solo para desarrollo)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Gestión de Activos")

app.include_router(activo_router)

@app.get("/")
def root():
    return {"message": "API funcionando correctamente"}