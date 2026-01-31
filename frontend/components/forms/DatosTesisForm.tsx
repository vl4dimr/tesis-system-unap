"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Escuela {
  id: string
  nombre: string
  facultad: {
    nombre: string
  }
}

interface DatosTesisFormProps {
  data: {
    titulo: string
    tituloIngles: string
    escuelaId: string
    area: string
    tema: string
    lineaInvestigacion: string
    fechaSustentacion: string
  }
  onUpdate: (data: Partial<DatosTesisFormProps["data"]>) => void
}

export function DatosTesisForm({ data, onUpdate }: DatosTesisFormProps) {
  const [escuelas, setEscuelas] = useState<Escuela[]>([])

  useEffect(() => {
    fetch("/api/escuelas")
      .then((res) => res.json())
      .then((data) => setEscuelas(data))
      .catch(console.error)
  }, [])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="titulo">Titulo de la Tesis *</Label>
        <Input
          id="titulo"
          placeholder="Ingrese el titulo completo de su tesis"
          value={data.titulo}
          onChange={(e) => onUpdate({ titulo: e.target.value })}
        />
        <p className="text-xs text-gray-500">
          El titulo debe ser claro y descriptivo del contenido de la investigacion
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tituloIngles">Titulo en Ingles</Label>
        <Input
          id="tituloIngles"
          placeholder="Enter the thesis title in English"
          value={data.tituloIngles}
          onChange={(e) => onUpdate({ tituloIngles: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="escuelaId">Escuela Profesional *</Label>
        <Select
          value={data.escuelaId}
          onValueChange={(value) => onUpdate({ escuelaId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione su escuela profesional" />
          </SelectTrigger>
          <SelectContent>
            {escuelas.map((escuela) => (
              <SelectItem key={escuela.id} value={escuela.id}>
                {escuela.nombre} - {escuela.facultad.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="area">Area de Investigacion</Label>
          <Input
            id="area"
            placeholder="Ej: Ingenieria de Software"
            value={data.area}
            onChange={(e) => onUpdate({ area: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tema">Tema</Label>
          <Input
            id="tema"
            placeholder="Ej: Sistemas de Informacion"
            value={data.tema}
            onChange={(e) => onUpdate({ tema: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lineaInvestigacion">Linea de Investigacion</Label>
        <Input
          id="lineaInvestigacion"
          placeholder="Ingrese la linea de investigacion"
          value={data.lineaInvestigacion}
          onChange={(e) => onUpdate({ lineaInvestigacion: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fechaSustentacion">Fecha de Sustentacion</Label>
        <Input
          id="fechaSustentacion"
          type="date"
          value={data.fechaSustentacion}
          onChange={(e) => onUpdate({ fechaSustentacion: e.target.value })}
        />
      </div>
    </div>
  )
}
