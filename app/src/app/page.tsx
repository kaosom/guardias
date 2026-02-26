"use client"

import { useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { ArrowDownToLine, ArrowUpFromLine, SearchX, Car, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GuardHeader } from "@/components/guard-header"
import { SearchBar } from "@/components/search-bar"
import { ResultCard } from "@/components/result-card"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { FloatingActions } from "@/components/floating-actions"
import { type VehicleRecord } from "@/lib/types"
import type { VehicleModalPayload } from "@/components/vehicle-modal"
import { UserEditDialog } from "@/components/user-edit-dialog"

const VehicleModal = dynamic(
  () => import("@/components/vehicle-modal").then((mod) => ({ default: mod.VehicleModal })),
  { ssr: false }
)

const CameraScanner = dynamic(() => import("@/components/camera-scanner").then(mod => ({ default: mod.CameraScanner })), {
  ssr: false,
})

const QrScanner = dynamic(() => import("@/components/qr-scanner").then(mod => ({ default: mod.QrScanner })), {
  ssr: false,
})

const OcrConfirmation = dynamic(() => import("@/components/ocr-confirmation").then(mod => ({ default: mod.OcrConfirmation })), {
  ssr: false,
})

const CameraPermission = dynamic(() => import("@/components/camera-permission").then(mod => ({ default: mod.CameraPermission })), {
  ssr: false,
})

export default function Home() {
  const [showCameraPermission, setShowCameraPermission] = useState(false)
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false)
  const [result, setResult] = useState<VehicleRecord | null>(null)
  const [studentVehicles, setStudentVehicles] = useState<VehicleRecord[]>([])
  const [notFound, setNotFound] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete">("add")
  const [externalQuery, setExternalQuery] = useState<string | undefined>(undefined)
  const [mounted, setMounted] = useState(false)

  const [cameraOpen, setCameraOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [ocrConfirmOpen, setOcrConfirmOpen] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [detectedPlate, setDetectedPlate] = useState("")

  const [qrAction, setQrAction] = useState<"entry" | "exit" | null>(null)
  const [userDialogOpen, setUserDialogOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true)
    setNotFound(false)
    setResult(null)
    setStudentVehicles([])
    setQrAction(null)
    const q = query.trim()
    if (!q) {
      setIsLoading(false)
      return
    }
    try {
      const res = await fetch(`/api/vehicles?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data: VehicleRecord = await res.json()
        setResult(data)

        // Cargar todos los vehículos registrados para el mismo alumno
        try {
          const listRes = await fetch(`/api/vehicles/student/${encodeURIComponent(data.studentId)}`)
          if (listRes.ok) {
            const list: VehicleRecord[] = await listRes.json()
            setStudentVehicles(list.length ? list : [data])
          } else {
            setStudentVehicles([data])
          }
        } catch {
          setStudentVehicles([data])
        }
      } else {
        setNotFound(true)
      }
    } catch {
      setNotFound(true)
      setStudentVehicles([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!result?.id) {
      setConfirmOpen(false)
      return
    }
    const type = result.status === "outside" ? "entry" : "exit"
    try {
      const res = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: result.id, type }),
      })
      if (res.ok) {
        const data = await res.json()
        setResult({ ...result, status: data.newStatus })
      }
    } finally {
      setConfirmOpen(false)
      setQrAction(null)
    }
  }, [result])

  const handleCameraCapture = useCallback((imageDataUrl: string) => {
    setCapturedImage(imageDataUrl)
    setCameraOpen(false)
    setDetectedPlate("")
    setOcrConfirmOpen(true)
  }, [])

  const handleOcrConfirm = useCallback((plate: string) => {
    setOcrConfirmOpen(false)
    setExternalQuery(plate)
    setTimeout(() => handleSearch(plate), 300)
  }, [handleSearch])

  const handleOcrRetry = useCallback(() => {
    setOcrConfirmOpen(false)
    setCapturedImage(null)
    setTimeout(() => setCameraOpen(true), 100)
  }, [])

  // QR scan result: soporta QR institucional (base64 + JSON con matricula) y formato directo JSON
  const handleQrScan = useCallback(
    async (data: string) => {
      setQrOpen(false)

      const { parseInstitutionalQr } = await import("@/lib/qr-payload")
      const parsed = await parseInstitutionalQr(data)
      if (parsed) {
        if (parsed.action === "entry" || parsed.action === "exit") {
          setQrAction(parsed.action)
        }
        setExternalQuery(parsed.searchTerm)
        setTimeout(() => handleSearch(parsed.searchTerm), 300)
        return
      }

      // Fallback: JSON directo o valor crudo
      try {
        const obj = JSON.parse(data) as Record<string, unknown>
        const searchKey =
          (typeof obj.plate === "string" && obj.plate) ||
          (typeof obj.studentId === "string" && obj.studentId) ||
          data
        if (obj.action === "entry" || obj.action === "exit") {
          setQrAction(obj.action as "entry" | "exit")
        }
        setExternalQuery(searchKey)
        setTimeout(() => handleSearch(searchKey), 300)
      } catch {
        setExternalQuery(data)
        setTimeout(() => handleSearch(data), 300)
      }
    },
    [handleSearch]
  )

  const openModal = useCallback((mode: "add" | "edit" | "delete") => {
    setModalMode(mode)
    setModalOpen(true)
  }, [])

  const handleModalSave = useCallback(async (payload: VehicleModalPayload, id?: number) => {
      const body = {
        plate: payload.plate,
        studentId: payload.studentId,
        studentName: payload.studentName,
        vehicleType: payload.vehicleType,
        hasHelmet: payload.hasHelmet,
        helmetCount: payload.helmetCount,
        helmets: payload.helmets,
        vehicleDescription: payload.vehicleDescription || undefined,
        vehiclePhotoPath: payload.vehiclePhotoPath ?? null,
      }
      if (id != null) {
        const res = await fetch(`/api/vehicles/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        if (res.ok && result?.id === id) {
          const data = await res.json()
          setResult(data)
        }
      } else {
        const res = await fetch("/api/vehicles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        if (res.ok) {
          const data = await res.json()
          setResult(data)
        }
      }
    },
    [result?.id]
  )

  const handleModalDelete = useCallback(async (id: number) => {
    const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" })
    if (res.ok && result?.id === id) setResult(null)
  }, [result?.id])

  const isEntry = result?.status === "outside"

  const handleCameraClick = useCallback(() => {
    if (!cameraPermissionGranted) {
      setShowCameraPermission(true)
    } else {
      setCameraOpen(true)
    }
  }, [cameraPermissionGranted])

  const handlePermissionGranted = useCallback(() => {
    setCameraPermissionGranted(true)
    setCameraOpen(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <CameraPermission 
        open={showCameraPermission}
        onClose={() => setShowCameraPermission(false)}
        onPermissionGranted={handlePermissionGranted}
      />
      
      <GuardHeader />

      {/* Main content - add bottom padding for floating bar */}
      <main className="flex flex-1 flex-col gap-4 px-5 py-6 pb-28 max-w-2xl mx-auto w-full">
          {/* Search */}
          <SearchBar
            onSearch={handleSearch}
            isLoading={isLoading}
            externalQuery={externalQuery}
          />

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm font-medium text-muted-foreground">Buscando registro...</p>
            </div>
          )}

          {/* Result */}
          {result && !isLoading && (
            <div className="flex flex-col gap-3">
              <ResultCard
                record={result}
                onEditUser={() => {
                  if (!result) return
                  setUserDialogOpen(true)
                }}
                onEditVehicleInHeader={() => openModal("edit")}
                showVehicleEditInHeader={studentVehicles.length <= 1}
              />

              {/* Lista de vehículos del mismo alumno */}
              {studentVehicles.length > 1 && (
                <div className="rounded-2xl border border-border/50 bg-card/60 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Vehículos registrados para este alumno
                    </p>
                    <span className="text-[11px] font-semibold text-foreground bg-muted px-2 py-0.5 rounded-full">
                      {studentVehicles.length} en total
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {studentVehicles.map((v) => {
                      const active = v.id === result.id
                      const inside = v.status === "inside"
                      return (
                        <div
                          key={v.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setResult(v)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              setResult(v)
                            }
                          }}
                          className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left transition-colors cursor-pointer ${
                            active ? "bg-primary/8 border border-primary/30" : "bg-card border border-border/40"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground truncate">
                              {v.plate} · {v.vehicleType === "carro" ? "Automóvil" : v.vehicleType === "moto" ? "Motocicleta" : "Bicicleta"}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {inside ? "Dentro del campus" : "Fuera del campus"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                inside
                                  ? "bg-success/15 text-success"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {inside ? "Dentro" : "Fuera"}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setResult(v)
                                openModal("edit")
                              }}
                              className="inline-flex items-center gap-1 rounded-full border border-border/50 px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
                              aria-label="Editar vehículo"
                            >
                              <Pencil className="h-3 w-3" />
                              Editar
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* QR action indicator */}
              {qrAction && (
                <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${
                  qrAction === "entry"
                    ? "bg-success/10 border border-success/20"
                    : "bg-destructive/10 border border-destructive/20"
                }`}>
                  <QrCodeIcon className="h-3.5 w-3.5" />
                  <p className={`text-xs font-medium ${
                    qrAction === "entry" ? "text-success" : "text-destructive"
                  }`}>
                    {qrAction === "entry"
                      ? "QR solicita registro de entrada"
                      : "QR solicita registro de salida"}
                  </p>
                </div>
              )}

              {/* Entry/Exit CTA */}
              <Button
                className={`h-12 w-full text-base font-semibold rounded-xl shadow-apple hover:shadow-apple-md active:scale-[0.98] transition-all ${
                  isEntry
                    ? "bg-success text-success-foreground hover:bg-success/90"
                    : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                }`}
                onClick={() => setConfirmOpen(true)}
              >
                {isEntry ? (
                  <>
                    <ArrowDownToLine className="mr-2 h-5 w-5" />
                    Registrar entrada
                  </>
                ) : (
                  <>
                    <ArrowUpFromLine className="mr-2 h-5 w-5" />
                    Registrar salida
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Not found */}
          {notFound && !isLoading && (
            <div className="flex flex-col items-center gap-2.5 rounded-xl border-2 border-dashed border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <SearchX className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Sin resultados</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  No se encontro ningun registro con esos datos
                </p>
              </div>
              <Button
                variant="outline"
                className="mt-1 h-10 gap-1.5 bg-transparent text-xs"
                onClick={() => openModal("add")}
              >
                <Car className="h-3.5 w-3.5" />
                Agregar vehiculo nuevo
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!result && !notFound && !isLoading && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/50 bg-card/30 p-10 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
                <Car className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-xs">
                Busca un vehículo por placa o matrícula, o usa los botones de escaneo
              </p>
            </div>
          )}
      </main>

      {/* Floating bottom action bar */}
      <FloatingActions
        onCamera={handleCameraClick}
        onQr={() => setQrOpen(true)}
        onAdd={() => openModal("add")}
      />

      {/* Scanners */}
      <CameraScanner
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      <QrScanner
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        onScan={handleQrScan}
      />

      <OcrConfirmation
        open={ocrConfirmOpen}
        imageDataUrl={capturedImage}
        detectedPlate={detectedPlate}
        onConfirm={handleOcrConfirm}
        onRetry={handleOcrRetry}
        onClose={() => setOcrConfirmOpen(false)}
      />

      {/* Dialogs */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        record={result}
        onConfirm={handleConfirm}
      />

      <VehicleModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        initialRecord={modalMode !== "add" ? result : null}
        onSave={handleModalSave}
        onDelete={handleModalDelete}
      />

      <UserEditDialog
        open={userDialogOpen}
        onOpenChange={setUserDialogOpen}
        initialName={result?.studentName ?? ""}
        initialStudentId={result?.studentId ?? ""}
        onSave={async ({ fullName, studentId }) => {
          if (!result?.studentUserId) return
          const res = await fetch(`/api/users/${result.studentUserId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullName, studentId }),
          })
          if (!res.ok) return
          const data = await res.json()
          const newName = data.fullName as string
          const newId = data.studentId as string

          setResult((prev) =>
            prev
              ? {
                  ...prev,
                  studentName: newName,
                  studentId: newId,
                }
              : prev
          )

          setStudentVehicles((prev) =>
            prev.map((v) => ({
              ...v,
              studentName: newName,
              studentId: newId,
            }))
          )
        }}
      />
    </div>
  )
}

// Small inline helper since we import QrCode from lucide in other files
function QrCodeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  )
}
