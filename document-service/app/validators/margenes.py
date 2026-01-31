from docx import Document
from docx.shared import Cm, Twips
from typing import List
from ..models import ValidacionItem, Severidad
from ..config import get_settings


def twips_to_cm(twips: int) -> float:
    """Convertir twips a centímetros"""
    return twips / 567.0


def validar_margenes(doc: Document) -> List[ValidacionItem]:
    """
    Valida los márgenes del documento según la Guía UNAP 2.0:
    - Superior: 3.5 cm
    - Inferior: 2.5 cm
    - Izquierdo: 2.5 cm
    - Derecho: 2.5 cm
    """
    settings = get_settings()
    resultados = []
    tolerancia = 0.2  # tolerancia de 2mm

    for i, section in enumerate(doc.sections):
        section_name = f"Sección {i + 1}" if len(doc.sections) > 1 else "Documento"

        # Margen superior
        margin_top = twips_to_cm(section.top_margin.twips) if section.top_margin else 0
        es_valido_top = abs(margin_top - settings.margin_top_cm) <= tolerancia
        resultados.append(
            ValidacionItem(
                tipo="Margen",
                categoria="Superior",
                elemento=section_name,
                es_valido=es_valido_top,
                valor_actual=f"{margin_top:.2f} cm",
                valor_esperado=f"{settings.margin_top_cm} cm",
                mensaje=f"Margen superior: {margin_top:.2f} cm"
                if es_valido_top
                else f"Margen superior incorrecto: {margin_top:.2f} cm (esperado: {settings.margin_top_cm} cm)",
                severidad=Severidad.ERROR if not es_valido_top else Severidad.SUGERENCIA,
                sugerencia=f"Ajustar margen superior a {settings.margin_top_cm} cm"
                if not es_valido_top
                else None,
            )
        )

        # Margen inferior
        margin_bottom = (
            twips_to_cm(section.bottom_margin.twips) if section.bottom_margin else 0
        )
        es_valido_bottom = abs(margin_bottom - settings.margin_bottom_cm) <= tolerancia
        resultados.append(
            ValidacionItem(
                tipo="Margen",
                categoria="Inferior",
                elemento=section_name,
                es_valido=es_valido_bottom,
                valor_actual=f"{margin_bottom:.2f} cm",
                valor_esperado=f"{settings.margin_bottom_cm} cm",
                mensaje=f"Margen inferior: {margin_bottom:.2f} cm"
                if es_valido_bottom
                else f"Margen inferior incorrecto: {margin_bottom:.2f} cm (esperado: {settings.margin_bottom_cm} cm)",
                severidad=Severidad.ERROR if not es_valido_bottom else Severidad.SUGERENCIA,
                sugerencia=f"Ajustar margen inferior a {settings.margin_bottom_cm} cm"
                if not es_valido_bottom
                else None,
            )
        )

        # Margen izquierdo
        margin_left = (
            twips_to_cm(section.left_margin.twips) if section.left_margin else 0
        )
        es_valido_left = abs(margin_left - settings.margin_left_cm) <= tolerancia
        resultados.append(
            ValidacionItem(
                tipo="Margen",
                categoria="Izquierdo",
                elemento=section_name,
                es_valido=es_valido_left,
                valor_actual=f"{margin_left:.2f} cm",
                valor_esperado=f"{settings.margin_left_cm} cm",
                mensaje=f"Margen izquierdo: {margin_left:.2f} cm"
                if es_valido_left
                else f"Margen izquierdo incorrecto: {margin_left:.2f} cm (esperado: {settings.margin_left_cm} cm)",
                severidad=Severidad.ERROR if not es_valido_left else Severidad.SUGERENCIA,
                sugerencia=f"Ajustar margen izquierdo a {settings.margin_left_cm} cm"
                if not es_valido_left
                else None,
            )
        )

        # Margen derecho
        margin_right = (
            twips_to_cm(section.right_margin.twips) if section.right_margin else 0
        )
        es_valido_right = abs(margin_right - settings.margin_right_cm) <= tolerancia
        resultados.append(
            ValidacionItem(
                tipo="Margen",
                categoria="Derecho",
                elemento=section_name,
                es_valido=es_valido_right,
                valor_actual=f"{margin_right:.2f} cm",
                valor_esperado=f"{settings.margin_right_cm} cm",
                mensaje=f"Margen derecho: {margin_right:.2f} cm"
                if es_valido_right
                else f"Margen derecho incorrecto: {margin_right:.2f} cm (esperado: {settings.margin_right_cm} cm)",
                severidad=Severidad.ERROR if not es_valido_right else Severidad.SUGERENCIA,
                sugerencia=f"Ajustar margen derecho a {settings.margin_right_cm} cm"
                if not es_valido_right
                else None,
            )
        )

        # Tamaño de página (A4)
        page_width = (
            twips_to_cm(section.page_width.twips) if section.page_width else 0
        )
        page_height = (
            twips_to_cm(section.page_height.twips) if section.page_height else 0
        )
        es_a4 = (
            abs(page_width - settings.page_width_cm) <= 0.5
            and abs(page_height - settings.page_height_cm) <= 0.5
        )
        resultados.append(
            ValidacionItem(
                tipo="Página",
                categoria="Tamaño",
                elemento=section_name,
                es_valido=es_a4,
                valor_actual=f"{page_width:.1f} x {page_height:.1f} cm",
                valor_esperado=f"{settings.page_width_cm} x {settings.page_height_cm} cm (A4)",
                mensaje="Tamaño de página correcto (A4)"
                if es_a4
                else f"Tamaño de página incorrecto: {page_width:.1f} x {page_height:.1f} cm",
                severidad=Severidad.ERROR if not es_a4 else Severidad.SUGERENCIA,
                sugerencia="Cambiar tamaño de página a A4 (21 x 29.7 cm)"
                if not es_a4
                else None,
            )
        )

    return resultados
