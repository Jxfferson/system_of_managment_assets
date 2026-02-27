from pydantic import BaseModel
from datetime import date
from typing import Optional


class AlmacenBase(BaseModel):
    Item:          str
    Serial:        Optional[str]  = None
    Fecha_Ingreso: date
    Fecha_Salida:  Optional[date] = None
    Destino:       Optional[str]  = None


class AlmacenCreate(AlmacenBase):
    pass


class AlmacenUpdate(BaseModel):
    Item:          Optional[str]  = None
    Serial:        Optional[str]  = None
    Fecha_Ingreso: Optional[date] = None
    Fecha_Salida:  Optional[date] = None
    Destino:       Optional[str]  = None


class AlmacenResponse(AlmacenBase):
    ID: int

    model_config = {"from_attributes": True}
