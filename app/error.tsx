"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">
            Algo salió mal
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Ocurrió un error inesperado. Por favor, intenta recargar la página.
          </p>
        </div>
        <Button
          onClick={reset}
          className="w-full h-14 text-base font-medium rounded-2xl bg-primary hover:bg-primary/90 transition-all"
        >
          Intentar de nuevo
        </Button>
      </div>
    </div>
  )
}
