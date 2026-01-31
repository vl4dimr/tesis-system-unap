import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// GET - Obtener una tesis por ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const tesis = await prisma.tesis.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        escuela: {
          include: {
            facultad: true,
          },
        },
        jurados: true,
        palabrasClave: true,
        validaciones: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!tesis) {
      return NextResponse.json({ error: "Tesis no encontrada" }, { status: 404 })
    }

    return NextResponse.json(tesis)
  } catch (error) {
    console.error("Error al obtener tesis:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar tesis
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que la tesis pertenece al usuario
    const existingTesis = await prisma.tesis.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingTesis) {
      return NextResponse.json({ error: "Tesis no encontrada" }, { status: 404 })
    }

    const body = await req.json()

    const updatedTesis = await prisma.tesis.update({
      where: { id: params.id },
      data: {
        titulo: body.titulo,
        tituloIngles: body.tituloIngles,
        area: body.area,
        tema: body.tema,
        lineaInvestigacion: body.lineaInvestigacion,
        fechaSustentacion: body.fechaSustentacion
          ? new Date(body.fechaSustentacion)
          : null,
        resumen: body.resumen,
        resumenIngles: body.resumenIngles,
      },
    })

    return NextResponse.json(updatedTesis)
  } catch (error) {
    console.error("Error al actualizar tesis:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar tesis
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que la tesis pertenece al usuario
    const existingTesis = await prisma.tesis.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingTesis) {
      return NextResponse.json({ error: "Tesis no encontrada" }, { status: 404 })
    }

    await prisma.tesis.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Tesis eliminada exitosamente" })
  } catch (error) {
    console.error("Error al eliminar tesis:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
