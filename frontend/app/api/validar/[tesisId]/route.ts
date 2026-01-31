import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { downloadFile } from "@/lib/minio"

const DOCUMENT_SERVICE_URL = process.env.DOCUMENT_SERVICE_URL || "http://document-service:8000"

export async function POST(
  req: NextRequest,
  { params }: { params: { tesisId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener tesis
    const tesis = await prisma.tesis.findFirst({
      where: {
        id: params.tesisId,
        userId: session.user.id,
      },
    })

    if (!tesis) {
      return NextResponse.json({ error: "Tesis no encontrada" }, { status: 404 })
    }

    if (!tesis.archivoOriginalUrl) {
      return NextResponse.json(
        { error: "No hay documento cargado" },
        { status: 400 }
      )
    }

    // Actualizar estado a "validando"
    await prisma.tesis.update({
      where: { id: params.tesisId },
      data: { estado: "VALIDANDO" },
    })

    // Descargar archivo de MinIO
    const fileBuffer = await downloadFile(tesis.archivoOriginalUrl)

    // Crear FormData para enviar al servicio Python
    const formData = new FormData()
    const blob = new Blob([fileBuffer], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })
    formData.append("file", blob, tesis.archivoOriginalNombre || "documento.docx")

    // Llamar al servicio de validación
    const validationResponse = await fetch(`${DOCUMENT_SERVICE_URL}/validar`, {
      method: "POST",
      body: formData,
    })

    if (!validationResponse.ok) {
      const error = await validationResponse.json()
      throw new Error(error.detail || "Error en la validación")
    }

    const validationResult = await validationResponse.json()

    // Eliminar validaciones anteriores
    await prisma.validacion.deleteMany({
      where: { tesisId: params.tesisId },
    })

    // Guardar nuevas validaciones
    const validacionesData = validationResult.items.map((item: any) => ({
      tesisId: params.tesisId,
      tipo: item.tipo,
      categoria: item.categoria,
      elemento: item.elemento,
      esValido: item.es_valido,
      valorActual: item.valor_actual,
      valorEsperado: item.valor_esperado,
      mensaje: item.mensaje,
      severidad: item.severidad,
      sugerencia: item.sugerencia,
    }))

    await prisma.validacion.createMany({
      data: validacionesData,
    })

    // Actualizar tesis con resultados
    const estado = validationResult.es_valido ? "VALIDACION_EXITOSA" : "VALIDACION_FALLIDA"

    const updatedTesis = await prisma.tesis.update({
      where: { id: params.tesisId },
      data: {
        estado,
        validacionCompletada: true,
        porcentajeCumplimiento: validationResult.porcentaje_cumplimiento,
      },
    })

    return NextResponse.json({
      ...validationResult,
      tesis: updatedTesis,
    })
  } catch (error) {
    console.error("Error en validación:", error)

    // Revertir estado
    await prisma.tesis.update({
      where: { id: params.tesisId },
      data: { estado: "DOCUMENTO_CARGADO" },
    })

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error en la validación" },
      { status: 500 }
    )
  }
}

// GET - Obtener resultados de validación
export async function GET(
  req: NextRequest,
  { params }: { params: { tesisId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const tesis = await prisma.tesis.findFirst({
      where: {
        id: params.tesisId,
        userId: session.user.id,
      },
      include: {
        validaciones: {
          orderBy: [
            { severidad: "asc" },
            { tipo: "asc" },
          ],
        },
      },
    })

    if (!tesis) {
      return NextResponse.json({ error: "Tesis no encontrada" }, { status: 404 })
    }

    // Agrupar validaciones por tipo
    const porTipo: Record<string, any[]> = {}
    for (const v of tesis.validaciones) {
      if (!porTipo[v.tipo]) {
        porTipo[v.tipo] = []
      }
      porTipo[v.tipo].push(v)
    }

    // Calcular estadísticas
    const total = tesis.validaciones.length
    const validos = tesis.validaciones.filter((v) => v.esValido).length
    const errores = tesis.validaciones.filter(
      (v) => !v.esValido && v.severidad === "ERROR"
    ).length
    const advertencias = tesis.validaciones.filter(
      (v) => !v.esValido && v.severidad === "ADVERTENCIA"
    ).length

    return NextResponse.json({
      tesis: {
        id: tesis.id,
        titulo: tesis.titulo,
        estado: tesis.estado,
        porcentajeCumplimiento: tesis.porcentajeCumplimiento,
      },
      estadisticas: {
        total,
        validos,
        errores,
        advertencias,
        porcentaje: tesis.porcentajeCumplimiento,
      },
      validaciones: tesis.validaciones,
      validacionesPorTipo: porTipo,
    })
  } catch (error) {
    console.error("Error al obtener validaciones:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
