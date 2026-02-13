"use client"

import { useState, memo } from "react"
import Image from "next/image"
import { DoorOpen, User, LogOut, Clock, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export const GuardHeader = memo(function GuardHeader() {
  const [gateModalOpen, setGateModalOpen] = useState(false)
  const [userModalOpen, setUserModalOpen] = useState(false)

  return (
    <>
      <header className="flex items-center justify-between bg-card border-b border-border/40 px-5 py-3 backdrop-blur-xl bg-card/80 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <Image
            src="https://images.seeklogo.com/logo-png/25/2/buap-new-2-logo-png_seeklogo-253622.png"
            alt="BUAP"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground leading-tight tracking-tight">
              Control de Acceso
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">
              BUAP
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-foreground/70 hover:bg-secondary transition-colors"
            onClick={() => setGateModalOpen(true)}
          >
            <DoorOpen className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">P1</span>
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/70 hover:bg-secondary transition-colors"
            onClick={() => setUserModalOpen(true)}
            aria-label="Usuario"
          >
            <User className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <Dialog open={gateModalOpen} onOpenChange={setGateModalOpen}>
        <DialogContent className="max-w-[85vw] sm:max-w-sm rounded-2xl p-0 gap-0 bottom-4 top-auto translate-y-0 data-[state=open]:fade-zoom-in">
          <DialogHeader className="px-4 pt-4 pb-2 space-y-0.5">
            <DialogTitle className="text-base font-semibold tracking-tight">Puerta Asignada</DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">
              Información de la puerta activa
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-secondary/20 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <DoorOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">Puerta 1</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">Entrada Principal Norte</p>
              </div>
            </div>

            <div className="space-y-0 rounded-xl bg-card border border-border/40 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/40">
                <span className="text-[11px] text-muted-foreground">Sesión iniciada</span>
                <span className="text-xs font-medium text-foreground">11 Feb 2026 - 06:00 AM</span>
              </div>
              
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-[11px] text-muted-foreground">Estado</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-xs font-medium text-success">Activa</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
        <DialogContent className="max-w-[85vw] sm:max-w-sm rounded-2xl p-0 gap-0 bottom-4 top-auto translate-y-0 data-[state=open]:fade-zoom-in">
          <DialogHeader className="px-4 pt-4 pb-2 space-y-0.5">
            <DialogTitle className="text-base font-semibold tracking-tight">Perfil de Guardia</DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">
              Información de la sesión actual
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-secondary/20 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">Juan Rodríguez</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">ID: GRD-2024-001</p>
              </div>
            </div>

            <div className="space-y-0 rounded-xl bg-card border border-border/40 overflow-hidden mb-3">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/40">
                <span className="text-[11px] text-muted-foreground">Puerta asignada</span>
                <span className="text-xs font-medium text-foreground">Puerta 1 - Principal</span>
              </div>
              
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/40">
                <span className="text-[11px] text-muted-foreground">Turno</span>
                <span className="text-xs font-medium text-foreground">Matutino (06:00 - 14:00)</span>
              </div>
              
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-[11px] text-muted-foreground">Sesión iniciada</span>
                <span className="text-xs font-medium text-foreground">11 Feb 2026 - 06:00 AM</span>
              </div>
            </div>

            <Button
              variant="destructive"
              className="w-full h-10 text-xs font-medium rounded-lg shadow-apple hover:shadow-apple-md active:scale-98 transition-all"
              onClick={() => setUserModalOpen(false)}
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Cerrar sesión
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
})
