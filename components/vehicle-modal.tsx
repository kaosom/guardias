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
import type { VehicleType } from "@/lib/types"
import { formatPueblaPlate, formatMatricula, validatePlateWithMessage, validateMatriculaWithMessage } from "@/lib/validation"

interface VehicleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit" | "delete"
}

export const VehicleModal = memo(function VehicleModal({ open, onOpenChange, mode }: VehicleModalProps) {
  const [plate, setPlate] = useState("")
  const [studentId, setStudentId] = useState("")
  const [vehicleType, setVehicleType] = useState<VehicleType>("moto")
  const [hasHelmet, setHasHelmet] = useState(false)
  const [helmetCount, setHelmetCount] = useState(1)
  const [helmetDescriptions, setHelmetDescriptions] = useState<string[]>([""])
  const [vehicleDescription, setVehicleDescription] = useState("")
  const [vehiclePhotoUrl, setVehiclePhotoUrl] = useState<string | null>(null)
  const [plateError, setPlateError] = useState<string>("")
  const [matriculaError, setMatriculaError] = useState<string>("")
  const photoInputRef = useRef<HTMLInputElement>(null)

  const needsHelmet = vehicleType === "moto" || vehicleType === "bici"
  const needsVehicleDetails = vehicleType === "moto"

  useEffect(() => {
    if (open && mode === "add") {
      setPlate("")
      setStudentId("")
      setVehicleType("moto")
      setHasHelmet(false)
      setHelmetCount(1)
      setHelmetDescriptions([""])
      setVehicleDescription("")
      setVehiclePhotoUrl(null)
      setPlateError("")
      setMatriculaError("")
    }
  }, [open, mode])

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

  const isFormValid = !plateError && !matriculaError && plate && studentId

  const titles: Record<string, string> = {
    add: "Agregar vehículo",
    edit: "Editar vehículo",
    delete: "Eliminar vehículo",
  }

  const descriptions: Record<string, string> = {
    add: "Registra un nuevo vehículo en el sistema",
    edit: "Modifica los datos del vehículo",
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
            <div className="flex flex-col gap-3">
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
                        src={vehiclePhotoUrl}
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
          )}

          <div className="flex flex-col gap-2.5 mt-4">
            {mode === "delete" ? (
              <Button
                variant="destructive"
                className="w-full h-11 text-sm font-medium rounded-xl shadow-apple hover:shadow-apple-md active:scale-98 transition-all"
                onClick={() => onOpenChange(false)}
              >
                Eliminar vehículo
              </Button>
            ) : (
              <Button
                className="w-full h-11 text-sm font-medium rounded-xl bg-primary text-primary-foreground shadow-apple hover:shadow-apple-md active:scale-98 transition-all disabled:opacity-50"
                onClick={() => onOpenChange(false)}
                disabled={!isFormValid}
              >
                {mode === "add" ? "Agregar vehículo" : "Guardar cambios"}
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
