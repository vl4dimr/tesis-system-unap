from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from typing import List
from ..config import get_settings


def generar_indices(doc: Document) -> List[str]:
    """
    Formatea las secciones de índices del documento.

    Incluye:
    - Índice de contenidos
    - Índice de tablas
    - Índice de figuras
    - Lista de acrónimos
    """
    settings = get_settings()
    cambios = []

    # Palabras clave para detectar secciones de índice
    palabras_indice = [
        "INDICE",
        "ÍNDICE",
        "CONTENIDO",
        "TABLA DE CONTENIDO",
        "LISTA DE TABLAS",
        "LISTA DE FIGURAS",
        "LISTA DE CUADROS",
        "LISTA DE GRAFICOS",
        "LISTA DE ANEXOS",
        "ACRÓNIMOS",
        "ACRONIMOS",
        "ABREVIATURAS",
    ]

    indices_encontrados = []
    en_seccion_indice = False

    for para in doc.paragraphs:
        texto = para.text.strip().upper()

        # Detectar inicio de sección de índice
        if any(palabra in texto for palabra in palabras_indice) and len(texto) < 50:
            en_seccion_indice = True
            indices_encontrados.append(texto)

            # Formatear título del índice
            para.alignment = WD_ALIGN_PARAGRAPH.CENTER
            para.paragraph_format.first_line_indent = Cm(0)
            para.paragraph_format.space_before = Pt(18)
            para.paragraph_format.space_after = Pt(12)

            for run in para.runs:
                run.font.name = settings.font_name
                run.font.size = Pt(14)
                run.font.bold = True

            continue

        # Si estamos en sección de índice, formatear entradas
        if en_seccion_indice and texto:
            # Las entradas del índice no tienen sangría
            para.paragraph_format.first_line_indent = Cm(0)

            # Detectar si es una entrada de índice (contiene números de página)
            tiene_numero = any(c.isdigit() for c in texto[-10:]) if texto else False

            if tiene_numero:
                # Es una entrada de índice
                for run in para.runs:
                    run.font.name = settings.font_name
                    run.font.size = Pt(12)

            # Detectar fin de sección de índice
            if texto.startswith("CAPITULO") or texto.startswith("CAPÍTULO"):
                en_seccion_indice = False

    if indices_encontrados:
        cambios.append(f"Índices formateados: {', '.join(indices_encontrados[:3])}")
    else:
        cambios.append("No se encontraron secciones de índice")

    return cambios
