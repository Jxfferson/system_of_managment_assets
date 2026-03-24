from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.database import engine, Base
from app.routers import almacen
from app.routers import ticket_webhook  


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


app.include_router(almacen.router)
app.include_router(ticket_webhook.router) 