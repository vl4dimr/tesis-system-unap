"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Download,
  Loader2,
  FileText,
  Check,
} from "lucide-react"

interface FormateoResultado {
  exito: boolean
  mensaje: string
  cambiosRealizados: string[]
  tesis: {
    id: string
    titulo: string
    estado: string
    archivoFormateadoUrl: string
    archivoFormateadoNombre: string
  }
}

export default function FormateoPage() {
  const params = useParams()
  const router = useRouter()
  const [isFormatting, setIsFormatting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultado, setResultado] = useState<FormateoResultado | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tesis, setTesis] = useState<any>(null)

  useEffect(() => {
    if (params.id) {
      fetchTesis()
    }
  }, [params.id])

  const fetchTesis = async () => {
    try {
      const response = await fetch(`/api/tesis/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTesis(data)

        // Si ya está formateado, mostrar resultado
        if (data.estado === "FORMATEADO" && data.archivoFormateadoUrl) {
          setResultado({
            exito: true,
            mensaje: "Documento formateado anteriormente",
            cambiosRealizados: [],
            tesis: data,
          })
        }
      }
    } catch (error) {
      console.error("Error al cargar tesis:", error)
    }
  }

  const handleFormatear = async () => {
    setIsFormatting(true)
    setError(null)
    setProgress(0)

    // Simular progreso
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 10
      })
    }, 500)

    try {
      const response = await fetch(`/api/formatear/${params.id}`, {
        method: "POST",
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Error al formatear")
      }

      const result = await response.json()
      setResultado(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al formatear el documento")
    } finally {
      setIsFormatting(false)
    }
  }

  if (!tesis) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Verificar si puede formatear
  const puedeFormatear = tesis.estado === "VALIDACION_EXITOSA"
  const yaFormateado = tesis.estado === "FORMATEADO"

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/tesis/${tesis.id}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a la tesis
        </Link>

        <h1 className="text-2xl font-bold">Formateo Automatico</h1>
        <p className="text-gray-600 mt-1">{tesis.titulo}</p>
      </div>

      {/* Estado actual */}
      {!puedeFormatear && !yaFormateado && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No disponible</AlertTitle>
          <AlertDescription>
            El documento debe pasar la validacion antes de poder ser formateado.
            <Link href={`/validacion/${tesis.id}`} className="ml-2 underline">
              Ver resultados de validacion
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Resultado exitoso */}
      {resultado?.exito && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div>
                <h2 className="text-xl font-bold text-green-800">
                  Formateo Completado
                </h2>
                <p className="text-green-700">{resultado.mensaje}</p>
              </div>
            </div>

            {resultado.cambiosRealizados.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">Cambios realizados:</h3>
                <ul className="space-y-1">
                  {resultado.cambiosRealizados.map((cambio, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-green-800">
                      <Check className="h-4 w-4" />
                      {cambio}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4">
              <Link href={`/api/descargar/${tesis.id}?tipo=formateado`}>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Documento Formateado
                </Button>
              </Link>
              <Link href={`/tesis/${tesis.id}`}>
                <Button variant="outline">Ver Tesis</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proceso de formateo */}
      {!resultado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Aplicar Formato UNAP 2.0
            </CardTitle>
            <CardDescription>
              El sistema aplicara automaticamente el formato correcto a tu documento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isFormatting ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span>Aplicando formato al documento...</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-gray-500 text-center">{progress}%</p>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium mb-3">Se aplicaran los siguientes cambios:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500" />
                      Margenes: 3.5cm (superior), 2.5cm (inferior, izquierdo, derecho)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500" />
                      Fuente: Times New Roman 12pt
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500" />
                      Interlineado: Doble espacio (2.0)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500" />
                      Sangria de primera linea: 1.25cm
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500" />
                      Formato de titulos y capitulos
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500" />
                      Tamano de pagina: A4
                    </li>
                  </ul>
                </div>

                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Se conservara el documento original. Podras descargar ambas versiones.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleFormatear}
                  disabled={!puedeFormatear}
                  className="w-full"
                  size="lg"
                >
                  Iniciar Formateo
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info adicional */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Requisitos de Formato - Guia UNAP 2.0</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Tamano de pagina:</span>
              <span className="ml-2 font-medium">A4 (21 x 29.7 cm)</span>
            </div>
            <div>
              <span className="text-gray-500">Fuente:</span>
              <span className="ml-2 font-medium">Times New Roman</span>
            </div>
            <div>
              <span className="text-gray-500">Margen superior:</span>
              <span className="ml-2 font-medium">3.5 cm</span>
            </div>
            <div>
              <span className="text-gray-500">Tamano fuente:</span>
              <span className="ml-2 font-medium">12 pt</span>
            </div>
            <div>
              <span className="text-gray-500">Otros margenes:</span>
              <span className="ml-2 font-medium">2.5 cm</span>
            </div>
            <div>
              <span className="text-gray-500">Interlineado:</span>
              <span className="ml-2 font-medium">2.0 (doble)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
