from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from typing import List
import re
from ..config import get_settings


# Patrones para detectar diferentes niveles de títulos
PATRON_CAPITULO = re.compile(
    r"^(CAPITULO|CAPÍTULO)\s+(I|II|III|IV|V|VI|VII|VIII|IX|X|\d+)",
    re.IGNORECASE,
)

PATRON_TITULO_NIVEL_1 = re.compile(
    r"^(\d+\.?\s+)?[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]+$"
)

PATRON_TITULO_NIVEL_2 = re.compile(
    r"^(\d+\.\d+\.?\s+).+$"
)

PATRON_TITULO_NIVEL_3 = re.compile(
    r"^(\d+\.\d+\.\d+\.?\s+).+$"
)


def formatear_capitulos(doc: Document) -> List[str]:
    """
    Formatea los capítulos y títulos del documento según niveles jerárquicos.
    """
    settings = get_settings()
    cambios = []
    capitulos_formateados = 0
    titulos_formateados = 0

    for para in doc.paragraphs:
        texto = para.text.strip()
        if not texto:
            continue

        # Detectar y formatear capítulos principales
        if PATRON_CAPITULO.match(texto):
            para.alignment = WD_ALIGN_PARAGRAPH.CENTER
            para.paragraph_format.first_line_indent = Cm(0)
            para.paragraph_format.space_before = Pt(24)
            para.paragraph_format.space_after = Pt(12)

            for run in para.runs:
                run.font.name = settings.font_name
                run.font.size = Pt(16)
                run.font.bold = True
                run.font.all_caps = True

            capitulos_formateados += 1
            continue

        # Detectar si es todo mayúsculas (título de sección)
        if texto.isupper() and len(texto) < 100 and len(texto) > 3:
            para.alignment = WD_ALIGN_PARAGRAPH.CENTER
            para.paragraph_format.first_line_indent = Cm(0)
            para.paragraph_format.space_before = Pt(18)
            para.paragraph_format.space_after = Pt(12)

            for run in para.runs:
                run.font.name = settings.font_name
                run.font.size = Pt(14)
                run.font.bold = True

            titulos_formateados += 1
            continue

        # Detectar títulos con numeración (1.1, 1.2, etc.)
        if PATRON_TITULO_NIVEL_2.match(texto):
            para.alignment = WD_ALIGN_PARAGRAPH.LEFT
            para.paragraph_format.first_line_indent = Cm(0)
            para.paragraph_format.space_before = Pt(12)
            para.paragraph_format.space_after = Pt(6)

            for run in para.runs:
                run.font.name = settings.font_name
                run.font.size = Pt(12)
                run.font.bold = True

            titulos_formateados += 1
            continue

        # Detectar títulos de nivel 3 (1.1.1, 1.1.2, etc.)
        if PATRON_TITULO_NIVEL_3.match(texto):
            para.alignment = WD_ALIGN_PARAGRAPH.LEFT
            para.paragraph_format.first_line_indent = Cm(0)
            para.paragraph_format.space_before = Pt(12)
            para.paragraph_format.space_after = Pt(6)

            for run in para.runs:
                run.font.name = settings.font_name
                run.font.size = Pt(12)
                run.font.bold = True
                run.font.italic = False

            titulos_formateados += 1

    cambios.append(f"Capítulos formateados: {capitulos_formateados}")
    cambios.append(f"Títulos de sección formateados: {titulos_formateados}")

    return cambios
