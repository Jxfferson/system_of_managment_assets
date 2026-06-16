from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from app.config.database import Base
import enum

class ChangeType(enum.Enum):
    ASSIGNED = "ASSIGNED"
    UNASSIGNED = "UNASSIGNED"
    MOVED_FROM = "MOVED_FROM"
    MOVED_TO = "MOVED_TO"

class StationChangeHistory(Base):
    __tablename__ = "station_change_history"

    id_change = Column(Integer, primary_key=True, index=True, autoincrement=True)
    station_code = Column(String(50), nullable=False, index=True)
    asset_serial = Column(String(50), nullable=True)
    asset_name = Column(String(200), nullable=True)
    previous_asset_serial = Column(String(50), nullable=True)
    previous_asset_name = Column(String(200), nullable=True)
    change_type = Column(Enum(ChangeType), nullable=False)
    changed_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    changed_by = Column(Integer, nullable=True) 
    ticket_id = Column(Integer, nullable=True)    
    reviewed_by = Column(Integer, nullable=True)  
    approved_by = Column(Integer, nullable=True)  
    asset_condition = Column(String(50), nullable=True)  