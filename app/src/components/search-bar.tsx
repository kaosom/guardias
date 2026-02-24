"use client"

import { useState, useEffect, memo, useCallback, type KeyboardEvent, type ChangeEvent } from "react"
import { Search, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading?: boolean
  externalQuery?: string
}

export const SearchBar = memo(function SearchBar({ onSearch, isLoading, externalQuery }: SearchBarProps) {
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (externalQuery) {
      setQuery(externalQuery)
    }
  }, [externalQuery])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      onSearch(query.trim())
    }
  }, [query, onSearch])

  const handleSearchClick = useCallback(() => {
    if (query.trim()) {
      onSearch(query.trim())
    }
  }, [query, onSearch])

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }, [])

  const handleClear = useCallback(() => {
    setQuery("")
  }, [])

  return (
    <div className="space-y-3">
      <div className="relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-primary" />
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Buscar placa o matrícula"
          autoComplete="off"
          autoCapitalize="characters"
          className="flex h-12 w-full rounded-xl border border-border/50 bg-card/50 pl-10 pr-12 text-base font-normal text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:bg-card transition-all backdrop-blur-sm shadow-apple-sm"
        />
        {query && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-muted/80 hover:bg-muted text-muted-foreground transition-all active:scale-95"
            aria-label="Limpiar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <Button
        type="button"
        className="h-11 w-full text-sm font-medium bg-primary text-primary-foreground rounded-xl shadow-apple hover:shadow-apple-md active:scale-[0.98] transition-all disabled:opacity-40"
        onClick={handleSearchClick}
        disabled={!query.trim() || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Buscando...
          </>
        ) : (
          "Buscar"
        )}
      </Button>
    </div>
  )
})
