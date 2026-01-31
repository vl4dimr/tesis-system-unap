from docx import Document
from docx.shared import Pt, Cm, Twips
from docx.enum.text import WD_LINE_SPACING
from typing import List
from collections import Counter
from ..models import ValidacionItem, Severidad
from ..config import get_settings


def twips_to_pt(twips: int) -> float:
    """Convertir twips a puntos"""
    return twips / 20.0


def validar_interlineado(doc: Document) -> List[ValidacionItem]:
    """
    Valida el interlineado del documento según la Guía UNAP 2.0:
    - Interlineado: 2.0 (doble espacio)
    - Sangría primera línea: 1.25 cm
    """
    settings = get_settings()
    resultados = []

    # Contadores
    interlineados: Counter = Counter()
    sangrias: Counter = Counter()
    parrafos_analizados = 0
    parrafos_con_interlineado_correcto = 0
    parrafos_con_sangria_correcta = 0

    tolerancia_sangria = 0.15  # 1.5mm de tolerancia

    for i, para in enumerate(doc.paragraphs):
        if not para.text.strip():
            continue

        parrafos_analizados += 1
        pf = para.paragraph_format

        # Verificar interlineado
        line_spacing = pf.line_spacing
        line_rule = pf.line_spacing_rule

        interlineado_valor = None
        if line_rule == WD_LINE_SPACING.DOUBLE:
            interlineado_valor = 2.0
        elif line_rule == WD_LINE_SPACING.ONE_POINT_FIVE:
            interlineado_valor = 1.5
        elif line_rule == WD_LINE_SPACING.SINGLE:
            interlineado_valor = 1.0
        elif line_rule == WD_LINE_SPACING.MULTIPLE and line_spacing:
            interlineado_valor = line_spacing
        elif line_rule == WD_LINE_SPACING.EXACTLY and line_spacing:
            # Convertir de puntos a múltiplo aproximado (12pt base)
            interlineado_valor = twips_to_pt(line_spacing.twips) / 12.0
        elif line_spacing:
            interlineado_valor = line_spacing

        if interlineado_valor:
            interlineados[round(interlineado_valor, 1)] += 1
            if abs(interlineado_valor - settings.line_spacing) < 0.1:
                parrafos_con_interlineado_correcto += 1

        # Verificar sangría primera línea
        first_line_indent = pf.first_line_indent
        if first_line_indent:
            sangria_cm = first_line_indent.cm if hasattr(first_line_indent, 'cm') else first_line_indent / 360000
            sangrias[round(sangria_cm, 2)] += 1
            if abs(sangria_cm - settings.first_line_indent_cm) <= tolerancia_sangria:
                parrafos_con_sangria_correcta += 1

    # Resultados de interlineado
    if parrafos_analizados > 0:
        porcentaje_interlineado = (
            parrafos_con_interlineado_correcto / parrafos_analizados * 100
        )
        interlineado_principal = interlineados.most_common(1)

        if interlineado_principal:
            valor, conteo = interlineado_principal[0]
            es_correcto = abs(valor - settings.line_spacing) < 0.1

            resultados.append(
                ValidacionItem(
                    tipo="Interlineado",
                    categoria="Principal",
                    es_valido=es_correcto and porcentaje_interlineado > 80,
                    valor_actual=f"{valor}",
                    valor_esperado=f"{settings.line_spacing} (doble espacio)",
                    mensaje=f"Interlineado principal: {valor}"
                    if es_correcto
                    else f"Interlineado incorrecto: {valor} (esperado: {settings.line_spacing})",
                    severidad=Severidad.ERROR if not es_correcto else Severidad.SUGERENCIA,
                    sugerencia="Aplicar interlineado doble (2.0) a todo el documento"
                    if not es_correcto
                    else None,
                )
            )

            # Estadística de cumplimiento
            resultados.append(
                ValidacionItem(
                    tipo="Interlineado",
                    categoria="Cumplimiento",
                    es_valido=porcentaje_interlineado > 80,
                    valor_actual=f"{porcentaje_interlineado:.1f}%",
                    valor_esperado=">80%",
                    mensaje=f"{parrafos_con_interlineado_correcto} de {parrafos_analizados} párrafos tienen interlineado correcto",
                    severidad=Severidad.ADVERTENCIA
                    if porcentaje_interlineado < 80
                    else Severidad.SUGERENCIA,
                    sugerencia="Revisar y corregir interlineado en párrafos restantes"
                    if porcentaje_interlineado < 80
                    else None,
                )
            )

    # Resultados de sangría
    if sangrias:
        sangria_principal = sangrias.most_common(1)
        if sangria_principal:
            valor, conteo = sangria_principal[0]
            es_correcta = abs(valor - settings.first_line_indent_cm) <= tolerancia_sangria

            resultados.append(
                ValidacionItem(
                    tipo="Sangría",
                    categoria="Primera línea",
                    es_valido=es_correcta,
                    valor_actual=f"{valor:.2f} cm",
                    valor_esperado=f"{settings.first_line_indent_cm} cm",
                    mensaje=f"Sangría de primera línea: {valor:.2f} cm"
                    if es_correcta
                    else f"Sangría incorrecta: {valor:.2f} cm (esperado: {settings.first_line_indent_cm} cm)",
                    severidad=Severidad.ERROR if not es_correcta else Severidad.SUGERENCIA,
                    sugerencia=f"Ajustar sangría de primera línea a {settings.first_line_indent_cm} cm"
                    if not es_correcta
                    else None,
                )
            )

    # Verificar espaciado entre párrafos
    espaciados_antes: Counter = Counter()
    espaciados_despues: Counter = Counter()

    for para in doc.paragraphs:
        if not para.text.strip():
            continue

        pf = para.paragraph_format
        if pf.space_before:
            espaciados_antes[pf.space_before.pt if hasattr(pf.space_before, 'pt') else 0] += 1
        if pf.space_after:
            espaciados_despues[pf.space_after.pt if hasattr(pf.space_after, 'pt') else 0] += 1

    # Verificar consistencia de espaciado
    if len(espaciados_despues) > 3:
        resultados.append(
            ValidacionItem(
                tipo="Espaciado",
                categoria="Consistencia",
                es_valido=False,
                valor_actual=f"{len(espaciados_despues)} valores diferentes",
                valor_esperado="Espaciado uniforme",
                mensaje="El espaciado entre párrafos no es consistente",
                severidad=Severidad.ADVERTENCIA,
                sugerencia="Unificar el espaciado posterior de los párrafos",
            )
        )

    return resultados
