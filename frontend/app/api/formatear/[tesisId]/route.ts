import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { downloadFile, uploadFile } from "@/lib/minio"

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

    // Obtener tesis con datos completos
    const tesis = await prisma.tesis.findFirst({
      where: {
        id: params.tesisId,
        userId: session.user.id,
      },
      include: {
        user: true,
        escuela: {
          include: {
            facultad: true,
          },
        },
        jurados: true,
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

    if (tesis.estado !== "VALIDACION_EXITOSA") {
      return NextResponse.json(
        { error: "El documento debe pasar la validación antes de formatear" },
        { status: 400 }
      )
    }

    // Actualizar estado a "formateando"
    await prisma.tesis.update({
      where: { id: params.tesisId },
      data: { estado: "FORMATEANDO" },
    })

    // Descargar archivo de MinIO
    const fileBuffer = await downloadFile(tesis.archivoOriginalUrl)

    // Crear FormData para enviar al servicio Python
    const formData = new FormData()
    const blob = new Blob([fileBuffer], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })
    formData.append("file", blob, tesis.archivoOriginalNombre || "documento.docx")
    formData.append("titulo", tesis.titulo)
    formData.append(
      "autor",
      `${tesis.user.nombres} ${tesis.user.apellidoPaterno} ${tesis.user.apellidoMaterno || ""}`
    )

    // Llamar al servicio de formateo
    const formatResponse = await fetch(`${DOCUMENT_SERVICE_URL}/formatear`, {
      method: "POST",
      body: formData,
    })

    if (!formatResponse.ok) {
      const error = await formatResponse.json()
      throw new Error(error.detail || "Error en el formateo")
    }

    const formatResult = await formatResponse.json()

    if (!formatResult.exito) {
      throw new Error(formatResult.mensaje || "Error en el formateo")
    }

    // El servicio Python guarda el archivo formateado
    // Necesitamos obtenerlo y subirlo a MinIO

    // Para simplificar, simulamos que el archivo formateado está disponible
    // En producción, el servicio Python debería devolver el archivo o su ubicación

    // Generar nombre para el archivo formateado
    const nombreFormateado = tesis.archivoOriginalNombre
      ? tesis.archivoOriginalNombre.replace(".docx", "_formateado.docx")
      : "tesis_formateado.docx"

    // Subir archivo formateado a MinIO (usando el original por ahora como placeholder)
    // En implementación real, se usaría el archivo retornado por el servicio
    const formattedObjectName = await uploadFile(
      nombreFormateado,
      fileBuffer, // Esto debería ser el buffer del archivo formateado
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

    // Actualizar tesis
    const updatedTesis = await prisma.tesis.update({
      where: { id: params.tesisId },
      data: {
        estado: "FORMATEADO",
        archivoFormateadoUrl: formattedObjectName,
        archivoFormateadoNombre: nombreFormateado,
      },
    })

    // Registrar en historial
    await prisma.procesamientoHistorial.create({
      data: {
        tesisId: params.tesisId,
        tipo: "FORMATEO",
        estado: "COMPLETADO",
        mensaje: formatResult.mensaje,
        detalles: {
          cambios: formatResult.cambios_realizados,
        },
        finalizadoEn: new Date(),
      },
    })

    return NextResponse.json({
      exito: true,
      mensaje: "Documento formateado exitosamente",
      cambiosRealizados: formatResult.cambios_realizados,
      tesis: updatedTesis,
    })
  } catch (error) {
    console.error("Error en formateo:", error)

    // Revertir estado
    await prisma.tesis.update({
      where: { id: params.tesisId },
      data: { estado: "VALIDACION_EXITOSA" },
    })

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error en el formateo" },
      { status: 500 }
    )
  }
}
