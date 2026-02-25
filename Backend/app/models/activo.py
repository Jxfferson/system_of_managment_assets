from sqlalchemy import Column, Integer, String, Date
from app.db.base import Base

class Activo(Base):
    __tablename__ = "activos"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date)
    marca = Column(String(100))
    tipo = Column(String(100))
    serial = Column(String(100), unique=True)