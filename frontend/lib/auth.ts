import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import prisma from "./db"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciales requeridas")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            escuela: {
              include: {
                facultad: true,
              },
            },
          },
        })

        if (!user) {
          throw new Error("Usuario no encontrado")
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Contraseña incorrecta")
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.nombres} ${user.apellidoPaterno}`,
          nombres: user.nombres,
          apellidoPaterno: user.apellidoPaterno,
          apellidoMaterno: user.apellidoMaterno,
          tipo: user.tipo,
          escuelaId: user.escuelaId,
          escuelaNombre: user.escuela?.nombre,
          facultadNombre: user.escuela?.facultad.nombre,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.tipo = user.tipo
        token.nombres = user.nombres
        token.apellidoPaterno = user.apellidoPaterno
        token.apellidoMaterno = user.apellidoMaterno
        token.escuelaId = user.escuelaId
        token.escuelaNombre = user.escuelaNombre
        token.facultadNombre = user.facultadNombre
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.tipo = token.tipo as string
        session.user.nombres = token.nombres as string
        session.user.apellidoPaterno = token.apellidoPaterno as string
        session.user.apellidoMaterno = token.apellidoMaterno as string | undefined
        session.user.escuelaId = token.escuelaId as string | undefined
        session.user.escuelaNombre = token.escuelaNombre as string | undefined
        session.user.facultadNombre = token.facultadNombre as string | undefined
      }
      return session
    },
  },
}
