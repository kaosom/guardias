"use client";

import { useState, memo, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  LogOut,
  Shield,
  Settings,
  Plus,
  Trash2,
  List,
  DoorOpen,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { APP_LOCATIONS, getMaxGatesForLocationName } from "@/lib/locations";

interface Guard {
  id: number;
  email: string;
  role: "guard";
  fullName: string;
  gate?: number | null;
  locationName?: string | null;
}

export const GuardHeader = memo(function GuardHeader() {
  const { user, loading, logout } = useAuth();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [guardsLoading, setGuardsLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addFullName, setAddFullName] = useState("");
  const [addGate, setAddGate] = useState("1");
  const [addLocationName, setAddLocationName] = useState("");
  const [addError, setAddError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editingGuardId, setEditingGuardId] = useState<number | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editGate, setEditGate] = useState("1");
  const [editLocationName, setEditLocationName] = useState("");
  const [editError, setEditError] = useState("");
  const [editing, setEditing] = useState(false);

  const fetchGuards = useCallback(async () => {
    setGuardsLoading(true);
    try {
      const res = await fetch("/api/admin/guards");
      if (res.ok) {
        const data = await res.json();
        setGuards(data);
      }
    } catch {
      setGuards([]);
    } finally {
      setGuardsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!adminModalOpen || user?.role !== "admin") return;
    fetchGuards();
  }, [adminModalOpen, user?.role, fetchGuards]);

  const handleAddGuard = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setAddError("");
      setSubmitting(true);
      try {
        const res = await fetch("/api/admin/guards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: addEmail.trim(),
            password: addPassword,
            fullName: addFullName.trim(),
            gate: (() => {
              const n = parseInt(addGate, 10);
              const maxG = getMaxGatesForLocationName(addLocationName);
              return Number.isNaN(n) ? 1 : Math.min(maxG, Math.max(1, n));
            })(),
            locationName: addLocationName.trim() || null,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setAddError(data?.error || "Error al crear guardia.");
          setSubmitting(false);
          return;
        }
        setAddOpen(false);
        setAddEmail("");
        setAddPassword("");
        setAddFullName("");
        setAddGate("1");
        setAddLocationName(APP_LOCATIONS[0]?.name ?? "");
        fetchGuards();
      } catch {
        setAddError("Error de conexión.");
      } finally {
        setSubmitting(false);
      }
    },
    [addEmail, addPassword, addFullName, addGate, addLocationName, fetchGuards],
  );

  const openEditGuard = useCallback((g: Guard) => {
    setEditingGuardId(g.id);
    setEditEmail(g.email);
    setEditFullName(g.fullName);
    setEditGate(String(g.gate ?? 1));
    setEditLocationName(g.locationName ?? "");
    setEditError("");
    setEditOpen(true);
  }, []);

  const handleEditGuard = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (editingGuardId == null) return;
      setEditError("");
      setEditing(true);
      try {
        const res = await fetch(`/api/admin/guards/${editingGuardId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: editEmail.trim(),
            fullName: editFullName.trim(),
            gate: (() => {
              const n = parseInt(editGate, 10);
              const maxG = getMaxGatesForLocationName(editLocationName);
              return Number.isNaN(n) ? 1 : Math.min(maxG, Math.max(1, n));
            })(),
            locationName: editLocationName.trim() || null,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setEditError(data?.error || "Error al actualizar guardia.");
          setEditing(false);
          return;
        }
        setEditOpen(false);
        setEditingGuardId(null);
        fetchGuards();
      } catch {
        setEditError("Error de conexión.");
      } finally {
        setEditing(false);
      }
    },
    [
      editingGuardId,
      editEmail,
      editFullName,
      editGate,
      editLocationName,
      fetchGuards,
    ],
  );

  const handleDeleteGuard = useCallback(async (id: number) => {
    if (!confirm("¿Eliminar este guardia? No se pueden deshacer los cambios."))
      return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/guards/${id}`, { method: "DELETE" });
      if (res.ok) setGuards((prev) => prev.filter((g) => g.id !== id));
    } finally {
      setDeletingId(null);
    }
  }, []);

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
          {user?.role === "admin" && (
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-foreground/70 hover:bg-secondary transition-colors"
              onClick={() => setAdminModalOpen(true)}
              aria-label="Administrar guardias"
            >
              <Settings className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Administrar</span>
            </button>
          )}
          {user?.role === "guard" && (
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-foreground/70 hover:bg-secondary transition-colors"
              onClick={() => setGateModalOpen(true)}
              aria-label="Puerta asignada"
            >
              <DoorOpen className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">P{user.gate ?? "—"}</span>
            </button>
          )}
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

      {/* Modal: Puerta asignada (solo guardias) */}
      <Dialog open={gateModalOpen} onOpenChange={setGateModalOpen}>
        <DialogContent className="max-w-[85vw] sm:max-w-sm rounded-2xl p-0 gap-0 bottom-4 top-auto translate-y-0 data-[state=open]:fade-zoom-in">
          <DialogHeader className="px-4 pt-4 pb-2 space-y-0.5">
            <DialogTitle className="text-base font-semibold tracking-tight">
              Puerta asignada
            </DialogTitle>
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
                <p className="text-sm font-semibold text-foreground truncate">
                  Puerta {user?.gate ?? "—"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {user?.gate != null
                    ? `Entrada / Salida · Puerta ${user.gate}`
                    : "Sin puerta asignada"}
                </p>
              </div>
            </div>
            <div className="space-y-0 rounded-xl bg-card border border-border/40 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-[11px] text-muted-foreground">
                  Estado
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-xs font-medium text-success">
                    Activa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Administrar guardias */}
      <Dialog open={adminModalOpen} onOpenChange={setAdminModalOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl p-0 gap-0 bottom-4 top-auto translate-y-0 data-[state=open]:fade-zoom-in">
          <div className="max-h-[85vh] overflow-y-auto">
            <DialogHeader className="px-4 pt-4 pb-2 space-y-0.5">
              <DialogTitle className="text-base font-semibold tracking-tight">
                Administrar guardias
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground">
                Agregar o quitar guardias y ver sus registros.
              </DialogDescription>
            </DialogHeader>
            <div className="px-4 pb-4">
              <Button
                onClick={() => setAddOpen(true)}
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground shadow-apple hover:shadow-apple-md text-xs font-medium mb-3"
              >
                <Plus className="h-3.5 w-3.5 mr-2" />
                Agregar guardia
              </Button>
              {guardsLoading ? (
                <div className="flex justify-center py-6">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : guards.length === 0 ? (
                <div className="rounded-xl border border-border/40 bg-card/50 py-6 text-center">
                  <p className="text-[11px] text-muted-foreground">
                    No hay guardias. Agrega el primero arriba.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {guards.map((g) => (
                    <div
                      key={g.id}
                      className="rounded-xl border border-border/40 bg-card px-3 py-2.5 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {g.fullName}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {g.email}
                          {g.gate != null ? ` · Puerta ${g.gate}` : ""}
                          {g.locationName ? ` · ${g.locationName}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditGuard(g)}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-foreground/70 hover:bg-secondary transition-colors"
                          aria-label="Editar guardia"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <Link
                          href={`/admin/guards/${g.id}`}
                          onClick={() => setAdminModalOpen(false)}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-foreground/70 hover:bg-secondary transition-colors"
                          aria-label="Ver registros"
                        >
                          <List className="h-3 w-3" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteGuard(g.id)}
                          disabled={deletingId === g.id}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Agregar guardia */}
      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (open) {
            setAddLocationName(APP_LOCATIONS[0]?.name ?? "");
            setAddGate("1");
          }
        }}
      >
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
              <label
                htmlFor="header-add-email"
                className="text-xs font-medium text-foreground"
              >
                Correo
              </label>
              <Input
                id="header-add-email"
                type="email"
                placeholder="guardia@buap.mx"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                className="h-11 rounded-xl border-border/50"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="header-add-password"
                className="text-xs font-medium text-foreground"
              >
                Contraseña
              </label>
              <Input
                id="header-add-password"
                type="password"
                placeholder="••••••••"
                value={addPassword}
                onChange={(e) => setAddPassword(e.target.value)}
                className="h-11 rounded-xl border-border/50"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="header-add-name"
                className="text-xs font-medium text-foreground"
              >
                Nombre completo
              </label>
              <Input
                id="header-add-name"
                type="text"
                placeholder="Juan Rodríguez"
                value={addFullName}
                onChange={(e) => setAddFullName(e.target.value)}
                className="h-11 rounded-xl border-border/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="header-add-location"
                className="text-xs font-medium text-foreground"
              >
                Plantel
              </label>
              <select
                id="header-add-location"
                value={addLocationName}
                onChange={(e) => {
                  const name = e.target.value;
                  setAddLocationName(name);
                  const maxG = getMaxGatesForLocationName(name);
                  setAddGate((prev) => {
                    const n = parseInt(prev, 10);
                    return Number.isNaN(n) ? "1" : String(Math.min(maxG, Math.max(1, n)));
                  });
                }}
                className="h-11 w-full rounded-xl border border-border/50 bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Sin plantel asignado</option>
                {APP_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="header-add-gate"
                className="text-xs font-medium text-foreground"
              >
                Puerta
              </label>
              <Input
                id="header-add-gate"
                type="number"
                min={1}
                max={getMaxGatesForLocationName(addLocationName)}
                placeholder="1"
                value={addGate}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setAddGate("");
                    return;
                  }
                  const v = parseInt(raw, 10);
                  if (!Number.isNaN(v)) {
                    const maxG = getMaxGatesForLocationName(addLocationName);
                    setAddGate(String(Math.min(maxG, Math.max(1, v))));
                  }
                }}
                className="h-11 rounded-xl border-border/50"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Entre 1 y {getMaxGatesForLocationName(addLocationName)}
              </p>
            </div>
            {addError && (
              <p className="text-[11px] text-destructive font-medium">
                {addError}
              </p>
            )}
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 rounded-xl"
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

      {/* Modal: Editar guardia */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-sm rounded-2xl p-0 gap-0 bottom-4 top-auto translate-y-0 data-[state=open]:fade-zoom-in">
          <DialogHeader className="px-4 pt-4 pb-2 space-y-0.5">
            <DialogTitle className="text-base font-semibold tracking-tight">
              Editar guardia
            </DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">
              Actualiza los datos del guardia seleccionado.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditGuard} className="px-4 pb-4 space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor="header-edit-email"
                className="text-xs font-medium text-foreground"
              >
                Correo
              </label>
              <Input
                id="header-edit-email"
                type="email"
                placeholder="guardia@buap.mx"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="h-11 rounded-xl border-border/50"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="header-edit-name"
                className="text-xs font-medium text-foreground"
              >
                Nombre completo
              </label>
              <Input
                id="header-edit-name"
                type="text"
                placeholder="Juan Rodríguez"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="h-11 rounded-xl border-border/50"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="header-edit-gate"
                className="text-xs font-medium text-foreground"
              >
                Puerta
              </label>
              <Input
                id="header-edit-gate"
                type="number"
                min={1}
                max={getMaxGatesForLocationName(editLocationName)}
                placeholder="1"
                value={editGate}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setEditGate("");
                    return;
                  }
                  const v = parseInt(raw, 10);
                  if (!Number.isNaN(v)) {
                    const maxG = getMaxGatesForLocationName(editLocationName);
                    setEditGate(String(Math.min(maxG, Math.max(1, v))));
                  }
                }}
                className="h-11 rounded-xl border-border/50"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Entre 1 y {getMaxGatesForLocationName(editLocationName)}
              </p>
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="header-edit-location"
                className="text-xs font-medium text-foreground"
              >
                Plantel
              </label>
              <select
                id="header-edit-location"
                value={editLocationName}
                onChange={(e) => {
                  const name = e.target.value;
                  setEditLocationName(name);
                  const maxG = getMaxGatesForLocationName(name);
                  setEditGate((prev) => {
                    const n = parseInt(prev, 10);
                    return Number.isNaN(n) ? "1" : String(Math.min(maxG, Math.max(1, n)));
                  });
                }}
                className="h-11 w-full rounded-xl border border-border/50 bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Sin plantel asignado</option>
                {APP_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
            {editError && (
              <p className="text-[11px] text-destructive font-medium">
                {editError}
              </p>
            )}
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 rounded-xl"
                onClick={() => setEditOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={editing}
                className="flex-1 rounded-xl bg-primary text-primary-foreground"
              >
                {editing ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
        <DialogContent className="max-w-[85vw] sm:max-w-sm rounded-2xl p-0 gap-0 bottom-4 top-auto translate-y-0 data-[state=open]:fade-zoom-in">
          <DialogHeader className="px-4 pt-4 pb-2 space-y-0.5">
            <DialogTitle className="text-base font-semibold tracking-tight">
              Perfil de Guardia
            </DialogTitle>
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
                <p className="text-sm font-semibold text-foreground truncate">
                  {loading ? "…" : (user?.fullName ?? "Usuario")}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>

            <div className="space-y-0 rounded-xl bg-card border border-border/40 overflow-hidden mb-3">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/40">
                <span className="text-[11px] text-muted-foreground">
                  Puerta asignada
                </span>
                <span className="text-xs font-medium text-foreground">
                  Puerta {user?.gate ?? "—"} - Principal
                </span>
              </div>

              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-[11px] text-muted-foreground">Rol</span>
                <span className="text-xs font-medium text-foreground">
                  {user?.role === "admin" ? "Administrador" : "Guardia"}
                </span>
              </div>
            </div>

            <Button
              variant="destructive"
              className="w-full h-10 text-xs font-medium rounded-lg shadow-apple hover:shadow-apple-md active:scale-98 transition-all"
              onClick={() => {
                setUserModalOpen(false);
                logout();
              }}
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Cerrar sesión
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});
