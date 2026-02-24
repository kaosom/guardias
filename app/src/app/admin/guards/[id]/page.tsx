"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine } from "lucide-react"
import { GuardHeader } from "@/components/guard-header"

interface Movement {
  id: number
  vehicle_id: number
  plate: string
  type: "entry" | "exit"
  created_at: string
}

export default function AdminGuardMovementsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [id, setId] = useState<string | null>(null)
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [guardName, setGuardName] = useState("")

  const fetchData = useCallback(async (guardId: string) => {
    try {
      const [guardsRes, movRes] = await Promise.all([
        fetch("/api/admin/guards"),
        fetch(`/api/admin/guards/${guardId}/movements?limit=100`),
      ])
      if (guardsRes.ok) {
        const guards = await guardsRes.json()
        const g = guards.find((x: { id: number }) => String(x.id) === guardId)
        if (g) setGuardName(g.fullName)
      }
      if (movRes.ok) {
        const data = await movRes.json()
        setMovements(data)
      }
    } catch {
      setMovements([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    params.then((p) => {
      if (mounted) {
        setId(p.id)
        setLoading(true)
        fetchData(p.id)
      }
    })
    return () => {
      mounted = false
    }
  }, [params, fetchData])

  const formatDate = (s: string) => {
    try {
      const d = new Date(s)
      return d.toLocaleString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return s
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <GuardHeader />
      <main className="flex-1 px-5 py-6 pb-8 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/admin"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-secondary transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Registros del guardia
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {guardName || (id ? `ID ${id}` : "…")}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : movements.length === 0 ? (
          <div className="rounded-2xl border border-border/40 bg-card p-8 text-center">
            <p className="text-sm font-medium text-foreground">Sin movimientos</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Este guardia aún no ha registrado entradas o salidas.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {movements.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-border/40 bg-card px-4 py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      m.type === "entry" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {m.type === "entry" ? (
                      <ArrowDownToLine className="h-4 w-4" />
                    ) : (
                      <ArrowUpFromLine className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground font-mono tracking-wider truncate">
                      {m.plate}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {m.type === "entry" ? "Entrada" : "Salida"} · {formatDate(m.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
