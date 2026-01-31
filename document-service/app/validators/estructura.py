from docx import Document
from typing import List, Set
import re
from ..models import ValidacionItem, Severidad


# Secciones obligatorias según Guía UNAP 2.0
SECCIONES_OBLIGATORIAS = [
    "RESUMEN",
    "ABSTRACT",
    "INTRODUCCION",
    "REVISION DE LITERATURA",
    "MATERIALES Y METODOS",
    "RESULTADOS Y DISCUSION",
    "CONCLUSIONES",
    "RECOMENDACIONES",
    "REFERENCIAS BIBLIOGRAFICAS",
]

# Patrones para detectar capítulos
PATRON_CAPITULO = re.compile(
    r"^(CAPITULO|CAPÍTULO)\s+(I|II|III|IV|V|VI|VII|VIII|IX|X|\d+)",
    re.IGNORECASE,
)

# Estructura esperada de capítulos
CAPITULOS_ESPERADOS = [
    ("I", "INTRODUCCION"),
    ("II", "REVISION DE LITERATURA"),
    ("III", "MATERIALES Y METODOS"),
    ("IV", "RESULTADOS Y DISCUSION"),
    ("V", "CONCLUSIONES"),
]


def normalizar_texto(texto: str) -> str:
    """Normaliza texto para comparación"""
    texto = texto.upper().strip()
    # Remover acentos comunes
    texto = texto.replace("Á", "A").replace("É", "E").replace("Í", "I")
    texto = texto.replace("Ó", "O").replace("Ú", "U").replace("Ñ", "N")
    return texto


def validar_estructura(doc: Document) -> List[ValidacionItem]:
    """
    Valida la estructura del documento según la Guía UNAP 2.0:
    - Capítulos I, II, III, IV, V
    - Secciones obligatorias
    - Niveles de títulos
    """
    resultados = []

    # Extraer todos los títulos/encabezados del documento
    titulos_encontrados: List[str] = []
    capitulos_encontrados: List[str] = []
    secciones_encontradas: Set[str] = set()

    for para in doc.paragraphs:
        texto = para.text.strip()
        if not texto:
            continue

        texto_normalizado = normalizar_texto(texto)

        # Detectar si es un título (basado en estilo o formato)
        es_titulo = False
        if para.style and para.style.name:
            style_name = para.style.name.lower()
            if "heading" in style_name or "titulo" in style_name:
                es_titulo = True

        # Detectar por formato (todo mayúsculas, negrita, etc.)
        if texto.isupper() and len(texto) < 100:
            es_titulo = True

        # Detectar capítulos
        match_capitulo = PATRON_CAPITULO.match(texto)
        if match_capitulo:
            capitulos_encontrados.append(texto)
            es_titulo = True

        if es_titulo:
            titulos_encontrados.append(texto)

            # Verificar secciones obligatorias
            for seccion in SECCIONES_OBLIGATORIAS:
                if seccion in texto_normalizado or texto_normalizado in seccion:
                    secciones_encontradas.add(seccion)

    # Validar presencia de capítulos
    capitulos_numeros = []
    for cap in capitulos_encontrados:
        match = PATRON_CAPITULO.match(cap)
        if match:
            numero = match.group(2)
            capitulos_numeros.append(numero)

    if capitulos_numeros:
        resultados.append(
            ValidacionItem(
                tipo="Estructura",
                categoria="Capítulos",
                es_valido=len(capitulos_numeros) >= 4,
                valor_actual=f"{len(capitulos_numeros)} capítulos: {', '.join(capitulos_numeros)}",
                valor_esperado="Mínimo 4 capítulos (I-IV o más)",
                mensaje=f"Se encontraron {len(capitulos_numeros)} capítulos"
                if len(capitulos_numeros) >= 4
                else f"Faltan capítulos: solo se encontraron {len(capitulos_numeros)}",
                severidad=Severidad.ERROR if len(capitulos_numeros) < 4 else Severidad.SUGERENCIA,
                sugerencia="Verificar que todos los capítulos estén correctamente numerados"
                if len(capitulos_numeros) < 4
                else None,
            )
        )

        # Verificar secuencia de capítulos
        secuencia_esperada = ["I", "II", "III", "IV", "V"]
        secuencia_correcta = True
        for i, esperado in enumerate(secuencia_esperada[: len(capitulos_numeros)]):
            if i < len(capitulos_numeros) and capitulos_numeros[i] != esperado:
                secuencia_correcta = False
                break

        if not secuencia_correcta:
            resultados.append(
                ValidacionItem(
                    tipo="Estructura",
                    categoria="Numeración",
                    es_valido=False,
                    valor_actual=", ".join(capitulos_numeros),
                    valor_esperado="I, II, III, IV, V",
                    mensaje="La numeración de capítulos no es secuencial",
                    severidad=Severidad.ADVERTENCIA,
                    sugerencia="Verificar que los capítulos sigan la secuencia I, II, III, IV, V",
                )
            )
    else:
        resultados.append(
            ValidacionItem(
                tipo="Estructura",
                categoria="Capítulos",
                es_valido=False,
                valor_actual="No encontrados",
                valor_esperado="CAPITULO I, II, III, IV, V",
                mensaje="No se detectaron capítulos en el documento",
                severidad=Severidad.ERROR,
                sugerencia="Agregar títulos de capítulos con formato: CAPITULO I, CAPITULO II, etc.",
            )
        )

    # Validar secciones obligatorias
    secciones_faltantes = []
    for seccion in SECCIONES_OBLIGATORIAS:
        if seccion not in secciones_encontradas:
            secciones_faltantes.append(seccion)

    if secciones_faltantes:
        resultados.append(
            ValidacionItem(
                tipo="Estructura",
                categoria="Secciones",
                es_valido=False,
                valor_actual=f"{len(SECCIONES_OBLIGATORIAS) - len(secciones_faltantes)}/{len(SECCIONES_OBLIGATORIAS)} secciones",
                valor_esperado="Todas las secciones obligatorias",
                mensaje=f"Secciones faltantes: {', '.join(secciones_faltantes[:5])}",
                severidad=Severidad.ERROR,
                sugerencia="Agregar las secciones faltantes según la Guía UNAP 2.0",
            )
        )
    else:
        resultados.append(
            ValidacionItem(
                tipo="Estructura",
                categoria="Secciones",
                es_valido=True,
                valor_actual=f"{len(SECCIONES_OBLIGATORIAS)}/{len(SECCIONES_OBLIGATORIAS)} secciones",
                valor_esperado="Todas las secciones obligatorias",
                mensaje="Todas las secciones obligatorias están presentes",
                severidad=Severidad.SUGERENCIA,
            )
        )

    # Validar presencia de RESUMEN y ABSTRACT
    tiene_resumen = "RESUMEN" in secciones_encontradas
    tiene_abstract = "ABSTRACT" in secciones_encontradas

    if not tiene_resumen:
        resultados.append(
            ValidacionItem(
                tipo="Estructura",
                categoria="Resumen",
                es_valido=False,
                mensaje="No se encontró la sección RESUMEN",
                severidad=Severidad.ERROR,
                sugerencia="Agregar sección RESUMEN antes del primer capítulo",
            )
        )

    if not tiene_abstract:
        resultados.append(
            ValidacionItem(
                tipo="Estructura",
                categoria="Abstract",
                es_valido=False,
                mensaje="No se encontró la sección ABSTRACT",
                severidad=Severidad.ERROR,
                sugerencia="Agregar sección ABSTRACT después del RESUMEN",
            )
        )

    # Validar presencia de referencias
    tiene_referencias = "REFERENCIAS BIBLIOGRAFICAS" in secciones_encontradas
    if not tiene_referencias:
        # Buscar variantes
        for seccion in secciones_encontradas:
            if "REFERENCIA" in seccion or "BIBLIOGRAFIA" in seccion:
                tiene_referencias = True
                break

    if not tiene_referencias:
        resultados.append(
            ValidacionItem(
                tipo="Estructura",
                categoria="Referencias",
                es_valido=False,
                mensaje="No se encontró la sección de REFERENCIAS BIBLIOGRAFICAS",
                severidad=Severidad.ERROR,
                sugerencia="Agregar sección REFERENCIAS BIBLIOGRAFICAS al final del documento",
            )
        )

    # Verificar cantidad total de títulos/encabezados
    resultados.append(
        ValidacionItem(
            tipo="Estructura",
            categoria="Títulos",
            es_valido=len(titulos_encontrados) >= 10,
            valor_actual=f"{len(titulos_encontrados)} títulos detectados",
            valor_esperado="Mínimo 10 títulos/secciones",
            mensaje=f"Se detectaron {len(titulos_encontrados)} títulos en el documento",
            severidad=Severidad.ADVERTENCIA
            if len(titulos_encontrados) < 10
            else Severidad.SUGERENCIA,
            sugerencia="Verificar que todas las secciones tengan títulos apropiados"
            if len(titulos_encontrados) < 10
            else None,
        )
    )

    return resultados
