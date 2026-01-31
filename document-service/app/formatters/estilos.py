from docx import Document
from docx.shared import Pt, Cm, Twips
from docx.enum.text import WD_LINE_SPACING, WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from typing import List
from ..config import get_settings


def aplicar_estilos_base(doc: Document) -> List[str]:
    """
    Aplica los estilos base al documento según la Guía UNAP 2.0:
    - Márgenes
    - Tamaño de página
    - Fuente y tamaño
    - Interlineado
    - Sangría
    """
    settings = get_settings()
    cambios = []

    # Aplicar márgenes a todas las secciones
    for section in doc.sections:
        section.page_width = Cm(settings.page_width_cm)
        section.page_height = Cm(settings.page_height_cm)
        section.top_margin = Cm(settings.margin_top_cm)
        section.bottom_margin = Cm(settings.margin_bottom_cm)
        section.left_margin = Cm(settings.margin_left_cm)
        section.right_margin = Cm(settings.margin_right_cm)

    cambios.append(f"Márgenes aplicados: {settings.margin_top_cm}/{settings.margin_bottom_cm}/{settings.margin_left_cm}/{settings.margin_right_cm} cm")
    cambios.append(f"Tamaño de página: A4 ({settings.page_width_cm}x{settings.page_height_cm} cm)")

    # Configurar estilo Normal
    try:
        style_normal = doc.styles['Normal']
        style_normal.font.name = settings.font_name
        style_normal.font.size = Pt(settings.font_size_pt)
        style_normal.paragraph_format.line_spacing = settings.line_spacing
        style_normal.paragraph_format.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
        style_normal.paragraph_format.first_line_indent = Cm(settings.first_line_indent_cm)
        style_normal.paragraph_format.space_after = Pt(0)
        style_normal.paragraph_format.space_before = Pt(0)

        cambios.append(f"Estilo Normal configurado: {settings.font_name} {settings.font_size_pt}pt")
    except KeyError:
        pass

    # Configurar estilos de título
    titulo_configs = [
        ('Heading 1', 16, True),
        ('Heading 2', 14, True),
        ('Heading 3', 12, True),
        ('Heading 4', 12, False),
    ]

    for style_name, size, bold in titulo_configs:
        try:
            style = doc.styles[style_name]
            style.font.name = settings.font_name
            style.font.size = Pt(size)
            style.font.bold = bold
            style.paragraph_format.line_spacing = settings.line_spacing
            style.paragraph_format.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
            style.paragraph_format.first_line_indent = Cm(0)
            style.paragraph_format.space_before = Pt(12)
            style.paragraph_format.space_after = Pt(6)
        except KeyError:
            pass

    cambios.append("Estilos de títulos configurados")

    # Aplicar formato a todos los párrafos
    parrafos_modificados = 0
    for para in doc.paragraphs:
        # Verificar si es un párrafo de texto normal (no título)
        es_titulo = False
        if para.style and para.style.name:
            style_name = para.style.name.lower()
            if 'heading' in style_name or 'titulo' in style_name or 'title' in style_name:
                es_titulo = True

        # Verificar si el texto está en mayúsculas (probable título)
        texto = para.text.strip()
        if texto and texto.isupper() and len(texto) < 100:
            es_titulo = True

        # Aplicar formato
        for run in para.runs:
            run.font.name = settings.font_name
            if not es_titulo:
                run.font.size = Pt(settings.font_size_pt)

        # Configurar párrafo
        pf = para.paragraph_format
        pf.line_spacing = settings.line_spacing
        pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE

        if not es_titulo and texto:
            pf.first_line_indent = Cm(settings.first_line_indent_cm)
        else:
            pf.first_line_indent = Cm(0)

        parrafos_modificados += 1

    cambios.append(f"Formato aplicado a {parrafos_modificados} párrafos")
    cambios.append(f"Interlineado: {settings.line_spacing}")
    cambios.append(f"Sangría primera línea: {settings.first_line_indent_cm} cm")

    return cambios
