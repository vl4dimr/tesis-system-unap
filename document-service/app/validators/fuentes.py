from docx import Document
from docx.shared import Pt
from typing import List, Dict
from collections import Counter
from ..models import ValidacionItem, Severidad
from ..config import get_settings


def validar_fuentes(doc: Document) -> List[ValidacionItem]:
    """
    Valida las fuentes del documento según la Guía UNAP 2.0:
    - Fuente: Times New Roman
    - Tamaño: 12pt (texto normal)
    """
    settings = get_settings()
    resultados = []

    # Contadores para estadísticas
    fuentes_encontradas: Counter = Counter()
    tamanos_encontrados: Counter = Counter()
    parrafos_con_error_fuente = []
    parrafos_con_error_tamano = []

    for i, para in enumerate(doc.paragraphs):
        if not para.text.strip():
            continue

        for run in para.runs:
            if not run.text.strip():
                continue

            # Verificar fuente
            font_name = run.font.name
            if font_name:
                fuentes_encontradas[font_name] += 1
                if font_name != settings.font_name:
                    parrafos_con_error_fuente.append(
                        {
                            "parrafo": i + 1,
                            "texto": run.text[:50],
                            "fuente": font_name,
                        }
                    )

            # Verificar tamaño
            font_size = run.font.size
            if font_size:
                size_pt = font_size.pt
                tamanos_encontrados[size_pt] += 1
                # Permitir variación para títulos (14, 16pt) y notas (10pt)
                if size_pt not in [10, 12, 14, 16, 18]:
                    parrafos_con_error_tamano.append(
                        {
                            "parrafo": i + 1,
                            "texto": run.text[:50],
                            "tamano": size_pt,
                        }
                    )

    # Resumen de fuentes
    fuente_principal = fuentes_encontradas.most_common(1)
    if fuente_principal:
        nombre_fuente, conteo = fuente_principal[0]
        es_correcta = nombre_fuente == settings.font_name
        total_fuentes = sum(fuentes_encontradas.values())
        porcentaje = (conteo / total_fuentes * 100) if total_fuentes > 0 else 0

        resultados.append(
            ValidacionItem(
                tipo="Fuente",
                categoria="Principal",
                es_valido=es_correcta and porcentaje > 90,
                valor_actual=f"{nombre_fuente} ({porcentaje:.1f}%)",
                valor_esperado=settings.font_name,
                mensaje=f"Fuente principal: {nombre_fuente}"
                if es_correcta
                else f"Fuente incorrecta: {nombre_fuente} (esperado: {settings.font_name})",
                severidad=Severidad.ERROR if not es_correcta else Severidad.SUGERENCIA,
                sugerencia=f"Cambiar fuente a {settings.font_name}" if not es_correcta else None,
            )
        )

    # Verificar si hay múltiples fuentes
    if len(fuentes_encontradas) > 2:
        fuentes_lista = ", ".join(
            [f"{f} ({c})" for f, c in fuentes_encontradas.most_common(5)]
        )
        resultados.append(
            ValidacionItem(
                tipo="Fuente",
                categoria="Consistencia",
                es_valido=False,
                valor_actual=f"{len(fuentes_encontradas)} fuentes diferentes",
                valor_esperado="1-2 fuentes",
                mensaje=f"Se encontraron múltiples fuentes: {fuentes_lista}",
                severidad=Severidad.ADVERTENCIA,
                sugerencia="Unificar fuentes usando Times New Roman",
            )
        )

    # Resumen de tamaños
    tamano_principal = tamanos_encontrados.most_common(1)
    if tamano_principal:
        tamano, conteo = tamano_principal[0]
        es_correcto = tamano == settings.font_size_pt
        total_tamanos = sum(tamanos_encontrados.values())
        porcentaje = (conteo / total_tamanos * 100) if total_tamanos > 0 else 0

        resultados.append(
            ValidacionItem(
                tipo="Fuente",
                categoria="Tamaño",
                es_valido=es_correcto and porcentaje > 80,
                valor_actual=f"{tamano}pt ({porcentaje:.1f}%)",
                valor_esperado=f"{settings.font_size_pt}pt",
                mensaje=f"Tamaño principal: {tamano}pt"
                if es_correcto
                else f"Tamaño incorrecto: {tamano}pt (esperado: {settings.font_size_pt}pt)",
                severidad=Severidad.ERROR if not es_correcto else Severidad.SUGERENCIA,
                sugerencia=f"Ajustar tamaño de fuente a {settings.font_size_pt}pt"
                if not es_correcto
                else None,
            )
        )

    # Errores específicos (limitados a los primeros 5)
    if parrafos_con_error_fuente:
        for error in parrafos_con_error_fuente[:3]:
            resultados.append(
                ValidacionItem(
                    tipo="Fuente",
                    categoria="Error específico",
                    elemento=f"Párrafo {error['parrafo']}",
                    es_valido=False,
                    valor_actual=error["fuente"],
                    valor_esperado=settings.font_name,
                    mensaje=f"Fuente incorrecta en párrafo {error['parrafo']}: '{error['texto']}...'",
                    severidad=Severidad.ERROR,
                    sugerencia=f"Cambiar fuente a {settings.font_name}",
                )
            )

        if len(parrafos_con_error_fuente) > 3:
            resultados.append(
                ValidacionItem(
                    tipo="Fuente",
                    categoria="Resumen errores",
                    es_valido=False,
                    mensaje=f"Se encontraron {len(parrafos_con_error_fuente)} párrafos con fuente incorrecta",
                    severidad=Severidad.ADVERTENCIA,
                    sugerencia="Seleccionar todo el texto y aplicar Times New Roman",
                )
            )

    return resultados
