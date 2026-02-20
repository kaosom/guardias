"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"

const BUAP_LOGO =
  "https://images.seeklogo.com/logo-png/25/2/buap-new-2-logo-png_seeklogo-253622.png"

export default function LoginPage() {
  const router = useRouter()
  const { setUserFromLogin } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
      setLoading(true)
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data?.error || "Credenciales incorrectas.")
          setLoading(false)
          return
        }
        if (data.user) {
          setUserFromLogin(data.user)
        }
        router.push("/")
        router.refresh()
      } catch {
        setError("Error de conexión. Intenta de nuevo.")
      } finally {
        setLoading(false)
      }
    },
    [email, password, router, setUserFromLogin]
  )

  return (
    <div className="min-h-svh flex flex-col bg-background text-foreground">
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <Image
              src={BUAP_LOGO}
              alt="BUAP"
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
              priority
            />
            <div className="text-center">
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                Control de Acceso
              </h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">BUAP</p>
            </div>
          </div>

          <div className="w-full rounded-2xl border border-border/40 bg-card p-5 shadow-apple">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-medium text-foreground">
                  Correo
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@buap.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border-border/50 bg-card/50 text-base focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-medium text-foreground">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-border/50 bg-card/50 text-base focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                  required
                />
              </div>
              {error && (
                <p className="text-[11px] text-destructive font-medium">{error}</p>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-xl bg-primary text-primary-foreground shadow-apple hover:shadow-apple-md active:scale-[0.98] transition-all disabled:opacity-50 text-sm font-medium"
              >
                {loading ? "Iniciando sesión…" : "Iniciar sesión"}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
