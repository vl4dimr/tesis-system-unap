import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { createTesisSchema } from "@/lib/validations"

// GET - Listar tesis del usuario
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const tesis = await prisma.tesis.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        escuela: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(tesis)
  } catch (error) {
    console.error("Error al obtener tesis:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Crear nueva tesis
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = createTesisSchema.parse(body)

    // Crear tesis con jurados y palabras clave en una transacción
    const tesis = await prisma.$transaction(async (tx) => {
      // Crear la tesis
      const nuevaTesis = await tx.tesis.create({
        data: {
          titulo: validatedData.titulo,
          tituloIngles: validatedData.tituloIngles,
          escuelaId: validatedData.escuelaId,
          area: validatedData.area,
          tema: validatedData.tema,
          lineaInvestigacion: validatedData.lineaInvestigacion,
          fechaSustentacion: validatedData.fechaSustentacion
            ? new Date(validatedData.fechaSustentacion)
            : null,
          resumen: validatedData.resumen,
          resumenIngles: validatedData.resumenIngles,
          userId: session.user.id,
          estado: "DATOS_COMPLETOS",
        },
      })

      // Crear jurados
      if (validatedData.jurados && validatedData.jurados.length > 0) {
        await tx.tesisJurado.createMany({
          data: validatedData.jurados.map((jurado) => ({
            tesisId: nuevaTesis.id,
            nombre: jurado.nombre,
            rol: jurado.rol,
            grado: jurado.grado,
            email: jurado.email || null,
          })),
        })
      }

      // Crear palabras clave en español (filtrar vacías y duplicadas)
      const palabrasEspanol = [...new Set(
        (validatedData.palabrasClaveEspanol || [])
          .map(p => p.trim())
          .filter(p => p.length > 0)
      )]
      if (palabrasEspanol.length > 0) {
        await tx.palabraClave.createMany({
          data: palabrasEspanol.map((palabra) => ({
            tesisId: nuevaTesis.id,
            palabra,
            idioma: "es",
          })),
        })
      }

      // Crear palabras clave en inglés (filtrar vacías y duplicadas)
      const palabrasIngles = [...new Set(
        (validatedData.palabrasClaveIngles || [])
          .map(p => p.trim())
          .filter(p => p.length > 0)
      )]
      if (palabrasIngles.length > 0) {
        await tx.palabraClave.createMany({
          data: palabrasIngles.map((palabra) => ({
            tesisId: nuevaTesis.id,
            palabra,
            idioma: "en",
          })),
        })
      }

      return nuevaTesis
    })

    return NextResponse.json(tesis, { status: 201 })
  } catch (error) {
    console.error("Error al crear tesis:", error)

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
