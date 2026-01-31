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
    { nombre: "Facultad de Ingenieria Mecanica Electrica Electronica y Sistemas", codigo: "FIMEES" },
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
    { nombre: "Ingenieria Mecanica Electrica", facultad: "Facultad de Ingenieria Mecanica Electrica Electronica y Sistemas" },
    { nombre: "Ingenieria Electronica", facultad: "Facultad de Ingenieria Mecanica Electrica Electronica y Sistemas" },
    { nombre: "Ingenieria de Sistemas", facultad: "Facultad de Ingenieria Mecanica Electrica Electronica y Sistemas" },
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

  await prisma.user.upsert({
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

  console.log("Usuario admin creado: admin@unap.edu.pe / admin123")

  // Obtener escuela de informatica
  const escuelaInformatica = await prisma.escuela.findFirst({
    where: { nombre: "Ingenieria Estadistica e Informatica" },
  })

  const escuelaMedicina = await prisma.escuela.findFirst({
    where: { nombre: "Medicina Humana" },
  })

  // Crear usuarios demo
  const demoPassword = await hash("demo123", 12)

  if (escuelaInformatica) {
    // Usuario 1 - Tesista Informatica
    const user1 = await prisma.user.upsert({
      where: { email: "maria.lopez@unap.edu.pe" },
      update: {},
      create: {
        email: "maria.lopez@unap.edu.pe",
        password: demoPassword,
        nombres: "Maria Elena",
        apellidoPaterno: "Lopez",
        apellidoMaterno: "Quispe",
        dni: "70123456",
        tipo: "TESISTA",
        escuelaId: escuelaInformatica.id,
      },
    })

    console.log("Usuario demo: maria.lopez@unap.edu.pe / demo123")

    // Crear tesis de ejemplo para Maria
    const tesis1 = await prisma.tesis.upsert({
      where: { id: "demo-tesis-1" },
      update: {},
      create: {
        id: "demo-tesis-1",
        titulo: "Sistema de Gestion Academica basado en Inteligencia Artificial para la Universidad Nacional del Altiplano",
        tituloIngles: "Academic Management System based on Artificial Intelligence for the National University of the Altiplano",
        userId: user1.id,
        escuelaId: escuelaInformatica.id,
        area: "Ingenieria de Software",
        tema: "Inteligencia Artificial",
        lineaInvestigacion: "Sistemas Inteligentes",
        estado: "DATOS_COMPLETOS",
        resumen: "La presente investigacion tiene como objetivo desarrollar un sistema de gestion academica utilizando tecnicas de inteligencia artificial para mejorar los procesos administrativos de la Universidad Nacional del Altiplano. Se implementaron algoritmos de aprendizaje automatico para la prediccion del rendimiento academico y recomendacion de cursos.",
        resumenIngles: "This research aims to develop an academic management system using artificial intelligence techniques to improve the administrative processes of the National University of the Altiplano. Machine learning algorithms were implemented for academic performance prediction and course recommendation.",
      },
    })

    // Jurados para tesis 1
    await prisma.tesisJurado.deleteMany({ where: { tesisId: tesis1.id } })
    await prisma.tesisJurado.createMany({
      data: [
        { tesisId: tesis1.id, nombre: "Juan Carlos Mamani Apaza", rol: "PRESIDENTE", grado: "Dr." },
        { tesisId: tesis1.id, nombre: "Rosa Maria Condori Flores", rol: "PRIMER_MIEMBRO", grado: "Mg." },
        { tesisId: tesis1.id, nombre: "Pedro Luis Huanca Ticona", rol: "SEGUNDO_MIEMBRO", grado: "Mg." },
        { tesisId: tesis1.id, nombre: "Carlos Alberto Ramos Villanueva", rol: "ASESOR", grado: "Dr." },
      ],
    })

    // Palabras clave para tesis 1
    await prisma.palabraClave.deleteMany({ where: { tesisId: tesis1.id } })
    await prisma.palabraClave.createMany({
      data: [
        { tesisId: tesis1.id, palabra: "Inteligencia Artificial", idioma: "es" },
        { tesisId: tesis1.id, palabra: "Gestion Academica", idioma: "es" },
        { tesisId: tesis1.id, palabra: "Machine Learning", idioma: "es" },
        { tesisId: tesis1.id, palabra: "Artificial Intelligence", idioma: "en" },
        { tesisId: tesis1.id, palabra: "Academic Management", idioma: "en" },
        { tesisId: tesis1.id, palabra: "Machine Learning", idioma: "en" },
      ],
    })

    console.log("Tesis demo creada para Maria")
  }

  if (escuelaMedicina) {
    // Usuario 2 - Tesista Medicina
    const user2 = await prisma.user.upsert({
      where: { email: "carlos.huanca@unap.edu.pe" },
      update: {},
      create: {
        email: "carlos.huanca@unap.edu.pe",
        password: demoPassword,
        nombres: "Carlos Alberto",
        apellidoPaterno: "Huanca",
        apellidoMaterno: "Mamani",
        dni: "70234567",
        tipo: "TESISTA",
        escuelaId: escuelaMedicina.id,
      },
    })

    console.log("Usuario demo: carlos.huanca@unap.edu.pe / demo123")

    // Crear tesis de ejemplo para Carlos
    const tesis2 = await prisma.tesis.upsert({
      where: { id: "demo-tesis-2" },
      update: {},
      create: {
        id: "demo-tesis-2",
        titulo: "Prevalencia de Anemia en Ninos Menores de 5 Anos en la Region Puno Durante el Periodo 2020-2024",
        tituloIngles: "Prevalence of Anemia in Children Under 5 Years Old in the Puno Region During the Period 2020-2024",
        userId: user2.id,
        escuelaId: escuelaMedicina.id,
        area: "Salud Publica",
        tema: "Nutricion Infantil",
        lineaInvestigacion: "Epidemiologia",
        estado: "BORRADOR",
        resumen: "El presente estudio tiene como objetivo determinar la prevalencia de anemia en ninos menores de 5 anos en la Region Puno durante el periodo 2020-2024, identificando los factores de riesgo asociados y proponiendo estrategias de intervencion.",
      },
    })

    // Jurados para tesis 2
    await prisma.tesisJurado.deleteMany({ where: { tesisId: tesis2.id } })
    await prisma.tesisJurado.createMany({
      data: [
        { tesisId: tesis2.id, nombre: "Ana Maria Flores Quispe", rol: "PRESIDENTE", grado: "Dra." },
        { tesisId: tesis2.id, nombre: "Miguel Angel Condori Ramos", rol: "PRIMER_MIEMBRO", grado: "Dr." },
        { tesisId: tesis2.id, nombre: "Lucia Esperanza Mamani Torres", rol: "SEGUNDO_MIEMBRO", grado: "Mg." },
        { tesisId: tesis2.id, nombre: "Jorge Luis Apaza Vilca", rol: "ASESOR", grado: "Dr." },
      ],
    })

    // Palabras clave para tesis 2
    await prisma.palabraClave.deleteMany({ where: { tesisId: tesis2.id } })
    await prisma.palabraClave.createMany({
      data: [
        { tesisId: tesis2.id, palabra: "Anemia", idioma: "es" },
        { tesisId: tesis2.id, palabra: "Nutricion Infantil", idioma: "es" },
        { tesisId: tesis2.id, palabra: "Salud Publica", idioma: "es" },
        { tesisId: tesis2.id, palabra: "Anemia", idioma: "en" },
        { tesisId: tesis2.id, palabra: "Child Nutrition", idioma: "en" },
        { tesisId: tesis2.id, palabra: "Public Health", idioma: "en" },
      ],
    })

    console.log("Tesis demo creada para Carlos")
  }

  // Usuario 3 - Tesista simple para pruebas
  if (escuelaInformatica) {
    await prisma.user.upsert({
      where: { email: "demo@unap.edu.pe" },
      update: {},
      create: {
        email: "demo@unap.edu.pe",
        password: demoPassword,
        nombres: "Usuario",
        apellidoPaterno: "Demo",
        apellidoMaterno: "Prueba",
        dni: "70345678",
        tipo: "TESISTA",
        escuelaId: escuelaInformatica.id,
      },
    })

    console.log("Usuario demo: demo@unap.edu.pe / demo123")
  }

  console.log("")
  console.log("=== SEED COMPLETADO ===")
  console.log("")
  console.log("Usuarios disponibles:")
  console.log("  admin@unap.edu.pe / admin123 (Admin)")
  console.log("  maria.lopez@unap.edu.pe / demo123 (Tesista con tesis)")
  console.log("  carlos.huanca@unap.edu.pe / demo123 (Tesista con tesis)")
  console.log("  demo@unap.edu.pe / demo123 (Tesista sin tesis)")
  console.log("")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
