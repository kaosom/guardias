"use client"

import { memo } from "react"
import { Camera, QrCode, Plus } from "lucide-react"

interface FloatingActionsProps {
  onCamera: () => void
  onQr: () => void
  onAdd: () => void
}

export const FloatingActions = memo(function FloatingActions({
  onCamera,
  onQr,
  onAdd,
}: FloatingActionsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="bg-card/80 backdrop-blur-xl border-t border-border/40 px-5 py-3">
        <div className="flex items-center justify-center gap-3 max-w-lg mx-auto">
          <button
            type="button"
            onClick={onCamera}
            className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-apple hover:shadow-apple-md active:scale-95 transition-all"
            aria-label="Escanear placa"
          >
            <Camera className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={onQr}
            className="flex h-14 w-14 items-center justify-center rounded-xl bg-foreground text-background shadow-apple hover:shadow-apple-md active:scale-95 transition-all"
            aria-label="Escanear QR"
          >
            <QrCode className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="flex h-14 w-14 items-center justify-center rounded-xl bg-success text-success-foreground shadow-apple hover:shadow-apple-md active:scale-95 transition-all"
            aria-label="Agregar vehiculo"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  )
})
