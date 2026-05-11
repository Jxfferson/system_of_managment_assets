from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.config.database import Base

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    prefix = Column(String(10), nullable=True)
    price_cop = Column(Float, default=10000.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())