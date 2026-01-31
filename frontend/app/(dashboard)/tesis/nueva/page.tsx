"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DatosTesisForm } from "@/components/forms/DatosTesisForm"
import { JuradosForm } from "@/components/forms/JuradosForm"
import { PalabrasClaveForm } from "@/components/forms/PalabrasClaveForm"
import { ResumenForm } from "@/components/forms/ResumenForm"
import { ChevronLeft, ChevronRight, Loader2, CheckCircle } from "lucide-react"

const STEPS = [
  { id: 1, name: "Datos de Tesis", description: "Informacion basica" },
  { id: 2, name: "Jurados", description: "Comite evaluador" },
  { id: 3, name: "Palabras Clave", description: "Keywords" },
  { id: 4, name: "Resumen", description: "Abstract" },
]

interface TesisData {
  titulo: string
  tituloIngles: string
  escuelaId: string
  area: string
  tema: string
  lineaInvestigacion: string
  fechaSustentacion: string
  jurados: Array<{
    nombre: string
    rol: "PRESIDENTE" | "PRIMER_MIEMBRO" | "SEGUNDO_MIEMBRO" | "ASESOR"
    grado: string
    email: string
  }>
  palabrasClaveEspanol: string[]
  palabrasClaveIngles: string[]
  resumen: string
  resumenIngles: string
}

export default function NuevaTesisPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [tesisData, setTesisData] = useState<TesisData>({
    titulo: "",
    tituloIngles: "",
    escuelaId: "",
    area: "",
    tema: "",
    lineaInvestigacion: "",
    fechaSustentacion: "",
    jurados: [
      { nombre: "", rol: "PRESIDENTE", grado: "Dr.", email: "" },
      { nombre: "", rol: "PRIMER_MIEMBRO", grado: "Mg.", email: "" },
      { nombre: "", rol: "SEGUNDO_MIEMBRO", grado: "Mg.", email: "" },
      { nombre: "", rol: "ASESOR", grado: "Dr.", email: "" },
    ],
    palabrasClaveEspanol: ["", "", ""],
    palabrasClaveIngles: ["", "", ""],
    resumen: "",
    resumenIngles: "",
  })

  const progress = (currentStep / STEPS.length) * 100

  const updateTesisData = (data: Partial<TesisData>) => {
    setTesisData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Filtrar palabras clave vacías
      const dataToSubmit = {
        ...tesisData,
        palabrasClaveEspanol: tesisData.palabrasClaveEspanol.filter((p) => p.trim()),
        palabrasClaveIngles: tesisData.palabrasClaveIngles.filter((p) => p.trim()),
        jurados: tesisData.jurados.filter((j) => j.nombre.trim()),
      }

      const response = await fetch("/api/tesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Error al crear la tesis")
      }

      const tesis = await response.json()
      router.push(`/tesis/${tesis.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la tesis")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <DatosTesisForm
            data={tesisData}
            onUpdate={updateTesisData}
          />
        )
      case 2:
        return (
          <JuradosForm
            jurados={tesisData.jurados}
            onUpdate={(jurados) => updateTesisData({ jurados })}
          />
        )
      case 3:
        return (
          <PalabrasClaveForm
            palabrasEspanol={tesisData.palabrasClaveEspanol}
            palabrasIngles={tesisData.palabrasClaveIngles}
            onUpdateEspanol={(palabrasClaveEspanol) => updateTesisData({ palabrasClaveEspanol })}
            onUpdateIngles={(palabrasClaveIngles) => updateTesisData({ palabrasClaveIngles })}
          />
        )
      case 4:
        return (
          <ResumenForm
            resumen={tesisData.resumen}
            resumenIngles={tesisData.resumenIngles}
            onUpdate={updateTesisData}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Nueva Tesis</h1>
        <p className="text-gray-600 mt-1">Completa la informacion de tu tesis</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 ${
                step.id === currentStep
                  ? "text-blue-600"
                  : step.id < currentStep
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id === currentStep
                    ? "bg-blue-600 text-white"
                    : step.id < currentStep
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.id < currentStep ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  step.id
                )}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{step.name}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            {currentStep === STEPS.length ? (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar Tesis
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Siguiente
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
