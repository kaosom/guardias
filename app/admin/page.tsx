"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Plus, Trash2, List, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GuardHeader } from "@/components/guard-header"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

const BUAP_LOGO =
  "https://images.seeklogo.com/logo-png/25/2/buap-new-2-logo-png_seeklogo-253622.png"

interface Guard {
  id: number
  email: string
  role: "guard"
  fullName: string
  gate?: number | null
}

export default function AdminPage() {
  const [guards, setGuards] = useState<Guard[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [addEmail, setAddEmail] = useState("")
  const [addPassword, setAddPassword] = useState("")
  const [addFullName, setAddFullName] = useState("")
  const [addGate, setAddGate] = useState(1)
  const [addError, setAddError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchGuards = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/guards")
      if (res.ok) {
        const data = await res.json()
        setGuards(data)
      }
    } catch {
      setGuards([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGuards()
  }, [fetchGuards])

  const handleAddGuard = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError("")
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/guards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: addEmail.trim(),
          password: addPassword,
          fullName: addFullName.trim(),
          gate: Math.min(15, Math.max(1, addGate)),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setAddError(data?.error || "Error al crear guardia.")
        setSubmitting(false)
        return
      }
      setAddOpen(false)
      setAddEmail("")
      setAddPassword("")
      setAddFullName("")
      setAddGate(1)
      fetchGuards()
    } catch {
      setAddError("Error de conexión.")
    } finally {
      setSubmitting(false)
    }
  }, [addEmail, addPassword, addFullName, addGate, fetchGuards])

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("¿Eliminar este guardia? No se pueden deshacer los cambios.")) return
      setDeletingId(id)
      try {
        const res = await fetch(`/api/admin/guards/${id}`, { method: "DELETE" })
        if (res.ok) {
          setGuards((prev) => prev.filter((g) => g.id !== id))
        }
      } finally {
        setDeletingId(null)
      }
    },
    []
  )

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <GuardHeader />
      <main className="flex-1 px-5 py-6 pb-8 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-secondary transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Administración de guardias
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Crear, eliminar guardias y ver sus registros
            </p>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setAddOpen(true)}
            className="h-10 rounded-xl bg-primary text-primary-foreground shadow-apple hover:shadow-apple-md active:scale-[0.98] text-sm font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar guardia
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : guards.length === 0 ? (
          <div className="rounded-2xl border border-border/40 bg-card p-8 text-center">
            <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No hay guardias</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Agrega el primero con el botón de arriba.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {guards.map((g) => (
              <div
                key={g.id}
                className="rounded-2xl border border-border/40 bg-card p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{g.fullName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {g.email}{g.gate != null ? ` · Puerta ${g.gate}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/guards/${g.id}`}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-foreground/70 hover:bg-secondary transition-colors text-xs font-medium"
                  >
                    <List className="h-3.5 w-3.5" />
                    Ver registros
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(g.id)}
                    disabled={deletingId === g.id}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-destructive hover:bg-destructive/10 transition-colors text-xs font-medium disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-sm rounded-2xl p-0 gap-0 bottom-4 top-auto translate-y-0 data-[state=open]:fade-zoom-in">
          <DialogHeader className="px-4 pt-4 pb-2 space-y-0.5">
            <DialogTitle className="text-base font-semibold tracking-tight">
              Agregar guardia
            </DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">
              El guardia podrá iniciar sesión y registrar entradas y salidas.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddGuard} className="px-4 pb-4 space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="admin-add-email" className="text-xs font-medium text-foreground">
                Correo
              </label>
              <Input
                id="admin-add-email"
                type="email"
                placeholder="guardia@buap.mx"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                className="h-11 rounded-xl"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="admin-add-password" className="text-xs font-medium text-foreground">
                Contraseña
              </label>
              <Input
                id="admin-add-password"
                type="password"
                placeholder="••••••••"
                value={addPassword}
                onChange={(e) => setAddPassword(e.target.value)}
                className="h-11 rounded-xl"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="admin-add-name" className="text-xs font-medium text-foreground">
                Nombre completo
              </label>
              <Input
                id="admin-add-name"
                type="text"
                placeholder="Juan Rodríguez"
                value={addFullName}
                onChange={(e) => setAddFullName(e.target.value)}
                className="h-11 rounded-xl"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="admin-add-gate" className="text-xs font-medium text-foreground">
                Puerta
              </label>
              <Input
                id="admin-add-gate"
                type="number"
                min={1}
                max={15}
                placeholder="1"
                value={addGate}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  if (!Number.isNaN(v)) setAddGate(Math.min(15, Math.max(1, v)))
                }}
                className="h-11 rounded-xl"
                required
              />
              <p className="text-[11px] text-muted-foreground">Entre 1 y 15</p>
            </div>
            {addError && (
              <p className="text-[11px] text-destructive font-medium">{addError}</p>
            )}
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setAddOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-primary text-primary-foreground"
              >
                {submitting ? "Creando…" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
