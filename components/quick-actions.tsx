"use client"

import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuickActionsProps {
  hasResult: boolean
  onAdd: () => void
  onEdit: () => void
  onDelete: () => void
}

export function QuickActions({ hasResult, onAdd, onEdit, onDelete }: QuickActionsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="flex-1 h-12 gap-2 text-sm font-medium bg-card border-2"
        onClick={onAdd}
      >
        <Plus className="h-4 w-4" />
        Agregar
      </Button>
      <Button
        variant="outline"
        className="flex-1 h-12 gap-2 text-sm font-medium bg-card border-2"
        onClick={onEdit}
        disabled={!hasResult}
      >
        <Pencil className="h-4 w-4" />
        Editar
      </Button>
      <Button
        variant="outline"
        className="flex-1 h-12 gap-2 text-sm font-medium border-2 bg-card text-destructive border-destructive/30"
        onClick={onDelete}
        disabled={!hasResult}
      >
        <Trash2 className="h-4 w-4" />
        Eliminar
      </Button>
    </div>
  )
}
