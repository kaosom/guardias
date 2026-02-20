"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"

export interface SessionUser {
  id: number
  email: string
  role: "admin" | "guard"
  fullName: string
  gate?: number | null
}

interface AuthContextValue {
  user: SessionUser | null
  loading: boolean
  logout: () => Promise<void>
  refresh: () => Promise<void>
  setUserFromLogin: (user: SessionUser) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  const setUserFromLogin = useCallback((user: SessionUser) => {
    setUser(user)
    setLoading(false)
  }, [])

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    window.location.href = "/login"
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, logout, refresh, setUserFromLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
