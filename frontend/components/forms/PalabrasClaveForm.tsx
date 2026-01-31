"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

interface PalabrasClaveFormProps {
  palabrasEspanol: string[]
  palabrasIngles: string[]
  onUpdateEspanol: (palabras: string[]) => void
  onUpdateIngles: (palabras: string[]) => void
}

export function PalabrasClaveForm({
  palabrasEspanol,
  palabrasIngles,
  onUpdateEspanol,
  onUpdateIngles,
}: PalabrasClaveFormProps) {
  const updatePalabraEspanol = (index: number, value: string) => {
    const newPalabras = [...palabrasEspanol]
    newPalabras[index] = value
    onUpdateEspanol(newPalabras)
  }

  const updatePalabraIngles = (index: number, value: string) => {
    const newPalabras = [...palabrasIngles]
    newPalabras[index] = value
    onUpdateIngles(newPalabras)
  }

  const addPalabraEspanol = () => {
    if (palabrasEspanol.length < 6) {
      onUpdateEspanol([...palabrasEspanol, ""])
    }
  }

  const addPalabraIngles = () => {
    if (palabrasIngles.length < 6) {
      onUpdateIngles([...palabrasIngles, ""])
    }
  }

  const removePalabraEspanol = (index: number) => {
    if (palabrasEspanol.length > 3) {
      const newPalabras = palabrasEspanol.filter((_, i) => i !== index)
      onUpdateEspanol(newPalabras)
    }
  }

  const removePalabraIngles = (index: number) => {
    if (palabrasIngles.length > 3) {
      const newPalabras = palabrasIngles.filter((_, i) => i !== index)
      onUpdateIngles(newPalabras)
    }
  }

  return (
    <div className="space-y-8">
      {/* Palabras en Español */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <Label className="text-base">Palabras Clave en Espanol *</Label>
            <p className="text-sm text-gray-500 mt-1">
              Minimo 3 palabras clave, maximo 6
            </p>
          </div>
          {palabrasEspanol.length < 6 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPalabraEspanol}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {palabrasEspanol.map((palabra, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Palabra clave ${index + 1}`}
                value={palabra}
                onChange={(e) => updatePalabraEspanol(index, e.target.value)}
              />
              {palabrasEspanol.length > 3 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePalabraEspanol(index)}
                  className="text-red-500 hover:text-red-700 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Palabras en Inglés */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <Label className="text-base">Keywords in English *</Label>
            <p className="text-sm text-gray-500 mt-1">
              Minimum 3 keywords, maximum 6
            </p>
          </div>
          {palabrasIngles.length < 6 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPalabraIngles}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {palabrasIngles.map((palabra, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Keyword ${index + 1}`}
                value={palabra}
                onChange={(e) => updatePalabraIngles(index, e.target.value)}
              />
              {palabrasIngles.length > 3 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePalabraIngles(index)}
                  className="text-red-500 hover:text-red-700 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
