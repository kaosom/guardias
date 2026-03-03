"use client"

import { memo, useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatMatricula, validateMatriculaWithMessage } from "@/lib/validation"

interface UserEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialName: string
  initialStudentId: string
  onSave: (data: { fullName: string; studentId: string }) => Promise<void> | void
}

export const UserEditDialog = memo(function UserEditDialog({
  open,
  onOpenChange,
  initialName,
  initialStudentId,
  onSave,
}: UserEditDialogProps) {
  const [fullName, setFullName] = useState(initialName)
  const [studentId, setStudentId] = useState(initialStudentId)
  const [matriculaError, setMatriculaError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setFullName(initialName)
      setStudentId(initialStudentId)
      setMatriculaError("")
    }
  }, [open, initialName, initialStudentId])

  useEffect(() => {
    if (!studentId) {
      setMatriculaError("")
      return
    }
    const res = validateMatriculaWithMessage(studentId)
    setMatriculaError(res.isValid ? "" : res.error || "")
  }, [studentId])

  const handleMatriculaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentId(formatMatricula(e.target.value))
  }

  const canSave = fullName.trim().length > 0 && !matriculaError && studentId.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-sm rounded-2xl p-0 gap-0 bottom-4 top-auto translate-y-0 data-[state=open]:fade-zoom-in">
        <DialogHeader className="px-4 pt-4 pb-2 space-y-0.5">
          <DialogTitle className="text-base font-semibold tracking-tight">
            Editar información del alumno
          </DialogTitle>
          <DialogDescription className="text-[11px] text-muted-foreground">
            Actualiza el nombre y la matrícula. Se reflejará en todos sus vehículos registrados.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-4 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Nombre completo
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="María García López"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Matrícula
            </label>
            <Input
              value={studentId}
              onChange={handleMatriculaChange}
              maxLength={9}
              inputMode="numeric"
              placeholder="202161606"
              className="h-11 font-mono tracking-wider rounded-xl"
            />
            {matriculaError ? (
              <p className="text-[11px] text-destructive font-medium">{matriculaError}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                9 dígitos sin espacios (ej: 202161606)
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!canSave || saving}
              className="flex-1 rounded-xl bg-primary text-primary-foreground"
              onClick={async () => {
                if (!canSave) return
                setSaving(true)
                try {
                  await onSave({ fullName: fullName.trim(), studentId })
                  onOpenChange(false)
                } finally {
                  setSaving(false)
                }
              }}
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})

