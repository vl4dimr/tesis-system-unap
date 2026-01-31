import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import prisma from "@/lib/db"
import { registerSchema } from "@/lib/validations"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validar datos
    const validatedData = registerSchema.parse(body)

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      )
    }

    // Verificar DNI único si se proporciona
    if (validatedData.dni) {
      const existingDni = await prisma.user.findUnique({
        where: { dni: validatedData.dni },
      })

      if (existingDni) {
        return NextResponse.json(
          { error: "El DNI ya está registrado" },
          { status: 400 }
        )
      }
    }

    // Hash de la contraseña
    const hashedPassword = await hash(validatedData.password, 12)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        nombres: validatedData.nombres,
        apellidoPaterno: validatedData.apellidoPaterno,
        apellidoMaterno: validatedData.apellidoMaterno,
        dni: validatedData.dni,
        escuelaId: validatedData.escuelaId,
        tipo: "TESISTA",
      },
      select: {
        id: true,
        email: true,
        nombres: true,
        apellidoPaterno: true,
      },
    })

    return NextResponse.json(
      { message: "Usuario registrado exitosamente", user },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error en registro:", error)

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
