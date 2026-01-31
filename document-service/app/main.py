from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from docx import Document
import tempfile
import os
from typing import Optional

from .models import ValidacionResultado, FormateoResultado
from .validators import validar_documento_completo
from .formatters import formatear_documento
from .config import get_settings

app = FastAPI(
    title="Document Service - Sistema de Tesis UNAP",
    description="Servicio de validación y formateo de documentos según Guía UNAP 2.0",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Document Service - Sistema de Tesis UNAP"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/validar", response_model=ValidacionResultado)
async def validar_documento(file: UploadFile = File(...)):
    """
    Valida un documento Word (.docx) según la Guía UNAP 2.0.

    Verifica:
    - Márgenes (3.5/2.5/2.5/2.5 cm)
    - Tamaño de página (A4)
    - Fuente (Times New Roman, 12pt)
    - Interlineado (2.0)
    - Sangría primera línea (1.25 cm)
    - Estructura de capítulos
    - Secciones obligatorias
    """
    if not file.filename.endswith(".docx"):
        raise HTTPException(
            status_code=400,
            detail="Solo se permiten archivos .docx"
        )

    try:
        # Guardar archivo temporal
        with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Cargar y validar documento
        doc = Document(tmp_path)
        resultado = validar_documento_completo(doc)

        # Limpiar archivo temporal
        os.unlink(tmp_path)

        return resultado

    except Exception as e:
        # Asegurar limpieza del archivo temporal
        if 'tmp_path' in locals():
            try:
                os.unlink(tmp_path)
            except:
                pass

        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar el documento: {str(e)}"
        )


@app.post("/formatear", response_model=FormateoResultado)
async def formatear_documento_endpoint(
    file: UploadFile = File(...),
    titulo: Optional[str] = None,
    autor: Optional[str] = None,
):
    """
    Aplica el formato correcto según la Guía UNAP 2.0 a un documento Word.

    Aplica:
    - Márgenes correctos
    - Fuente Times New Roman 12pt
    - Interlineado doble
    - Sangría de primera línea
    - Formato de títulos
    """
    if not file.filename.endswith(".docx"):
        raise HTTPException(
            status_code=400,
            detail="Solo se permiten archivos .docx"
        )

    try:
        # Guardar archivo temporal de entrada
        with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp_in:
            content = await file.read()
            tmp_in.write(content)
            tmp_in_path = tmp_in.name

        # Crear ruta para archivo de salida
        tmp_out_path = tmp_in_path.replace(".docx", "_formateado.docx")

        # Cargar documento
        doc = Document(tmp_in_path)

        # Aplicar formateo
        datos = {}
        if titulo:
            datos["titulo"] = titulo
        if autor:
            datos["autor"] = autor

        resultado = formatear_documento(doc, tmp_out_path, datos)

        # Limpiar archivo de entrada
        os.unlink(tmp_in_path)

        return resultado

    except Exception as e:
        # Asegurar limpieza
        if 'tmp_in_path' in locals():
            try:
                os.unlink(tmp_in_path)
            except:
                pass

        raise HTTPException(
            status_code=500,
            detail=f"Error al formatear el documento: {str(e)}"
        )


@app.get("/config")
async def get_config():
    """Retorna la configuración de formato actual"""
    settings = get_settings()
    return {
        "pagina": {
            "ancho_cm": settings.page_width_cm,
            "alto_cm": settings.page_height_cm,
        },
        "margenes": {
            "superior_cm": settings.margin_top_cm,
            "inferior_cm": settings.margin_bottom_cm,
            "izquierdo_cm": settings.margin_left_cm,
            "derecho_cm": settings.margin_right_cm,
        },
        "fuente": {
            "nombre": settings.font_name,
            "tamano_pt": settings.font_size_pt,
        },
        "parrafo": {
            "interlineado": settings.line_spacing,
            "sangria_primera_linea_cm": settings.first_line_indent_cm,
        },
    }
