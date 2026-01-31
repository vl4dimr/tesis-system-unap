import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET() {
  try {
    const escuelas = await prisma.escuela.findMany({
      include: {
        facultad: true,
      },
      orderBy: {
        nombre: "asc",
      },
    })

    return NextResponse.json(escuelas)
  } catch (error) {
    console.error("Error al obtener escuelas:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
