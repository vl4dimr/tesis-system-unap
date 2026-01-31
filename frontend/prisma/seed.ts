import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Crear facultades
  const facultades = [
    { nombre: "Facultad de Ingenieria Civil y Arquitectura", codigo: "FICA" },
    { nombre: "Facultad de Ingenieria de Minas", codigo: "FIM" },
    { nombre: "Facultad de Ingenieria Geologica y Metalurgica", codigo: "FIGM" },
    { nombre: "Facultad de Ingenieria Mecanica Electrica, Electronica y Sistemas", codigo: "FIMEES" },
    { nombre: "Facultad de Ciencias Agrarias", codigo: "FCA" },
    { nombre: "Facultad de Medicina Veterinaria y Zootecnia", codigo: "FMVZ" },
    { nombre: "Facultad de Ciencias Biologicas", codigo: "FCB" },
    { nombre: "Facultad de Enfermeria", codigo: "FE" },
    { nombre: "Facultad de Medicina Humana", codigo: "FMH" },
    { nombre: "Facultad de Nutricion Humana", codigo: "FNH" },
    { nombre: "Facultad de Odontologia", codigo: "FO" },
    { nombre: "Facultad de Ciencias Contables y Administrativas", codigo: "FCCA" },
    { nombre: "Facultad de Ciencias Juridicas y Politicas", codigo: "FCJP" },
    { nombre: "Facultad de Ciencias Sociales", codigo: "FCS" },
    { nombre: "Facultad de Ciencias de la Educacion", codigo: "FCE" },
    { nombre: "Facultad de Trabajo Social", codigo: "FTS" },
    { nombre: "Facultad de Ingenieria Estadistica e Informatica", codigo: "FIEI" },
    { nombre: "Facultad de Ingenieria Quimica", codigo: "FIQ" },
    { nombre: "Facultad de Ingenieria Economica", codigo: "FIE" },
  ]

  for (const facultad of facultades) {
    await prisma.facultad.upsert({
      where: { nombre: facultad.nombre },
      update: {},
      create: facultad,
    })
  }

  console.log("Facultades creadas")

  // Crear escuelas
  const escuelasData = [
    { nombre: "Ingenieria Civil", facultad: "Facultad de Ingenieria Civil y Arquitectura" },
    { nombre: "Arquitectura y Urbanismo", facultad: "Facultad de Ingenieria Civil y Arquitectura" },
    { nombre: "Ingenieria de Minas", facultad: "Facultad de Ingenieria de Minas" },
    { nombre: "Ingenieria Geologica", facultad: "Facultad de Ingenieria Geologica y Metalurgica" },
    { nombre: "Ingenieria Metalurgica", facultad: "Facultad de Ingenieria Geologica y Metalurgica" },
    { nombre: "Ingenieria Mecanica Electrica", facultad: "Facultad de Ingenieria Mecanica Electrica, Electronica y Sistemas" },
    { nombre: "Ingenieria Electronica", facultad: "Facultad de Ingenieria Mecanica Electrica, Electronica y Sistemas" },
    { nombre: "Ingenieria de Sistemas", facultad: "Facultad de Ingenieria Mecanica Electrica, Electronica y Sistemas" },
    { nombre: "Ingenieria Agronomica", facultad: "Facultad de Ciencias Agrarias" },
    { nombre: "Ingenieria Topografica y Agrimensura", facultad: "Facultad de Ciencias Agrarias" },
    { nombre: "Medicina Veterinaria y Zootecnia", facultad: "Facultad de Medicina Veterinaria y Zootecnia" },
    { nombre: "Biologia", facultad: "Facultad de Ciencias Biologicas" },
    { nombre: "Enfermeria", facultad: "Facultad de Enfermeria" },
    { nombre: "Medicina Humana", facultad: "Facultad de Medicina Humana" },
    { nombre: "Nutricion Humana", facultad: "Facultad de Nutricion Humana" },
    { nombre: "Odontologia", facultad: "Facultad de Odontologia" },
    { nombre: "Contabilidad", facultad: "Facultad de Ciencias Contables y Administrativas" },
    { nombre: "Administracion", facultad: "Facultad de Ciencias Contables y Administrativas" },
    { nombre: "Derecho", facultad: "Facultad de Ciencias Juridicas y Politicas" },
    { nombre: "Ciencias de la Comunicacion Social", facultad: "Facultad de Ciencias Sociales" },
    { nombre: "Sociologia", facultad: "Facultad de Ciencias Sociales" },
    { nombre: "Antropologia", facultad: "Facultad de Ciencias Sociales" },
    { nombre: "Arte", facultad: "Facultad de Ciencias Sociales" },
    { nombre: "Turismo", facultad: "Facultad de Ciencias Sociales" },
    { nombre: "Educacion Primaria", facultad: "Facultad de Ciencias de la Educacion" },
    { nombre: "Educacion Secundaria", facultad: "Facultad de Ciencias de la Educacion" },
    { nombre: "Educacion Fisica", facultad: "Facultad de Ciencias de la Educacion" },
    { nombre: "Trabajo Social", facultad: "Facultad de Trabajo Social" },
    { nombre: "Ingenieria Estadistica e Informatica", facultad: "Facultad de Ingenieria Estadistica e Informatica" },
    { nombre: "Ingenieria Quimica", facultad: "Facultad de Ingenieria Quimica" },
    { nombre: "Ingenieria Agroindustrial", facultad: "Facultad de Ingenieria Quimica" },
    { nombre: "Ingenieria Economica", facultad: "Facultad de Ingenieria Economica" },
  ]

  for (const escuela of escuelasData) {
    const facultad = await prisma.facultad.findUnique({
      where: { nombre: escuela.facultad },
    })

    if (facultad) {
      await prisma.escuela.upsert({
        where: {
          nombre_facultadId: {
            nombre: escuela.nombre,
            facultadId: facultad.id,
          },
        },
        update: {},
        create: {
          nombre: escuela.nombre,
          facultadId: facultad.id,
        },
      })
    }
  }

  console.log("Escuelas creadas")

  // Crear usuario admin de prueba
  const adminPassword = await hash("admin123", 12)

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@unap.edu.pe" },
    update: {},
    create: {
      email: "admin@unap.edu.pe",
      password: adminPassword,
      nombres: "Administrador",
      apellidoPaterno: "Sistema",
      tipo: "ADMIN",
    },
  })

  console.log("Usuario admin creado:", adminUser.email)

  // Crear usuario tesista de prueba
  const tesistaPassword = await hash("test123", 12)

  const escuelaInformatica = await prisma.escuela.findFirst({
    where: { nombre: "Ingenieria Estadistica e Informatica" },
  })

  if (escuelaInformatica) {
    const tesistaUser = await prisma.user.upsert({
      where: { email: "tesista@unap.edu.pe" },
      update: {},
      create: {
        email: "tesista@unap.edu.pe",
        password: tesistaPassword,
        nombres: "Juan Carlos",
        apellidoPaterno: "Garcia",
        apellidoMaterno: "Lopez",
        dni: "12345678",
        tipo: "TESISTA",
        escuelaId: escuelaInformatica.id,
      },
    })

    console.log("Usuario tesista creado:", tesistaUser.email)
  }

  console.log("Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
