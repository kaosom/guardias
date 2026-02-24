"use client"

import { useEffect, useRef, useState, useCallback, memo } from "react"
import { X, QrCode, FlashlightOff, Flashlight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QrScannerProps {
  open: boolean
  onClose: () => void
  onScan: (data: string) => void
}

export const QrScanner = memo(function QrScanner({ open, onClose, onScan }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanningRef = useRef(false)
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
      y += direction * 1.2
      if (y > 100) direction = -1
      if (y < 0) direction = 1
      setScanLineY(y)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [open, cameraReady])

  const stopCamera = useCallback(() => {
    scanningRef.current = false
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop()
      streamRef.current = null
    }
    setCameraReady(false)
    setTorchOn(false)
    setTorchSupported(false)
  }, [])

  const startScanning = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    scanningRef.current = true
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return

    let detector: BarcodeDetector | null = null
    if (typeof BarcodeDetector !== "undefined") {
      try { detector = new BarcodeDetector({ formats: ["qr_code"] }) } catch { detector = null }
    }

    let lastScanTime = 0
    async function scanFrame() {
      if (!scanningRef.current || !video || video.readyState < 2) {
        if (scanningRef.current) requestAnimationFrame(scanFrame)
        return
      }
      const now = performance.now()
      if (now - lastScanTime < 100) { requestAnimationFrame(scanFrame); return }
      lastScanTime = now
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      if (ctx) ctx.drawImage(video, 0, 0)
      try {
        if (detector) {
          const barcodes = await detector.detect(canvas)
          if (barcodes.length > 0 && barcodes[0].rawValue) {
            scanningRef.current = false
            onScan(barcodes[0].rawValue)
            return
          }
        }
      } catch { /* continue scanning */ }
      if (scanningRef.current) requestAnimationFrame(scanFrame)
    }
    requestAnimationFrame(scanFrame)
  }, [onScan])

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
        startScanning()
      }
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean }
      if (capabilities?.torch) setTorchSupported(true)
    } catch (err) {
      console.error('Camera error:', err)
      setError("No se pudo acceder a la cámara. Verifica los permisos del navegador.")
    }
  }, [startScanning])

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

  function handleManualScan() {
    const demoQRs = [
      JSON.stringify({ studentId: "2024-0158", plate: "ABC-1234", action: "entry" }),
      JSON.stringify({ studentId: "2023-0342", plate: "XYZ-5678", action: "exit" }),
    ]
    onScan(demoQRs[Math.floor(Math.random() * demoQRs.length)])
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-black/60">
        <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/10" onClick={onClose} aria-label="Cerrar">
          <X className="h-5 w-5" />
        </Button>
        <p className="text-xs font-semibold text-white/90 uppercase tracking-wider">Escanear QR</p>
        {torchSupported ? (
          <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/10" onClick={toggleTorch} aria-label="Linterna">
            {torchOn ? <Flashlight className="h-4 w-4" /> : <FlashlightOff className="h-4 w-4" />}
          </Button>
        ) : <div className="h-10 w-10" />}
      </div>

      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />

        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-0 right-0 bg-black/60" style={{ height: "25%" }} />
          <div className="absolute bottom-0 left-0 right-0 bg-black/60" style={{ height: "25%" }} />
          <div className="absolute bg-black/60" style={{ top: "25%", left: 0, width: "12.5%", height: "50%" }} />
          <div className="absolute bg-black/60" style={{ top: "25%", right: 0, width: "12.5%", height: "50%" }} />

          <div className="absolute rounded-xl" style={{ top: "25%", left: "12.5%", width: "75%", height: "50%" }}>
            <div className="absolute -top-px -left-px h-8 w-8 border-t-[3px] border-l-[3px] border-accent rounded-tl-xl" />
            <div className="absolute -top-px -right-px h-8 w-8 border-t-[3px] border-r-[3px] border-accent rounded-tr-xl" />
            <div className="absolute -bottom-px -left-px h-8 w-8 border-b-[3px] border-l-[3px] border-accent rounded-bl-xl" />
            <div className="absolute -bottom-px -right-px h-8 w-8 border-b-[3px] border-r-[3px] border-accent rounded-br-xl" />
            <div className="absolute inset-0 border border-white/20 rounded-xl" />
            <div className="absolute left-3 right-3 h-px bg-accent/60" style={{ top: `${scanLineY}%` }} />
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <QrCode className="h-14 w-14 text-white/15" />
              </div>
            )}
          </div>

          <div className="absolute left-0 right-0 flex flex-col items-center gap-1" style={{ top: "77%" }}>
            <p className="text-xs text-white/70 font-medium px-3 py-1.5 bg-black/40 rounded-full">
              Alinea el QR dentro del marco
            </p>
            <p className="text-[10px] text-white/40">
              El estudiante genera su QR desde Autoservicios
            </p>
          </div>
        </div>

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="mx-6 rounded-lg bg-card p-5 text-center max-w-xs">
              <QrCode className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-semibold text-foreground mb-1">Camara no disponible</p>
              <p className="text-xs text-muted-foreground mb-3">{error}</p>
              <Button className="bg-primary text-primary-foreground text-xs h-9" onClick={onClose}>Volver</Button>
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-2 px-4 py-5 bg-black/60">
        <button
          type="button"
          onClick={handleManualScan}
          disabled={!cameraReady}
          className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white bg-white/15 active:scale-95 transition-transform disabled:opacity-30"
          aria-label="Escanear QR manualmente"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
            <QrCode className="h-6 w-6 text-primary" />
          </div>
        </button>
        <p className="text-[10px] text-white/50">Pulsa para simular escaneo</p>
      </div>
    </div>
  )
})

declare global {
  interface BarcodeDetector {
    detect(source: HTMLCanvasElement | ImageBitmap | HTMLImageElement): Promise<Array<{ rawValue: string }>>
  }
  var BarcodeDetector: {
    new (options?: { formats: string[] }): BarcodeDetector
  } | undefined
}
