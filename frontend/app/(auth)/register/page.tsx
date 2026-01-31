"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { registerSchema, type RegisterInput } from "@/lib/validations"
import { FileText, Loader2 } from "lucide-react"

interface Escuela {
  id: string
  nombre: string
  facultad: {
    nombre: string
  }
}

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [escuelas, setEscuelas] = useState<Escuela[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  useEffect(() => {
    // Cargar escuelas
    fetch("/api/escuelas")
      .then((res) => res.json())
      .then((data) => setEscuelas(data))
      .catch(console.error)
  }, [])

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Error al registrar")
        return
      }

      router.push("/login?registered=true")
    } catch (err) {
      setError("Ocurrio un error. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <FileText className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
          <CardDescription>
            Registrate para gestionar tu tesis
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres</Label>
                <Input
                  id="nombres"
                  placeholder="Juan Carlos"
                  {...register("nombres")}
                />
                {errors.nombres && (
                  <p className="text-sm text-red-500">{errors.nombres.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidoPaterno">Apellido Paterno</Label>
                <Input
                  id="apellidoPaterno"
                  placeholder="Garcia"
                  {...register("apellidoPaterno")}
                />
                {errors.apellidoPaterno && (
                  <p className="text-sm text-red-500">{errors.apellidoPaterno.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apellidoMaterno">Apellido Materno (opcional)</Label>
                <Input
                  id="apellidoMaterno"
                  placeholder="Lopez"
                  {...register("apellidoMaterno")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dni">DNI (opcional)</Label>
                <Input
                  id="dni"
                  placeholder="12345678"
                  maxLength={8}
                  {...register("dni")}
                />
                {errors.dni && (
                  <p className="text-sm text-red-500">{errors.dni.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="escuelaId">Escuela Profesional</Label>
              <Select onValueChange={(value) => setValue("escuelaId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu escuela" />
                </SelectTrigger>
                <SelectContent>
                  {escuelas.map((escuela) => (
                    <SelectItem key={escuela.id} value={escuela.id}>
                      {escuela.nombre} - {escuela.facultad.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.escuelaId && (
                <p className="text-sm text-red-500">{errors.escuelaId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contrasena</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contrasena</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="********"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Cuenta
            </Button>
            <p className="text-sm text-center text-gray-600">
              Ya tienes cuenta?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Inicia sesion aqui
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
