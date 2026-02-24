"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { VEHICLE_TYPE_LABELS, type VehicleRecord } from "@/lib/types"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: VehicleRecord | null
  onConfirm: () => void
}

export const ConfirmDialog = memo(function ConfirmDialog({ open, onOpenChange, record, onConfirm }: ConfirmDialogProps) {
  if (!record) return null

  const isEntry = record.status === "outside"
  const vehicleLabel = VEHICLE_TYPE_LABELS[record.vehicleType] || record.vehicleType

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[85vw] sm:max-w-sm rounded-2xl p-0 gap-0 bottom-4 top-auto translate-y-0 data-[state=open]:fade-zoom-in">
        <DialogHeader className="px-4 pt-4 pb-2 space-y-0.5">
          <DialogTitle className="text-base font-semibold tracking-tight">
            {isEntry ? "Confirmar entrada" : "Confirmar salida"}
          </DialogTitle>
          <DialogDescription className="text-[11px] text-muted-foreground">
            {isEntry
              ? "Se registrará la entrada del vehículo al campus"
              : "Se registrará la salida del vehículo del campus"}
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-4">
          <div className="space-y-0 rounded-xl bg-card border border-border/40 overflow-hidden mb-3">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/40">
              <span className="text-[11px] text-muted-foreground">Estudiante</span>
              <span className="text-xs font-medium text-foreground">{record.studentName}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/40">
              <span className="text-[11px] text-muted-foreground">Placa</span>
              <span className="text-xs font-bold text-foreground tracking-wider font-mono">{record.plate}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/40">
              <span className="text-[11px] text-muted-foreground">Vehículo</span>
              <span className="text-xs font-medium text-foreground">{vehicleLabel}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-[11px] text-muted-foreground">Puerta</span>
              <span className="text-xs font-medium text-foreground">Puerta 1</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              className={`w-full h-11 text-sm font-medium rounded-lg shadow-apple hover:shadow-apple-md active:scale-98 transition-all ${
                isEntry
                  ? "bg-success text-success-foreground hover:bg-success/90"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }`}
              onClick={onConfirm}
            >
              {isEntry ? "Confirmar entrada" : "Confirmar salida"}
            </Button>
            <Button
              variant="ghost"
              className="w-full h-9 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})
