"use client"

import { useState, useEffect, useRef, useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Camera, X, HardHat, Plus, Minus, Bike, Car, AlertCircle, CheckCircle2 } from "lucide-react"
import type { VehicleType, VehicleRecord } from "@/lib/types"
import { formatPueblaPlate, formatMatricula, validatePlateWithMessage, validateMatriculaWithMessage } from "@/lib/validation"

export type VehicleModalPayload = {
  plate: string
  studentId: string
  studentName: string
  vehicleType: VehicleType
  hasHelmet: boolean
  helmetCount: number
  helmets: { description: string }[]
  vehicleDescription: string
  vehiclePhotoPath: string | null
}

interface VehicleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit" | "delete"
  initialRecord?: VehicleRecord | null
  onSave?: (payload: VehicleModalPayload, id?: number) => void | Promise<void>
  onDelete?: (id: number) => void | Promise<void>
}

export const VehicleModal = memo(function VehicleModal({ open, onOpenChange, mode, initialRecord, onSave, onDelete }: VehicleModalProps) {
  const [plate, setPlate] = useState("")
  const [studentName, setStudentName] = useState("")
  const [studentId, setStudentId] = useState("")
  const [vehicleType, setVehicleType] = useState<VehicleType>("moto")
  const [hasHelmet, setHasHelmet] = useState(false)
  const [helmetCount, setHelmetCount] = useState(1)
  const [helmetDescriptions, setHelmetDescriptions] = useState<string[]>([""])
  const [vehicleDescription, setVehicleDescription] = useState("")
  // vehiclePhotoUrl puede ser:
  //   - null: sin foto
  //   - string que empieza con "vehicles/": ruta del servidor (ya guardada en BD)
  //   - string que empieza con "data:": DataURL local (foto recién seleccionada, pendiente de subir)
  const [vehiclePhotoUrl, setVehiclePhotoUrl] = useState<string | null>(null)
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [plateError, setPlateError] = useState<string>("")
  const [matriculaError, setMatriculaError] = useState<string>("")
  const photoInputRef = useRef<HTMLInputElement>(null)

  const needsHelmet = vehicleType === "moto" || vehicleType === "bici"
  const needsVehicleDetails = vehicleType === "moto"

  useEffect(() => {
    if (open && mode === "add") {
      setPlate("")
      setStudentName("")
      setStudentId("")
      setVehicleType("moto")
      setHasHelmet(false)
      setHelmetCount(1)
      setHelmetDescriptions([""])
      setVehicleDescription("")
      setVehiclePhotoUrl(null)
      setPendingPhotoFile(null)
      setIsUploading(false)
      setPlateError("")
      setMatriculaError("")
    }
  }, [open, mode])

  useEffect(() => {
    if (open && mode !== "add" && initialRecord) {
      setPlate(initialRecord.plate)
      setStudentName(initialRecord.studentName)
      setStudentId(initialRecord.studentId)
      setVehicleType(initialRecord.vehicleType)
      setHasHelmet(initialRecord.hasHelmet)
      setHelmetCount(initialRecord.helmetCount)
      setHelmetDescriptions(
        initialRecord.helmets?.length
          ? initialRecord.helmets.map((h) => h.description ?? "")
          : [""]
      )
      setVehicleDescription(initialRecord.vehicleDescription ?? "")
      // Si ya tiene foto en el servidor, guardar la ruta relativa directamente
      setVehiclePhotoUrl(initialRecord.vehiclePhotoUrl ?? null)
      setPendingPhotoFile(null)
      setIsUploading(false)
      setPlateError("")
      setMatriculaError("")
    }
  }, [open, mode, initialRecord])

  useEffect(() => {
    if (plate) {
      const result = validatePlateWithMessage(plate)
      setPlateError(result.isValid ? "" : result.error || "")
    } else {
      setPlateError("")
    }
  }, [plate])

  useEffect(() => {
    if (studentId) {
      const result = validateMatriculaWithMessage(studentId)
      setMatriculaError(result.isValid ? "" : result.error || "")
    } else {
      setMatriculaError("")
    }
  }, [studentId])

  useEffect(() => {
    setHelmetDescriptions(prev => {
      const next = [...prev]
      while (next.length < helmetCount) next.push("")
      return next.slice(0, helmetCount)
    })
  }, [helmetCount])

  const updateHelmetDescription = useCallback((index: number, value: string) => {
    setHelmetDescriptions(prev => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }, [])

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Guardamos el File real para subirlo al servidor cuando se guarde
    setPendingPhotoFile(file)
    // Generamos un DataURL solo para mostrar como preview
    const reader = new FileReader()
    reader.onload = () => setVehiclePhotoUrl(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handlePlateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPlate(formatPueblaPlate(e.target.value))
  }, [])

  const handleMatriculaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentId(formatMatricula(e.target.value))
  }, [])

  const isAdd = mode === "add"
  const isEdit = mode === "edit"

  const isFormValid =
    !plateError &&
    (!isAdd || !matriculaError) &&
    plate &&
    (isAdd ? studentId && studentName.trim().length > 0 : true)

  const titles: Record<string, string> = {
    add: "Registrar estudiante y vehículo",
    edit: "Editar vehículo",
    delete: "Eliminar vehículo",
  }

  const descriptions: Record<string, string> = {
    add: "Captura los datos del alumno y registra uno de sus vehículos.",
    edit: "Modifica los datos del vehículo seleccionado.",
    delete: "Esta acción no se puede deshacer",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-md max-h-[85vh] overflow-y-auto rounded-3xl p-0 gap-0 bottom-4 top-auto translate-y-0 data-[state=open]:fade-zoom-in">
        <DialogHeader className="px-5 pt-5 pb-3 space-y-1">
          <DialogTitle className="text-lg font-semibold tracking-tight">{titles[mode]}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">{descriptions[mode]}</DialogDescription>
        </DialogHeader>

        <div className="px-5 pb-5">
          {mode === "delete" ? (
            <div className="py-2">
              <p className="text-xs text-foreground leading-relaxed">
                Se eliminará permanentemente el registro del vehículo y todos sus datos asociados.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Información del alumno (solo en alta) */}
              {isAdd && (
                <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-muted/10 px-3.5 py-3">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">
                    Información del alumno
                  </p>

                  <FieldGroup label="Nombre del estudiante" hint="Nombre completo">
                    <Input
                      placeholder="María García López"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="h-11 text-base rounded-xl"
                    />
                  </FieldGroup>

                  <FieldGroup
                    label="Matrícula del estudiante"
                    hint="9 dígitos sin espacios (ej: 202161606)"
                    error={matriculaError}
                    isValid={studentId.length > 0 && !matriculaError}
                  >
                    <Input
                      placeholder="202161606"
                      value={studentId}
                      onChange={handleMatriculaChange}
                      maxLength={9}
                      inputMode="numeric"
                      className={`h-11 text-base font-mono tracking-wider rounded-xl transition-colors ${
                        matriculaError
                          ? "border-destructive/50 focus:ring-destructive/10"
                          : studentId
                          ? "border-success/50 focus:ring-success/10"
                          : ""
                      }`}
                    />
                  </FieldGroup>
                </div>
              )}

              {/* Información del vehículo */}
              <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-card px-3.5 py-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">
                  Vehículo seleccionado
                </p>

                <FieldGroup 
                  label="Placa" 
                  hint="Puebla: T o U + 2 letras + 3-4 números"
                  error={plateError}
                  isValid={plate.length > 0 && !plateError}
                >
                  <Input
                    placeholder="TNA-123"
                    value={plate}
                    onChange={handlePlateChange}
                    maxLength={8}
                    className={`h-11 text-base font-mono tracking-widest uppercase rounded-xl transition-colors ${
                      plateError 
                        ? "border-destructive/50 focus:ring-destructive/10" 
                        : plate 
                        ? "border-success/50 focus:ring-success/10" 
                        : ""
                    }`}
                  />
                </FieldGroup>

              <FieldGroup label="Tipo de vehículo">
                <Select value={vehicleType} onValueChange={(v) => setVehicleType(v as VehicleType)}>
                  <SelectTrigger className="h-11 text-sm bg-card rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moto">
                      <span className="flex items-center gap-2">
                        <Bike className="h-4 w-4" />
                        Motocicleta
                      </span>
                    </SelectItem>
                    <SelectItem value="carro">
                      <span className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Automóvil
                      </span>
                    </SelectItem>
                    <SelectItem value="bici">
                      <span className="flex items-center gap-2">
                        <Bike className="h-4 w-4" />
                        Bicicleta
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FieldGroup>

              {needsHelmet && (
                <div className="flex flex-col gap-2.5 rounded-2xl border border-border/50 bg-muted/20 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardHat className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">¿Tiene casco?</span>
                    </div>
                    <div className="flex rounded-lg border border-border/50 overflow-hidden bg-muted/30">
                      <button
                        type="button"
                        className={`px-3.5 py-1.5 text-xs font-medium transition-all ${
                          hasHelmet
                            ? "bg-success text-success-foreground shadow-apple-sm"
                            : "text-muted-foreground"
                        }`}
                        onClick={() => setHasHelmet(true)}
                      >
                        Sí
                      </button>
                      <button
                        type="button"
                        className={`px-3.5 py-1.5 text-xs font-medium transition-all ${
                          !hasHelmet
                            ? "bg-destructive text-destructive-foreground shadow-apple-sm"
                            : "text-muted-foreground"
                        }`}
                        onClick={() => setHasHelmet(false)}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {hasHelmet && (
                    <div className="flex flex-col gap-2.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">Cantidad</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 bg-card text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                            onClick={() => setHelmetCount(c => Math.max(1, c - 1))}
                            disabled={helmetCount <= 1}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-5 text-center text-sm font-semibold text-foreground">{helmetCount}</span>
                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 bg-card text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                            onClick={() => setHelmetCount(c => Math.min(4, c + 1))}
                            disabled={helmetCount >= 4}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {helmetDescriptions.map((desc, i) => (
                        <Input
                          key={i}
                          placeholder={`Casco ${i + 1}: color, marca...`}
                          value={desc}
                          onChange={(e) => updateHelmetDescription(i, e.target.value)}
                          className="h-10 text-xs rounded-xl"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {needsVehicleDetails && (
                <div className="flex flex-col gap-2.5 rounded-2xl border border-border/50 bg-muted/20 p-3">
                  <span className="text-xs font-medium text-foreground">Detalles del vehículo</span>

                  <Input
                    placeholder="Marca, modelo, color..."
                    value={vehicleDescription}
                    onChange={(e) => setVehicleDescription(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />

                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                  {vehiclePhotoUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-border/50">
                      <img
                        src={
                          vehiclePhotoUrl.startsWith("data:")
                            ? vehiclePhotoUrl
                            : `/api/photos/${vehiclePhotoUrl}`
                        }
                        alt="Foto del vehículo"
                        className="w-full h-28 object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/70 text-background hover:bg-foreground transition-colors"
                        onClick={() => setVehiclePhotoUrl(null)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="flex w-full flex-col items-center gap-1.5 rounded-xl border border-dashed border-border/50 bg-card p-3 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
                      onClick={() => photoInputRef.current?.click()}
                    >
                      <Camera className="h-5 w-5" />
                      <span className="text-[11px] font-medium">Tomar o seleccionar foto</span>
                    </button>
                  )}
                </div>
              )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2.5 mt-4">
            {mode === "delete" ? (
              <Button
                variant="destructive"
                className="w-full h-11 text-sm font-medium rounded-xl shadow-apple hover:shadow-apple-md active:scale-98 transition-all"
                onClick={async () => {
                  if (initialRecord?.id != null && onDelete) {
                    await onDelete(initialRecord.id)
                    onOpenChange(false)
                  }
                }}
              >
                Eliminar vehículo
              </Button>
            ) : (
              <Button
                className="w-full h-11 text-sm font-medium rounded-xl bg-primary text-primary-foreground shadow-apple hover:shadow-apple-md active:scale-98 transition-all disabled:opacity-50"
                disabled={!isFormValid || isUploading}
                onClick={async () => {
                  let finalPhotoPath: string | null = null

                  // Si hay foto ya guardada en el servidor (ruta relativa), conservarla
                  if (vehiclePhotoUrl && !vehiclePhotoUrl.startsWith("data:")) {
                    finalPhotoPath = vehiclePhotoUrl
                  }

                  // Si hay un archivo nuevo (DataURL local), subirlo primero al servidor
                  if (pendingPhotoFile) {
                    setIsUploading(true)
                    try {
                      const formData = new FormData()
                      formData.append("file", pendingPhotoFile)
                      formData.append("plate", plate)
                      const res = await fetch("/api/upload", { method: "POST", body: formData })
                      if (res.ok) {
                        const data = await res.json()
                        finalPhotoPath = data.path // ej: "vehicles/TNA-uuid.jpg"
                        console.log("[modal] ✅ Foto subida al servidor:", finalPhotoPath)
                      } else {
                        console.error("[modal] ❌ Error al subir foto:", await res.text())
                        // Continuar sin foto si falla la subida
                      }
                    } catch (err) {
                      console.error("[modal] ❌ Error de red al subir foto:", err)
                    } finally {
                      setIsUploading(false)
                    }
                  }

                  const payload: VehicleModalPayload = {
                    plate,
                    studentId,
                    studentName: studentName.trim(),
                    vehicleType,
                    hasHelmet,
                    helmetCount,
                    helmets: helmetDescriptions.map((d) => ({ description: d })),
                    vehicleDescription,
                    vehiclePhotoPath: finalPhotoPath,
                  }
                  if (onSave) await onSave(payload, initialRecord?.id)
                  onOpenChange(false)
                }}
              >
                {isUploading ? "Subiendo foto..." : mode === "add" ? "Agregar vehículo" : "Guardar cambios"}
              </Button>
            )}
            <Button
              variant="ghost"
              className="w-full h-10 text-xs font-medium text-muted-foreground hover:text-foreground"
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

function FieldGroup({ 
  label, 
  hint, 
  error, 
  isValid, 
  children 
}: { 
  label: string
  hint?: string
  error?: string
  isValid?: boolean
  children: React.ReactNode 
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
        {label}
        {isValid && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
      </label>
      {children}
      {error ? (
        <div className="flex items-start gap-1.5 text-destructive rounded-lg bg-destructive/5 p-1.5">
          <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
          <p className="text-[11px] leading-tight">{error}</p>
        </div>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
