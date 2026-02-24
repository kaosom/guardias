"use client"

import { useEffect, useRef, useState, useCallback, memo } from "react"
import { X, ScanLine, FlashlightOff, Flashlight, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CameraScannerProps {
  open: boolean
  onClose: () => void
  onCapture: (imageDataUrl: string) => void
}

export const CameraScanner = memo(function CameraScanner({ open, onClose, onCapture }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [torchOn, setTorchOn] = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)
  const [scanLineY, setScanLineY] = useState(0)

  useEffect(() => {
    if (!open || !cameraReady) return
    let frame: number
    let direction = 1
    let y = 0
    function animate() {
      y += direction * 1.5
      if (y > 100) direction = -1
      if (y < 0) direction = 1
      setScanLineY(y)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [open, cameraReady])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop()
      streamRef.current = null
    }
    setCameraReady(false)
    setTorchOn(false)
    setTorchSupported(false)
  }, [])

  const startCamera = useCallback(async () => {
    setError(null)
    
    if (typeof window === 'undefined' || !navigator?.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Tu navegador no soporta el acceso a la cámara. Usa un navegador moderno o accede desde HTTPS.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
      }
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean }
      if (capabilities?.torch) setTorchSupported(true)
    } catch (err) {
      console.error('Camera error:', err)
      setError("No se pudo acceder a la cámara. Verifica los permisos del navegador.")
    }
  }, [])

  useEffect(() => {
    if (open) startCamera()
    else stopCamera()
    return () => stopCamera()
  }, [open, startCamera, stopCamera])

  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return
    const track = streamRef.current.getVideoTracks()[0]
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn } as MediaTrackConstraintSet] })
      setTorchOn(!torchOn)
    } catch { /* unsupported */ }
  }, [torchOn])

  function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const vw = video.videoWidth
    const vh = video.videoHeight
    const frameW = vw * 0.85
    const frameH = vh * 0.18
    const frameX = (vw - frameW) / 2
    const frameY = (vh - frameH) / 2
    canvas.width = frameW
    canvas.height = frameH
    ctx.drawImage(video, frameX, frameY, frameW, frameH, 0, 0, frameW, frameH)
    onCapture(canvas.toDataURL("image/png"))
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-black/60">
        <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/10" onClick={onClose} aria-label="Cerrar">
          <X className="h-5 w-5" />
        </Button>
        <p className="text-xs font-semibold text-white/90 uppercase tracking-wider">Escanear Placa</p>
        {torchSupported ? (
          <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/10" onClick={toggleTorch} aria-label="Linterna">
            {torchOn ? <Flashlight className="h-4 w-4" /> : <FlashlightOff className="h-4 w-4" />}
          </Button>
        ) : <div className="h-10 w-10" />}
      </div>

      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />

        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-0 right-0 bg-black/55" style={{ height: "41%" }} />
          <div className="absolute bottom-0 left-0 right-0 bg-black/55" style={{ height: "41%" }} />
          <div className="absolute bg-black/55" style={{ top: "41%", left: 0, width: "7.5%", height: "18%" }} />
          <div className="absolute bg-black/55" style={{ top: "41%", right: 0, width: "7.5%", height: "18%" }} />

          <div className="absolute border border-white/40 rounded-lg" style={{ top: "41%", left: "7.5%", width: "85%", height: "18%" }}>
            <div className="absolute -top-px -left-px h-5 w-5 border-t-[3px] border-l-[3px] border-accent rounded-tl-lg" />
            <div className="absolute -top-px -right-px h-5 w-5 border-t-[3px] border-r-[3px] border-accent rounded-tr-lg" />
            <div className="absolute -bottom-px -left-px h-5 w-5 border-b-[3px] border-l-[3px] border-accent rounded-bl-lg" />
            <div className="absolute -bottom-px -right-px h-5 w-5 border-b-[3px] border-r-[3px] border-accent rounded-br-lg" />
            <div className="absolute left-2 right-2 h-px bg-accent/70" style={{ top: `${scanLineY}%` }} />
          </div>

          <div className="absolute left-0 right-0 flex justify-center" style={{ top: "62%" }}>
            <p className="text-xs text-white/70 font-medium px-3 py-1.5 bg-black/40 rounded-full">
              Coloca la placa dentro del marco
            </p>
          </div>
        </div>

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="mx-6 rounded-lg bg-card p-5 text-center max-w-xs">
              <Camera className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-semibold text-foreground mb-1">Camara no disponible</p>
              <p className="text-xs text-muted-foreground mb-3">{error}</p>
              <Button className="bg-primary text-primary-foreground text-xs h-9" onClick={onClose}>Volver</Button>
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10 flex items-center justify-center px-4 py-5 bg-black/60">
        <button
          type="button"
          onClick={handleCapture}
          disabled={!cameraReady}
          className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white bg-white/15 active:scale-95 transition-transform disabled:opacity-30"
          aria-label="Capturar"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
            <ScanLine className="h-6 w-6 text-primary" />
          </div>
        </button>
      </div>
    </div>
  )
})
