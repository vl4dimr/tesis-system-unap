"use client"

import { useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, CheckCircle, X, Loader2 } from "lucide-react"

export default function CargarDocumentoPage() {
  const params = useParams()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      // Validar extensión
      if (!selectedFile.name.endsWith(".docx")) {
        setError("Solo se permiten archivos .docx")
        return
      }

      // Validar tamaño (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("El archivo no debe superar los 50MB")
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
  })

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Simular progreso
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch(`/api/upload/${params.id}`, {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Error al cargar el archivo")
      }

      setUploadProgress(100)
      setSuccess(true)

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push(`/tesis/${params.id}`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el archivo")
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setError(null)
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Documento Cargado</h2>
            <p className="text-gray-600">
              Tu documento ha sido cargado exitosamente. Redirigiendo...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Cargar Documento</h1>
        <p className="text-gray-600 mt-1">
          Sube tu tesis en formato Word (.docx) para validar su formato
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Archivo de Tesis</CardTitle>
          <CardDescription>
            El documento debe estar en formato .docx (Microsoft Word)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-600 font-medium">Suelta el archivo aqui...</p>
              ) : (
                <>
                  <p className="text-gray-600 mb-2">
                    Arrastra y suelta tu archivo aqui, o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-gray-400">
                    Solo archivos .docx, maximo 50MB
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-10 w-10 text-blue-500" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <Button variant="ghost" size="icon" onClick={removeFile}>
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {isUploading && (
                <div className="mt-4">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    {uploadProgress}% completado
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/tesis/${params.id}`)}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Cargar Documento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Requisitos del Documento</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>- Formato Microsoft Word (.docx)</li>
            <li>- Tamano maximo: 50MB</li>
            <li>- Debe incluir todo el contenido de la tesis</li>
            <li>- Se recomienda revisar que el documento abra correctamente antes de cargar</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
