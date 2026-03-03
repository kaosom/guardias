"use client"

import { useState, useEffect, memo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, CheckCircle2, RotateCcw, Pencil, Loader2, AlertCircle } from "lucide-react"
import { formatPueblaPlate, validatePlateWithMessage } from "@/lib/validation"

interface OcrConfirmationProps {
  open: boolean
  imageDataUrl: string | null
  detectedPlate: string
  onConfirm: (plate: string) => void
  onRetry: () => void
  onClose: () => void
}

export const OcrConfirmation = memo(function OcrConfirmation({
  open,
  imageDataUrl,
  detectedPlate,
  onConfirm,
  onRetry,
  onClose,
}: OcrConfirmationProps) {
  const [plate, setPlate] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    if (open && detectedPlate) {
      setPlate(detectedPlate)
      setIsEditing(false)
      setIsProcessing(true)
      const timer = setTimeout(() => setIsProcessing(false), 1800)
      return () => clearTimeout(timer)
    }
  }, [open, detectedPlate])

  const handlePlateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPlate(formatPueblaPlate(e.target.value))
  }, [])

  const handleConfirm = useCallback(() => {
    const validation = validatePlateWithMessage(plate)
    if (validation.isValid) {
      onConfirm(plate)
    }
  }, [plate, onConfirm])

  const validation = validatePlateWithMessage(plate)

  if (!open || !imageDataUrl) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 animate-in fade-in duration-200">
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/10 rounded-lg"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </Button>
        <p className="text-xs font-semibold text-white/90 tracking-tight">
          {isProcessing ? "Procesando..." : "Confirmar Placa"}
        </p>
        <div className="h-8 w-8" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-6 gap-5">
        <div className="relative w-full max-w-xs">
          <img
            src={imageDataUrl}
            alt="Imagen capturada"
            className="w-full rounded-xl border border-white/15 shadow-apple-lg"
          />
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl">
              <div className="flex flex-col items-center gap-2.5">
                <Loader2 className="h-8 w-8 text-accent animate-spin" />
                <p className="text-xs font-medium text-white">Analizando placa...</p>
              </div>
            </div>
          )}
        </div>

        {!isProcessing && (
          <div className="w-full max-w-xs space-y-4">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-white">Placa detectada</label>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors rounded-lg px-2.5 py-1 hover:bg-white/5"
                  >
                    <Pencil className="h-3 w-3" />
                    Editar
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <Input
                  value={plate}
                  onChange={handlePlateChange}
                  maxLength={8}
                  autoFocus
                  className={`h-12 text-xl font-mono font-bold tracking-widest uppercase text-center bg-white/10 border-2 rounded-xl ${
                    validation.isValid
                      ? "border-success text-success"
                      : plate
                      ? "border-destructive text-destructive"
                      : "border-white/20 text-white"
                  }`}
                />
              ) : (
                <div className="flex h-12 items-center justify-center rounded-xl bg-white/10 border-2 border-success">
                  <span className="text-xl font-mono font-bold tracking-widest text-success">
                    {plate}
                  </span>
                </div>
              )}

              {validation.error && (
                <div className="flex items-center gap-1.5 rounded-lg bg-destructive/10 border border-destructive/20 p-2">
                  <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                  <p className="text-[11px] text-destructive leading-tight">{validation.error}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              <Button
                onClick={handleConfirm}
                disabled={!validation.isValid}
                className="h-11 w-full text-sm font-medium rounded-xl bg-success text-success-foreground hover:bg-success/90 disabled:opacity-50 shadow-apple hover:shadow-apple-md active:scale-98 transition-all"
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Confirmar y buscar
              </Button>

              <Button
                onClick={onRetry}
                variant="outline"
                className="h-10 w-full text-xs font-medium rounded-xl bg-white/5 border-white/20 text-white hover:bg-white/10 active:scale-98 transition-all"
              >
                <RotateCcw className="h-4 w-4 mr-1.5" />
                Capturar otra vez
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})
