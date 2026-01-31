from .estilos import aplicar_estilos_base
from .portada import generar_portada
from .capitulos import formatear_capitulos
from .indices import generar_indices
from ..models import FormateoResultado
from docx import Document
from typing import Dict, Optional


def formatear_documento(
    doc: Document,
    output_path: str,
    datos: Optional[Dict] = None
) -> FormateoResultado:
    """
    Aplica el formateo completo al documento según la Guía UNAP 2.0.
    """
    cambios_realizados = []

    try:
        # 1. Aplicar estilos base (márgenes, fuente, interlineado)
        cambios_estilos = aplicar_estilos_base(doc)
        cambios_realizados.extend(cambios_estilos)

        # 2. Formatear capítulos y títulos
        cambios_capitulos = formatear_capitulos(doc)
        cambios_realizados.extend(cambios_capitulos)

        # 3. Generar portada si hay datos
        if datos:
            cambios_portada = generar_portada(doc, datos)
            cambios_realizados.extend(cambios_portada)

        # 4. Actualizar índices si existen
        cambios_indices = generar_indices(doc)
        cambios_realizados.extend(cambios_indices)

        # Guardar documento
        doc.save(output_path)

        return FormateoResultado(
            exito=True,
            archivo_formateado=output_path,
            mensaje="Documento formateado exitosamente",
            cambios_realizados=cambios_realizados,
        )

    except Exception as e:
        return FormateoResultado(
            exito=False,
            mensaje=f"Error al formatear: {str(e)}",
            cambios_realizados=cambios_realizados,
        )


__all__ = [
    "formatear_documento",
    "aplicar_estilos_base",
    "generar_portada",
    "formatear_capitulos",
    "generar_indices",
]
