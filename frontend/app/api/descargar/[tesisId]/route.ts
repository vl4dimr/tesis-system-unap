import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { downloadFile } from "@/lib/minio"

export async function GET(
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

    // Determinar qué archivo descargar
    const { searchParams } = new URL(req.url)
    const tipo = searchParams.get("tipo") || "formateado"

    let archivoUrl: string | null = null
    let archivoNombre: string | null = null

    if (tipo === "formateado" && tesis.archivoFormateadoUrl) {
      archivoUrl = tesis.archivoFormateadoUrl
      archivoNombre = tesis.archivoFormateadoNombre
    } else if (tesis.archivoOriginalUrl) {
      archivoUrl = tesis.archivoOriginalUrl
      archivoNombre = tesis.archivoOriginalNombre
    }

    if (!archivoUrl) {
      return NextResponse.json(
        { error: "No hay archivo disponible para descargar" },
        { status: 404 }
      )
    }

    // Descargar archivo de MinIO
    const fileBuffer = await downloadFile(archivoUrl)

    // Crear respuesta con el archivo
    const response = new NextResponse(fileBuffer)
    response.headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${archivoNombre || "documento.docx"}"`
    )
    response.headers.set("Content-Length", fileBuffer.length.toString())

    return response
  } catch (error) {
    console.error("Error al descargar archivo:", error)
    return NextResponse.json(
      { error: "Error al descargar el archivo" },
      { status: 500 }
    )
  }
}
