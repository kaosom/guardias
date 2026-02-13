"use client"

import { useState, memo, useEffect } from "react"
import { Camera, AlertCircle, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CameraPermissionProps {
  open: boolean
  onClose: () => void
  onPermissionGranted: () => void
}

export const CameraPermission = memo(function CameraPermission({ 
  open, 
  onClose, 
  onPermissionGranted 
}: CameraPermissionProps) {
  const [status, setStatus] = useState<"idle" | "denied" | "unsupported">("idle")
  const [isRequesting, setIsRequesting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  function checkCameraSupport(): boolean {
    if (typeof window === 'undefined') return false
    if (!navigator?.mediaDevices) return false
    if (!navigator.mediaDevices.getUserMedia) return false
    return true
  }

  async function requestPermission() {
    if (!checkCameraSupport()) {
      setStatus('unsupported')
      return
    }

    setIsRequesting(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      })
      stream.getTracks().forEach(track => track.stop())
      setStatus("idle")
      onPermissionGranted()
      onClose()
    } catch (error) {
      console.error('Camera permission error:', error)
      setStatus('denied')
    } finally {
      setIsRequesting(false)
    }
  }

  function handleSkip() {
    onClose()
  }

  if (!open || !mounted) return null

  const isUnsupported = !checkCameraSupport()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="mx-6 max-w-md w-full bg-card rounded-3xl shadow-apple-lg overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="relative p-8 text-center space-y-6">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10">
              {status === 'unsupported' || isUnsupported ? (
                <AlertTriangle className="h-12 w-12 text-warning" />
              ) : status === 'denied' ? (
                <AlertCircle className="h-12 w-12 text-destructive" />
              ) : (
                <Camera className="h-12 w-12 text-primary" />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">
              {status === 'unsupported' || isUnsupported 
                ? 'Cámara no disponible' 
                : status === 'denied' 
                ? 'Permiso denegado' 
                : 'Acceso a la cámara'}
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              {status === 'unsupported' || isUnsupported
                ? 'Tu navegador no soporta el acceso a la cámara o la aplicación necesita ejecutarse en HTTPS para acceder a la cámara.'
                : status === 'denied' 
                ? 'No se pudo acceder a la cámara. Verifica la configuración de tu navegador y permite el acceso para este sitio.'
                : 'Necesitamos acceso a tu cámara para escanear placas vehiculares de forma rápida y precisa.'
              }
            </p>
          </div>

          {status === 'unsupported' || isUnsupported ? (
            <div className="space-y-3 pt-2">
              <div className="rounded-2xl bg-warning/5 border border-warning/10 p-4 text-left">
                <p className="text-sm text-foreground leading-relaxed">
                  <strong>Posibles soluciones:</strong>
                  <br />
                  • Usa un navegador moderno (Chrome, Safari, Edge)
                  <br />
                  • Accede desde <strong>https://</strong> en lugar de http://
                  <br />
                  • Si estás en desarrollo, usa localhost
                  <br />
                  • Prueba desde un dispositivo diferente
                </p>
              </div>
              <Button
                onClick={handleSkip}
                className="w-full h-14 text-base font-medium rounded-2xl bg-secondary hover:bg-secondary/80 transition-all"
              >
                Entendido
              </Button>
            </div>
          ) : status === 'denied' ? (
            <div className="space-y-3 pt-2">
              <div className="rounded-2xl bg-destructive/5 border border-destructive/10 p-4 text-left">
                <p className="text-sm text-foreground leading-relaxed">
                  <strong>Cómo habilitar:</strong>
                  <br />
                  1. Ve a la configuración de tu navegador
                  <br />
                  2. Busca "Permisos de cámara"
                  <br />
                  3. Permite el acceso para este sitio
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={requestPermission}
                  disabled={isRequesting}
                  className="flex-1 h-14 text-base font-medium rounded-2xl bg-primary hover:bg-primary/90 transition-all"
                >
                  Intentar de nuevo
                </Button>
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="flex-1 h-14 text-base font-medium rounded-2xl border-border/50 hover:bg-secondary transition-all"
                >
                  Omitir
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <Button
                onClick={requestPermission}
                disabled={isRequesting || isUnsupported}
                className="w-full h-14 text-base font-medium rounded-2xl bg-primary hover:bg-primary/90 active:scale-98 transition-all disabled:opacity-50"
              >
                {isRequesting ? 'Solicitando...' : 'Permitir acceso'}
              </Button>
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="w-full h-12 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-transparent"
              >
                Usar más tarde
              </Button>
              <p className="text-xs text-muted-foreground px-2 leading-relaxed">
                Tu privacidad es importante. Solo usaremos la cámara cuando actives el escáner.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
