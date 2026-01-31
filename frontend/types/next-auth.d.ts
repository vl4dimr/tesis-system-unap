import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      tipo: string
      nombres: string
      apellidoPaterno: string
      apellidoMaterno?: string
      escuelaId?: string
      escuelaNombre?: string
      facultadNombre?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    tipo: string
    nombres: string
    apellidoPaterno: string
    apellidoMaterno?: string
    escuelaId?: string
    escuelaNombre?: string
    facultadNombre?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    tipo: string
    nombres: string
    apellidoPaterno: string
    apellidoMaterno?: string
    escuelaId?: string
    escuelaNombre?: string
    facultadNombre?: string
  }
}
