from docx import Document
from typing import List
from ..models import ValidacionItem, ValidacionResultado, Severidad
from .margenes import validar_margenes
from .fuentes import validar_fuentes
from .interlineado import validar_interlineado
from .estructura import validar_estructura


def validar_documento_completo(doc: Document) -> ValidacionResultado:
    """
    Ejecuta todas las validaciones del documento y genera un resultado completo.
    """
    todos_los_items: List[ValidacionItem] = []

    # Ejecutar todas las validaciones
    todos_los_items.extend(validar_margenes(doc))
    todos_los_items.extend(validar_fuentes(doc))
    todos_los_items.extend(validar_interlineado(doc))
    todos_los_items.extend(validar_estructura(doc))

    # Calcular estadísticas
    total = len(todos_los_items)
    validos = sum(1 for item in todos_los_items if item.es_valido)
    errores = sum(
        1
        for item in todos_los_items
        if not item.es_valido and item.severidad == Severidad.ERROR
    )
    advertencias = sum(
        1
        for item in todos_los_items
        if not item.es_valido and item.severidad == Severidad.ADVERTENCIA
    )
    sugerencias = sum(
        1
        for item in todos_los_items
        if item.severidad == Severidad.SUGERENCIA
    )

    # Calcular porcentaje de cumplimiento
    # Ponderar: errores pesan más que advertencias
    if total > 0:
        peso_total = 0
        peso_cumplido = 0
        for item in todos_los_items:
            if item.severidad == Severidad.ERROR:
                peso = 3
            elif item.severidad == Severidad.ADVERTENCIA:
                peso = 2
            else:
                peso = 1

            peso_total += peso
            if item.es_valido:
                peso_cumplido += peso

        porcentaje = (peso_cumplido / peso_total * 100) if peso_total > 0 else 0
    else:
        porcentaje = 0

    # El documento es válido si no hay errores críticos
    es_valido = errores == 0

    return ValidacionResultado(
        es_valido=es_valido,
        porcentaje_cumplimiento=round(porcentaje, 2),
        total_validaciones=total,
        errores=errores,
        advertencias=advertencias,
        sugerencias=sugerencias,
        items=todos_los_items,
    )
