import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { uploadFile } from "@/lib/minio"

export async function POST(
  req: NextRequest,
  { params }: { params: { tesisId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que la tesis existe y pertenece al usuario
    const tesis = await prisma.tesis.findFirst({
      where: {
        id: params.tesisId,
        userId: session.user.id,
      },
    })

    if (!tesis) {
      return NextResponse.json({ error: "Tesis no encontrada" }, { status: 404 })
    }

    // Obtener el archivo del FormData
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 })
    }

    // Validar extensión
    if (!file.name.endsWith(".docx")) {
      return NextResponse.json(
        { error: "Solo se permiten archivos .docx" },
        { status: 400 }
      )
    }

    // Validar tamaño (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "El archivo no debe superar los 50MB" },
        { status: 400 }
      )
    }

    // Convertir a buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Subir a MinIO
    const objectName = await uploadFile(
      file.name,
      buffer,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

    // Actualizar tesis
    const updatedTesis = await prisma.tesis.update({
      where: { id: params.tesisId },
      data: {
        archivoOriginalUrl: objectName,
        archivoOriginalNombre: file.name,
        estado: "DOCUMENTO_CARGADO",
      },
    })

    return NextResponse.json({
      message: "Archivo cargado exitosamente",
      tesis: updatedTesis,
    })
  } catch (error) {
    console.error("Error al cargar archivo:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
