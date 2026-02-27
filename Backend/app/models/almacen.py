from sqlalchemy import Column, Integer, String, Date
from app.config.database import Base


class Almacen(Base):
    __tablename__ = "ALMACEN"

    ID            = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Item          = Column(String(100), nullable=False)
    Serial        = Column(String(50),  nullable=True)
    Fecha_Ingreso = Column(Date,         nullable=False)
    Fecha_Salida  = Column(Date,         nullable=True)
    Destino       = Column(String(50),  nullable=True)
