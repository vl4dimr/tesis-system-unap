"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, FileText, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Tesis {
  id: string
  titulo: string
  estado: string
  createdAt: string
  updatedAt: string
  porcentajeCumplimiento: number | null
  escuela: {
    nombre: string
  }
}

const estadoConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" }> = {
  BORRADOR: { label: "Borrador", variant: "secondary" },
  DATOS_COMPLETOS: { label: "Datos Completos", variant: "default" },
  DOCUMENTO_CARGADO: { label: "Documento Cargado", variant: "default" },
  VALIDANDO: { label: "Validando...", variant: "warning" },
  VALIDACION_FALLIDA: { label: "Validacion Fallida", variant: "destructive" },
  VALIDACION_EXITOSA: { label: "Validacion Exitosa", variant: "success" },
  FORMATEANDO: { label: "Formateando...", variant: "warning" },
  FORMATEADO: { label: "Formateado", variant: "success" },
  PUBLICADO: { label: "Publicado", variant: "success" },
}

export default function TesisListPage() {
  const [tesis, setTesis] = useState<Tesis[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/tesis")
      .then((res) => res.json())
      .then((data) => {
        setTesis(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mis Tesis</h1>
          <p className="text-gray-600 mt-1">Gestiona tus documentos de tesis</p>
        </div>
        <Link href="/tesis/nueva">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Tesis
          </Button>
        </Link>
      </div>

      {tesis.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes tesis registradas
            </h3>
            <p className="text-gray-500 mb-6">
              Comienza registrando los datos de tu tesis
            </p>
            <Link href="/tesis/nueva">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Registrar Nueva Tesis
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tesis.map((t) => {
            const config = estadoConfig[t.estado] || estadoConfig.BORRADOR
            return (
              <Card key={t.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{t.titulo}</CardTitle>
                      <CardDescription className="mt-1">
                        {t.escuela.nombre}
                      </CardDescription>
                    </div>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(t.updatedAt), "d MMM yyyy", { locale: es })}
                      </span>
                      {t.porcentajeCumplimiento !== null && (
                        <span className="flex items-center gap-1">
                          {t.porcentajeCumplimiento >= 100 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                          {t.porcentajeCumplimiento}% cumplimiento
                        </span>
                      )}
                    </div>
                    <Link href={`/tesis/${t.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
