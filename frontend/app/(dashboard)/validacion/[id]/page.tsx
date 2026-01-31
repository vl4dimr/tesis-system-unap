"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  ArrowLeft,
  Download,
  RefreshCw,
  Loader2,
  FileText,
} from "lucide-react"

interface Validacion {
  id: string
  tipo: string
  categoria: string
  elemento: string
  esValido: boolean
  valorActual: string
  valorEsperado: string
  mensaje: string
  severidad: "ERROR" | "ADVERTENCIA" | "SUGERENCIA"
  sugerencia: string
}

interface ValidacionData {
  tesis: {
    id: string
    titulo: string
    estado: string
    porcentajeCumplimiento: number
  }
  estadisticas: {
    total: number
    validos: number
    errores: number
    advertencias: number
    porcentaje: number
  }
  validaciones: Validacion[]
  validacionesPorTipo: Record<string, Validacion[]>
}

const severidadConfig = {
  ERROR: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  ADVERTENCIA: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-50", border: "border-yellow-200" },
  SUGERENCIA: { icon: Info, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
}

export default function ValidacionResultadosPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<ValidacionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRevalidating, setIsRevalidating] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchValidaciones()
    }
  }, [params.id])

  const fetchValidaciones = async () => {
    try {
      const response = await fetch(`/api/validar/${params.id}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error("Error al cargar validaciones:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevalidar = async () => {
    setIsRevalidating(true)
    try {
      const response = await fetch(`/api/validar/${params.id}`, {
        method: "POST",
      })
      if (response.ok) {
        await fetchValidaciones()
      }
    } catch (error) {
      console.error("Error al revalidar:", error)
    } finally {
      setIsRevalidating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>No se pudieron cargar los resultados</AlertDescription>
      </Alert>
    )
  }

  const { tesis, estadisticas, validaciones, validacionesPorTipo } = data
  const esValido = estadisticas.errores === 0

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/tesis/${tesis.id}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a la tesis
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Resultados de Validacion</h1>
            <p className="text-gray-600 mt-1">{tesis.titulo}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRevalidar} disabled={isRevalidating}>
              {isRevalidating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Revalidar
            </Button>
            {esValido && (
              <Link href={`/tesis/${tesis.id}`}>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Continuar al Formateo
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <Card className={`mb-8 ${esValido ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {esValido ? (
                <CheckCircle className="h-12 w-12 text-green-500" />
              ) : (
                <AlertCircle className="h-12 w-12 text-red-500" />
              )}
              <div>
                <h2 className="text-xl font-bold">
                  {esValido ? "Validacion Exitosa" : "Se Encontraron Errores"}
                </h2>
                <p className="text-gray-600">
                  {esValido
                    ? "El documento cumple con los requisitos de formato"
                    : `${estadisticas.errores} errores deben ser corregidos`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">
                {estadisticas.porcentaje.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-500">cumplimiento</div>
            </div>
          </div>

          <div className="mt-6">
            <Progress
              value={estadisticas.porcentaje}
              className={`h-3 ${esValido ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"}`}
            />
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{estadisticas.total}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{estadisticas.validos}</div>
              <div className="text-sm text-gray-500">Validos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{estadisticas.errores}</div>
              <div className="text-sm text-gray-500">Errores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{estadisticas.advertencias}</div>
              <div className="text-sm text-gray-500">Advertencias</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Tabs defaultValue="todos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="todos">Todos ({validaciones.length})</TabsTrigger>
          {Object.entries(validacionesPorTipo).map(([tipo, items]) => (
            <TabsTrigger key={tipo} value={tipo}>
              {tipo} ({items.length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="todos">
          <Card>
            <CardHeader>
              <CardTitle>Todos los Resultados</CardTitle>
              <CardDescription>
                Lista completa de validaciones realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {validaciones.map((v) => (
                  <ValidacionItem key={v.id} validacion={v} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {Object.entries(validacionesPorTipo).map(([tipo, items]) => (
          <TabsContent key={tipo} value={tipo}>
            <Card>
              <CardHeader>
                <CardTitle>{tipo}</CardTitle>
                <CardDescription>
                  {items.filter((i) => i.esValido).length} de {items.length} validaciones correctas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((v) => (
                    <ValidacionItem key={v.id} validacion={v} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function ValidacionItem({ validacion }: { validacion: Validacion }) {
  const config = validacion.esValido
    ? { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", border: "border-green-200" }
    : severidadConfig[validacion.severidad]

  const Icon = config.icon

  return (
    <div className={`p-4 rounded-lg border ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.color}`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{validacion.tipo}</span>
            {validacion.categoria && (
              <>
                <span className="text-gray-400">-</span>
                <span className="text-sm text-gray-600">{validacion.categoria}</span>
              </>
            )}
            {!validacion.esValido && (
              <Badge
                variant={
                  validacion.severidad === "ERROR"
                    ? "destructive"
                    : validacion.severidad === "ADVERTENCIA"
                    ? "warning"
                    : "secondary"
                }
              >
                {validacion.severidad}
              </Badge>
            )}
          </div>

          {validacion.mensaje && (
            <p className="text-sm text-gray-700">{validacion.mensaje}</p>
          )}

          {validacion.valorActual && validacion.valorEsperado && (
            <div className="mt-2 text-sm">
              <span className="text-gray-500">Actual: </span>
              <span className={validacion.esValido ? "text-green-700" : "text-red-700"}>
                {validacion.valorActual}
              </span>
              {!validacion.esValido && (
                <>
                  <span className="text-gray-500 mx-2">|</span>
                  <span className="text-gray-500">Esperado: </span>
                  <span className="text-blue-700">{validacion.valorEsperado}</span>
                </>
              )}
            </div>
          )}

          {validacion.sugerencia && (
            <div className="mt-2 p-2 bg-blue-100 rounded text-sm text-blue-800">
              <strong>Sugerencia:</strong> {validacion.sugerencia}
            </div>
          )}

          {validacion.elemento && (
            <div className="mt-1 text-xs text-gray-500">
              Ubicacion: {validacion.elemento}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
