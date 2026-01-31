import { z } from "zod"

// Validaciones de autenticación
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
  nombres: z.string().min(2, "Nombres requeridos"),
  apellidoPaterno: z.string().min(2, "Apellido paterno requerido"),
  apellidoMaterno: z.string().optional(),
  dni: z.string().length(8, "DNI debe tener 8 dígitos").optional(),
  escuelaId: z.string().min(1, "Debe seleccionar una escuela"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

// Validaciones de tesis
export const datosPersonalesSchema = z.object({
  nombres: z.string().min(2, "Nombres requeridos"),
  apellidoPaterno: z.string().min(2, "Apellido paterno requerido"),
  apellidoMaterno: z.string().optional(),
  dni: z.string().length(8, "DNI debe tener 8 dígitos"),
  email: z.string().email("Email inválido"),
  escuelaId: z.string().min(1, "Debe seleccionar una escuela"),
})

export const datosTesisSchema = z.object({
  titulo: z.string().min(10, "El título debe tener al menos 10 caracteres"),
  tituloIngles: z.string().optional(),
  area: z.string().optional(),
  tema: z.string().optional(),
  lineaInvestigacion: z.string().optional(),
  fechaSustentacion: z.string().optional(),
  resumen: z.string().optional(),
  resumenIngles: z.string().optional(),
})

export const juradoSchema = z.object({
  nombre: z.string().min(3, "Nombre del jurado requerido"),
  rol: z.enum(["PRESIDENTE", "PRIMER_MIEMBRO", "SEGUNDO_MIEMBRO", "ASESOR"]),
  grado: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
})

export const juradosSchema = z.object({
  jurados: z.array(juradoSchema).min(3, "Debe agregar al menos 3 jurados"),
})

export const palabrasClaveSchema = z.object({
  palabrasEspanol: z.array(z.string().min(2)).min(3, "Debe agregar al menos 3 palabras clave en español"),
  palabrasIngles: z.array(z.string().min(2)).min(3, "Debe agregar al menos 3 palabras clave en inglés"),
})

// Schema completo para crear tesis
export const createTesisSchema = z.object({
  titulo: z.string().min(10, "El título debe tener al menos 10 caracteres"),
  tituloIngles: z.string().optional(),
  escuelaId: z.string().min(1, "Debe seleccionar una escuela"),
  area: z.string().optional(),
  tema: z.string().optional(),
  lineaInvestigacion: z.string().optional(),
  fechaSustentacion: z.string().optional(),
  resumen: z.string().optional(),
  resumenIngles: z.string().optional(),
  jurados: z.array(juradoSchema).min(3, "Debe agregar al menos 3 jurados"),
  palabrasClaveEspanol: z.array(z.string()).min(3),
  palabrasClaveIngles: z.array(z.string()).min(3),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type DatosPersonalesInput = z.infer<typeof datosPersonalesSchema>
export type DatosTesisInput = z.infer<typeof datosTesisSchema>
export type JuradoInput = z.infer<typeof juradoSchema>
export type JuradosInput = z.infer<typeof juradosSchema>
export type PalabrasClaveInput = z.infer<typeof palabrasClaveSchema>
export type CreateTesisInput = z.infer<typeof createTesisSchema>
