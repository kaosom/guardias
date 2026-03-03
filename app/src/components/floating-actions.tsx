"use client"

import { memo } from "react"
import { Camera, QrCode, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingActionsProps {
  onCamera: () => void
  onQr: () => void
  onAdd: () => void
}

function LiquidGlassButton({
  children,
  label,
  onClick,
  variant = "default",
}: {
  children: React.ReactNode
  label: string
  onClick?: () => void
  variant?: "default" | "accent"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative isolate flex items-center justify-center size-14 rounded-2xl",
        "transition-all duration-200 ease-out cursor-pointer",
        "active:scale-[0.92]",
        variant === "accent" ? "text-foreground" : "text-foreground/70"
      )}
      aria-label={label}
    >
      {/* Glass fill */}
      <span
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background:
            variant === "accent"
              ? "linear-gradient(160deg, rgba(255,255,255,0.95) 0%, rgba(245,247,250,0.88) 100%)"
              : "linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(240,242,245,0.75) 100%)",
          backdropFilter: "blur(40px) saturate(1.8)",
          WebkitBackdropFilter: "blur(40px) saturate(1.8)",
        }}
      />

      {/* Edge highlight */}
      <span
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow:
            "inset 0 0.5px 0 0 rgba(255,255,255,0.95), inset 0 0 0 0.5px rgba(255,255,255,0.6), 0 0 0 0.5px rgba(0,0,0,0.035)",
        }}
      />

      {/* Specular top highlight */}
      <span
        className="absolute inset-x-1 top-[0.5px] h-[38%] rounded-t-[14px] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)",
        }}
      />

      {/* Shadow */}
      <span
        className="absolute inset-0 -z-10 rounded-2xl pointer-events-none"
        style={{
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.03)",
        }}
      />

      {/* Icon */}
      <span className="relative z-10">
        {children}
      </span>
    </button>
  )
}

export const FloatingActions = memo(function FloatingActions({
  onCamera,
  onQr,
  onAdd,
}: FloatingActionsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div
        className="px-5 py-3"
        style={{
          background: "linear-gradient(180deg, rgba(242,242,247,0) 0%, rgba(242,242,247,0.85) 30%, rgba(242,242,247,0.98) 100%)",
        }}
      >
        <div className="flex items-center justify-center gap-3 max-w-lg mx-auto">
          {/* <LiquidGlassButton
            label="Escanear placa"
            onClick={onCamera}
          >
            <Camera className="size-[22px]" />
          </LiquidGlassButton> */}

          <LiquidGlassButton
            label="Escanear QR"
            onClick={onQr}
          >
            <QrCode className="size-[22px]" strokeWidth={1.75} />
          </LiquidGlassButton>

          <LiquidGlassButton
            label="Agregar vehiculo"
            onClick={onAdd}
            variant="accent"
          >
            <Plus className="size-[22px]" strokeWidth={2} />
          </LiquidGlassButton>
        </div>
      </div>
    </div>
  )
})
