from pydantic import BaseModel, field_validator
from datetime import date
from typing import Optional, List


SEDES_PERMITIDAS: List[str] = ["Connecta 80", "Caracol", "American BPS"]


class AlmacenBase(BaseModel):
    Item:                   str
    Serial:                 Optional[str] = None
    Fecha_Ingreso:          date
    Fecha_Salida:           Optional[date] = None
    Destino:                Optional[str] = None
    Tipo_Retorno:           Optional[str] = None
    Observaciones_Retorno:  Optional[str] = None
    Sede_Actual:            Optional[str] = None 
    Monitor_Location:       Optional[str] = None
    
    model_config = {"from_attributes": True}

    @field_validator('Sede_Actual')
    @classmethod
    def validate_sede(cls, v):
        if v is not None and v not in SEDES_PERMITIDAS:
            raise ValueError(f"Sede no válida. Opciones: {', '.join(SEDES_PERMITIDAS)}")
        return v


class AlmacenCreate(AlmacenBase):
    pass


class AlmacenUpdate(BaseModel):
    Item:                   Optional[str] = None
    Serial:                 Optional[str] = None
    Fecha_Ingreso:          Optional[date] = None
    Fecha_Salida:           Optional[date] = None
    Destino:                Optional[str] = None
    Tipo_Retorno:           Optional[str] = None
    Observaciones_Retorno:  Optional[str] = None
    Sede_Actual:            Optional[str] = None
    Monitor_Location:       Optional[str] = None
    
    model_config = {"from_attributes": True}

    @field_validator('Sede_Actual')
    @classmethod
    def validate_sede(cls, v):
        if v is not None and v not in SEDES_PERMITIDAS:
            raise ValueError(f"Sede no válida. Opciones: {', '.join(SEDES_PERMITIDAS)}")
        return v


class AlmacenResponse(AlmacenBase):
    ID: int
    model_config = {"from_attributes": True}


class SedeResponse(BaseModel):
    value: str
    label: str
    model_config = {"from_attributes": True}


class StationHistoryResponse(BaseModel):
    station_code: str
    last_change_at: Optional[str]
    last_change_type: Optional[str]
    current_asset_serial: Optional[str]
    current_asset_name: Optional[str]
    previous_asset_serial: Optional[str]
    previous_asset_name: Optional[str]
    total_changes: int
    
    class Config:
        from_attributes = True



class StationHistoryFullItem(BaseModel):
    id_change: int
    station_code: str
    asset_serial: Optional[str] = None
    asset_name: Optional[str] = None
    previous_asset_serial: Optional[str] = None
    previous_asset_name: Optional[str] = None
    change_type: str
    changed_at: str
    ticket_id: Optional[int] = None
    time_ago: str
    reviewed_by: Optional[str] = None     
    approved_by: Optional[str] = None     
    asset_condition: Optional[str] = None  
    
    class Config:
        from_attributes = True