/**
 * GET    /api/admin/guards             — Lista guardias (solo admin).
 * POST   /api/admin/guards             — Crea un guardia (solo admin).
 * DELETE /api/admin/guards/:id         — Elimina un guardia (solo admin).
 * GET    /api/admin/guards/:id/movements — Movimientos de un guardia (solo admin).
 */

import { Router, Request, Response } from "express"
import bcrypt from "bcrypt"
import { listGuards, createGuard, deleteGuard, getById as getUserById } from "../guards"
import { getByGuardId } from "../movements"
import { requireAdmin } from "../middleware/auth"

const router = Router()

function parseId(id: string): number | null {
    const n = Number(id)
    return Number.isInteger(n) && n > 0 ? n : null
}

// GET /api/admin/guards
router.get("/guards", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
    try {
        const guards = await listGuards()
        res.json(guards)
    } catch (err) {
        console.error("GET /api/admin/guards error:", err)
        res.status(500).json({ error: "Error al listar guardias." })
    }
})

// POST /api/admin/guards
router.post("/guards", requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, fullName, gate } = req.body ?? {}
        const emailStr = typeof email === "string" ? email.trim() : ""
        const passwordStr = typeof password === "string" ? password : ""
        const fullNameStr = typeof fullName === "string" ? fullName.trim() : ""
        let gateNum = gate != null ? Number(gate) : NaN
        if (!Number.isInteger(gateNum) || gateNum < 1 || gateNum > 15) gateNum = 1

        if (!emailStr || !passwordStr || !fullNameStr) {
            res.status(400).json({ error: "email, password y fullName son obligatorios." })
            return
        }
        if (passwordStr.length < 8) {
            res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." })
            return
        }

        const user = await createGuard(
            { email: emailStr, password: passwordStr, fullName: fullNameStr, gate: gateNum },
            (plain) => bcrypt.hash(plain, 10)
        )
        res.status(201).json(user)
    } catch (err) {
        console.error("POST /api/admin/guards error:", err)
        res.status(500).json({ error: "Error al crear guardia." })
    }
})

// DELETE /api/admin/guards/:id
router.delete("/guards/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const guardId = parseId(req.params.id as string)
        if (guardId === null) { res.status(400).json({ error: "Id no válido." }); return }

        const user = await getUserById(guardId)
        if (!user) { res.status(404).json({ error: "Guardia no encontrado." }); return }
        if (user.role !== "guard") {
            res.status(400).json({ error: "No se puede eliminar un administrador." })
            return
        }

        const ok = await deleteGuard(guardId)
        if (!ok) { res.status(500).json({ error: "No se pudo eliminar." }); return }
        res.status(204).send()
    } catch (err) {
        console.error("DELETE /api/admin/guards/:id error:", err)
        res.status(500).json({ error: "Error al eliminar guardia." })
    }
})

// GET /api/admin/guards/:id/movements
router.get("/guards/:id/movements", requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const guardId = parseId(req.params.id as string)
        if (guardId === null) { res.status(400).json({ error: "Id no válido." }); return }

        const user = await getUserById(guardId)
        if (!user) { res.status(404).json({ error: "Guardia no encontrado." }); return }

        const limit = Math.min(Number(req.query.limit) || 100, 500)
        const movements = await getByGuardId(guardId, limit)
        res.json(movements)
    } catch (err) {
        console.error("GET /api/admin/guards/:id/movements error:", err)
        res.status(500).json({ error: "Error al listar movimientos." })
    }
})

export default router
