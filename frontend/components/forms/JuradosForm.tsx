"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, User } from "lucide-react"

interface Jurado {
  nombre: string
  rol: "PRESIDENTE" | "PRIMER_MIEMBRO" | "SEGUNDO_MIEMBRO" | "ASESOR"
  grado: string
  email: string
}

interface JuradosFormProps {
  jurados: Jurado[]
  onUpdate: (jurados: Jurado[]) => void
}

const ROLES = [
  { value: "PRESIDENTE", label: "Presidente" },
  { value: "PRIMER_MIEMBRO", label: "Primer Miembro" },
  { value: "SEGUNDO_MIEMBRO", label: "Segundo Miembro" },
  { value: "ASESOR", label: "Asesor" },
]

const GRADOS = [
  { value: "Dr.", label: "Doctor (Dr.)" },
  { value: "Mg.", label: "Magister (Mg.)" },
  { value: "Lic.", label: "Licenciado (Lic.)" },
  { value: "Ing.", label: "Ingeniero (Ing.)" },
  { value: "M.Sc.", label: "Master of Science (M.Sc.)" },
  { value: "Ph.D.", label: "Doctor of Philosophy (Ph.D.)" },
]

export function JuradosForm({ jurados, onUpdate }: JuradosFormProps) {
  const updateJurado = (index: number, field: keyof Jurado, value: string) => {
    const newJurados = [...jurados]
    newJurados[index] = { ...newJurados[index], [field]: value }
    onUpdate(newJurados)
  }

  const addJurado = () => {
    onUpdate([...jurados, { nombre: "", rol: "PRIMER_MIEMBRO", grado: "Mg.", email: "" }])
  }

  const removeJurado = (index: number) => {
    if (jurados.length > 3) {
      const newJurados = jurados.filter((_, i) => i !== index)
      onUpdate(newJurados)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Ingrese la informacion de los miembros del jurado evaluador
        </p>
        <Button type="button" variant="outline" size="sm" onClick={addJurado}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Jurado
        </Button>
      </div>

      <div className="space-y-4">
        {jurados.map((jurado, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Jurado {index + 1}
                </CardTitle>
                {jurados.length > 3 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeJurado(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rol *</Label>
                  <Select
                    value={jurado.rol}
                    onValueChange={(value) => updateJurado(index, "rol", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((rol) => (
                        <SelectItem key={rol.value} value={rol.value}>
                          {rol.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Grado Academico</Label>
                  <Select
                    value={jurado.grado}
                    onValueChange={(value) => updateJurado(index, "grado", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el grado" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADOS.map((grado) => (
                        <SelectItem key={grado.value} value={grado.value}>
                          {grado.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nombre Completo *</Label>
                <Input
                  placeholder="Ingrese el nombre completo del jurado"
                  value={jurado.nombre}
                  onChange={(e) => updateJurado(index, "nombre", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Email (opcional)</Label>
                <Input
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={jurado.email}
                  onChange={(e) => updateJurado(index, "email", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
