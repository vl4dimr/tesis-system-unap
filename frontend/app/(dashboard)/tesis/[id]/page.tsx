"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Download,
  Loader2,
  Calendar,
  User,
  BookOpen,
  Tag,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Tesis {
  id: string
  titulo: string
  tituloIngles: string
  resumen: string
  resumenIngles: string
  estado: string
  area: string
  tema: string
  lineaInvestigacion: string
  fechaSustentacion: string
  archivoOriginalUrl: string | null
  archivoOriginalNombre: string | null
  archivoFormateadoUrl: string | null
  porcentajeCumplimiento: number | null
  createdAt: string
  escuela: {
    nombre: string
    facultad: {
      nombre: string
    }
  }
  jurados: Array<{
    id: string
    nombre: string
    rol: string
    grado: string
    email: string
  }>
  palabrasClave: Array<{
    id: string
    palabra: string
    idioma: string
  }>
  validaciones: Array<{
    id: string
    tipo: string
    esValido: boolean
    mensaje: string
    severidad: string
    sugerencia: string
  }>
}

const estadoConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning"; icon: any }
> = {
  BORRADOR: { label: "Borrador", variant: "secondary", icon: FileText },
  DATOS_COMPLETOS: { label: "Datos Completos", variant: "default", icon: CheckCircle },
  DOCUMENTO_CARGADO: { label: "Documento Cargado", variant: "default", icon: Upload },
  VALIDANDO: { label: "Validando...", variant: "warning", icon: Loader2 },
  VALIDACION_FALLIDA: { label: "Validacion Fallida", variant: "destructive", icon: AlertCircle },
  VALIDACION_EXITOSA: { label: "Validacion Exitosa", variant: "success", icon: CheckCircle },
  FORMATEANDO: { label: "Formateando...", variant: "warning", icon: Loader2 },
  FORMATEADO: { label: "Formateado", variant: "success", icon: CheckCircle },
  PUBLICADO: { label: "Publicado", variant: "success", icon: CheckCircle },
}

const rolLabels: Record<string, string> = {
  PRESIDENTE: "Presidente",
  PRIMER_MIEMBRO: "Primer Miembro",
  SEGUNDO_MIEMBRO: "Segundo Miembro",
  ASESOR: "Asesor",
}

export default function TesisDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tesis, setTesis] = useState<Tesis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isValidating, setIsValidating] = useState(false)
  const [isFormatting, setIsFormatting] = useState(false)

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
      }
    } catch (error) {
      console.error("Error al cargar tesis:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidar = async () => {
    setIsValidating(true)
    try {
      const response = await fetch(`/api/validar/${params.id}`, {
        method: "POST",
      })
      if (response.ok) {
        await fetchTesis()
        router.push(`/validacion/${params.id}`)
      }
    } catch (error) {
      console.error("Error al validar:", error)
    } finally {
      setIsValidating(false)
    }
  }

  const handleFormatear = async () => {
    setIsFormatting(true)
    try {
      const response = await fetch(`/api/formatear/${params.id}`, {
        method: "POST",
      })
      if (response.ok) {
        await fetchTesis()
        router.push(`/formateo/${params.id}`)
      }
    } catch (error) {
      console.error("Error al formatear:", error)
    } finally {
      setIsFormatting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!tesis) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>No se pudo cargar la tesis</AlertDescription>
      </Alert>
    )
  }

  const config = estadoConfig[tesis.estado] || estadoConfig.BORRADOR
  const StatusIcon = config.icon

  const palabrasEspanol = tesis.palabrasClave.filter((p) => p.idioma === "es")
  const palabrasIngles = tesis.palabrasClave.filter((p) => p.idioma === "en")

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Badge variant={config.variant} className="mb-2">
              <StatusIcon className={`h-3 w-3 mr-1 ${tesis.estado === "VALIDANDO" || tesis.estado === "FORMATEANDO" ? "animate-spin" : ""}`} />
              {config.label}
            </Badge>
            <h1 className="text-2xl font-bold">{tesis.titulo}</h1>
            {tesis.tituloIngles && (
              <p className="text-gray-500 mt-1 italic">{tesis.tituloIngles}</p>
            )}
            <p className="text-gray-600 mt-2">
              {tesis.escuela.nombre} - {tesis.escuela.facultad.nombre}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Documento</p>
                <p className="font-medium">
                  {tesis.archivoOriginalUrl ? "Cargado" : "Pendiente"}
                </p>
              </div>
              {!tesis.archivoOriginalUrl ? (
                <Link href={`/tesis/${tesis.id}/cargar`}>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Cargar
                  </Button>
                </Link>
              ) : (
                <CheckCircle className="h-6 w-6 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Validacion</p>
                <p className="font-medium">
                  {tesis.porcentajeCumplimiento !== null
                    ? `${tesis.porcentajeCumplimiento}%`
                    : "Pendiente"}
                </p>
              </div>
              {tesis.archivoOriginalUrl && tesis.estado === "DOCUMENTO_CARGADO" && (
                <Button onClick={handleValidar} disabled={isValidating}>
                  {isValidating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Validar
                </Button>
              )}
              {tesis.estado === "VALIDACION_EXITOSA" && (
                <CheckCircle className="h-6 w-6 text-green-500" />
              )}
              {tesis.estado === "VALIDACION_FALLIDA" && (
                <Link href={`/validacion/${tesis.id}`}>
                  <Button variant="outline">Ver Errores</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Formateo</p>
                <p className="font-medium">
                  {tesis.archivoFormateadoUrl ? "Completado" : "Pendiente"}
                </p>
              </div>
              {tesis.estado === "VALIDACION_EXITOSA" && !tesis.archivoFormateadoUrl && (
                <Button onClick={handleFormatear} disabled={isFormatting}>
                  {isFormatting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Formatear
                </Button>
              )}
              {tesis.archivoFormateadoUrl && (
                <Link href={`/api/descargar/${tesis.id}`}>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">Informacion</TabsTrigger>
          <TabsTrigger value="jurados">Jurados</TabsTrigger>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          {tesis.validaciones.length > 0 && (
            <TabsTrigger value="validacion">Validacion</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informacion General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tesis.area && (
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Area</p>
                      <p className="font-medium">{tesis.area}</p>
                    </div>
                  </div>
                )}
                {tesis.tema && (
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Tema</p>
                      <p className="font-medium">{tesis.tema}</p>
                    </div>
                  </div>
                )}
                {tesis.lineaInvestigacion && (
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Linea de Investigacion</p>
                      <p className="font-medium">{tesis.lineaInvestigacion}</p>
                    </div>
                  </div>
                )}
                {tesis.fechaSustentacion && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha de Sustentacion</p>
                      <p className="font-medium">
                        {format(new Date(tesis.fechaSustentacion), "d 'de' MMMM, yyyy", {
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Palabras clave */}
              <div className="pt-4 border-t">
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">Palabras Clave</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {palabrasEspanol.map((p) => (
                        <Badge key={p.id} variant="secondary">
                          {p.palabra}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {palabrasIngles.map((p) => (
                        <Badge key={p.id} variant="outline">
                          {p.palabra}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jurados">
          <Card>
            <CardHeader>
              <CardTitle>Comite Evaluador</CardTitle>
              <CardDescription>Miembros del jurado de tesis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tesis.jurados.map((jurado) => (
                  <div
                    key={jurado.id}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    <User className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {jurado.grado} {jurado.nombre}
                        </p>
                        <Badge variant="outline">{rolLabels[jurado.rol]}</Badge>
                      </div>
                      {jurado.email && (
                        <p className="text-sm text-gray-500">{jurado.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resumen">
          <div className="grid gap-6">
            {tesis.resumen && (
              <Card>
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{tesis.resumen}</p>
                </CardContent>
              </Card>
            )}
            {tesis.resumenIngles && (
              <Card>
                <CardHeader>
                  <CardTitle>Abstract</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{tesis.resumenIngles}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {tesis.validaciones.length > 0 && (
          <TabsContent value="validacion">
            <Card>
              <CardHeader>
                <CardTitle>Resultados de Validacion</CardTitle>
                <CardDescription>
                  {tesis.porcentajeCumplimiento !== null &&
                    `${tesis.porcentajeCumplimiento}% de cumplimiento`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tesis.validaciones.slice(0, 10).map((v) => (
                    <div
                      key={v.id}
                      className={`p-3 rounded-lg border ${
                        v.esValido
                          ? "bg-green-50 border-green-200"
                          : v.severidad === "ERROR"
                          ? "bg-red-50 border-red-200"
                          : "bg-yellow-50 border-yellow-200"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {v.esValido ? (
                          <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                        ) : (
                          <AlertCircle
                            className={`h-5 w-5 shrink-0 ${
                              v.severidad === "ERROR" ? "text-red-500" : "text-yellow-500"
                            }`}
                          />
                        )}
                        <div>
                          <p className="font-medium">{v.tipo}</p>
                          {v.mensaje && <p className="text-sm text-gray-600">{v.mensaje}</p>}
                          {v.sugerencia && (
                            <p className="text-sm text-blue-600 mt-1">{v.sugerencia}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {tesis.validaciones.length > 10 && (
                    <Link href={`/validacion/${tesis.id}`}>
                      <Button variant="outline" className="w-full">
                        Ver todos los resultados ({tesis.validaciones.length})
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
