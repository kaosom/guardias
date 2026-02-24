"use client"

import { memo } from "react"
import {
  User,
  GraduationCap,
  Car,
  Bike,
  HardHat,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileText,
  Pencil,
} from "lucide-react"
import { VEHICLE_TYPE_LABELS, type VehicleRecord } from "@/lib/types"

interface ResultCardProps {
  record: VehicleRecord
  onEdit?: () => void
}

export const ResultCard = memo(function ResultCard({ record, onEdit }: ResultCardProps) {
  const isInside = record.status === "inside"
  const vehicleLabel = VEHICLE_TYPE_LABELS[record.vehicleType] || record.vehicleType
  const VehicleIcon = record.vehicleType === "carro" ? Car : Bike

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-apple hover:shadow-apple-md transition-all">
      <div className="relative flex items-start gap-3 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-foreground truncate tracking-tight">{record.studentName}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">{record.studentId}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium ${
            isInside
              ? "bg-primary/8 text-primary"
              : "bg-muted text-muted-foreground"
          }`}>
            {isInside ? <ArrowUpFromLine className="h-3.5 w-3.5" /> : <ArrowDownToLine className="h-3.5 w-3.5" />}
            {isInside ? "Dentro" : "Fuera"}
          </div>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95 transition-all"
              aria-label="Editar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="h-px bg-border/30" />

      <div className="grid grid-cols-3 gap-px bg-border/30">
        <div className="flex flex-col items-center py-3.5 px-2 bg-card">
          <VehicleIcon className="h-5 w-5 text-muted-foreground mb-1.5" />
          <span className="text-[10px] text-muted-foreground font-medium mb-0.5">Tipo</span>
          <span className="text-sm font-semibold text-foreground">{vehicleLabel}</span>
        </div>
        <div className="flex flex-col items-center py-3.5 px-2 bg-card">
          <span className="text-[10px] text-muted-foreground font-medium mb-1.5">Placa</span>
          <span className="text-base font-bold text-foreground tracking-wider font-mono">{record.plate}</span>
        </div>
        <div className="flex flex-col items-center py-3.5 px-2 bg-card">
          <HardHat className="h-5 w-5 text-muted-foreground mb-1.5" />
          <span className="text-[10px] text-muted-foreground font-medium mb-0.5">Casco</span>
          {record.hasHelmet ? (
            <span className="text-sm font-semibold text-success">{`Sí (${record.helmetCount})`}</span>
          ) : (
            <span className="text-sm font-semibold text-destructive">No</span>
          )}
        </div>
      </div>

      {(record.vehicleDescription || record.vehiclePhotoUrl || (record.hasHelmet && record.helmets.length > 0)) && (
        <>
          <div className="h-px bg-border/30" />
          <div className="flex flex-col gap-3 p-4">
            {record.vehiclePhotoUrl && (
              <div className="rounded-xl overflow-hidden border border-border/50">
                <img
                  src={
                    record.vehiclePhotoUrl.startsWith("data:")
                      ? record.vehiclePhotoUrl
                      : `/api/photos/${record.vehiclePhotoUrl}`
                  }
                  alt="Foto del vehiculo"
                  className="w-full h-32 object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {record.vehicleDescription && (
              <div className="flex items-start gap-2 rounded-xl bg-secondary/30 px-3 py-2.5">
                <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <p className="text-sm text-foreground leading-relaxed">{record.vehicleDescription}</p>
              </div>
            )}

            {record.hasHelmet && record.helmets.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <HardHat className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Cascos registrados</span>
                </div>
                {record.helmets.map((h, i) => (
                  <div key={i} className="flex items-center gap-2.5 rounded-xl bg-success/5 border border-success/15 px-3 py-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-success/10 shrink-0">
                      <span className="text-xs font-bold text-success">{i + 1}</span>
                    </div>
                    <p className="text-sm text-foreground">{h.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
})
