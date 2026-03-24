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