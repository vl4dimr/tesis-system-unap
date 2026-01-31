"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ResumenFormProps {
  resumen: string
  resumenIngles: string
  onUpdate: (data: { resumen?: string; resumenIngles?: string }) => void
}

export function ResumenForm({ resumen, resumenIngles, onUpdate }: ResumenFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="resumen" className="text-base">Resumen</Label>
        <p className="text-sm text-gray-500">
          Escriba un resumen conciso de su investigacion (maximo 250 palabras)
        </p>
        <Textarea
          id="resumen"
          placeholder="Ingrese el resumen de su tesis..."
          value={resumen}
          onChange={(e) => onUpdate({ resumen: e.target.value })}
          rows={8}
          className="resize-none"
        />
        <p className="text-xs text-gray-400 text-right">
          {resumen.split(/\s+/).filter(Boolean).length} / 250 palabras
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="resumenIngles" className="text-base">Abstract</Label>
        <p className="text-sm text-gray-500">
          Write a concise abstract of your research (maximum 250 words)
        </p>
        <Textarea
          id="resumenIngles"
          placeholder="Enter the abstract of your thesis..."
          value={resumenIngles}
          onChange={(e) => onUpdate({ resumenIngles: e.target.value })}
          rows={8}
          className="resize-none"
        />
        <p className="text-xs text-gray-400 text-right">
          {resumenIngles.split(/\s+/).filter(Boolean).length} / 250 words
        </p>
      </div>
    </div>
  )
}
