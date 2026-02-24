/**
 * POST /api/movements — Registra entrada o salida.
 * Body: { vehicleId: number, type: 'entry' | 'exit' }
 */

import { Router, Request, Response } from "express"
import { registerMovement } from "../movements"
import { requireAuth } from "../middleware/auth"

const router = Router()

router.post("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicleId = req.body?.vehicleId != null ? Number(req.body.vehicleId) : NaN
        const type = req.body?.type

        if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
            res.status(400).json({ error: "vehicleId debe ser un número entero positivo." })
            return
        }
        if (type !== "entry" && type !== "exit") {
            res.status(400).json({ error: "type debe ser 'entry' o 'exit'." })
            return
        }

        const result = await registerMovement(vehicleId, type, req.session!.id)
        res.status(201).json({ movementId: result.movementId, newStatus: result.newStatus })
    } catch (err) {
        console.error("POST /api/movements error:", err)
        res.status(500).json({ error: "Error al registrar el movimiento." })
    }
})

export default router
