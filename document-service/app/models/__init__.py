from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class Severidad(str, Enum):
    ERROR = "ERROR"
    ADVERTENCIA = "ADVERTENCIA"
    SUGERENCIA = "SUGERENCIA"


class ValidacionItem(BaseModel):
    tipo: str
    categoria: Optional[str] = None
    elemento: Optional[str] = None
    es_valido: bool
    valor_actual: Optional[str] = None
    valor_esperado: Optional[str] = None
    mensaje: Optional[str] = None
    severidad: Severidad = Severidad.ERROR
    sugerencia: Optional[str] = None


class ValidacionResultado(BaseModel):
    es_valido: bool
    porcentaje_cumplimiento: float
    total_validaciones: int
    errores: int
    advertencias: int
    sugerencias: int
    items: List[ValidacionItem]


class FormateoRequest(BaseModel):
    file_path: str
    datos_tesis: Optional[dict] = None


class FormateoResultado(BaseModel):
    exito: bool
    archivo_formateado: Optional[str] = None
    mensaje: str
    cambios_realizados: List[str] = []
