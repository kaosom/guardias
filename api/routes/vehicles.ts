/**
 * GET    /api/vehicles?q=... — Busca por placa o matrícula.
 * POST   /api/vehicles       — Crea un vehículo.
 * GET    /api/vehicles/:id   — Obtiene un vehículo por id.
 * PUT    /api/vehicles/:id   — Actualiza un vehículo.
 * DELETE /api/vehicles/:id   — Elimina un vehículo (solo admin).
 */

import { Router, Request, Response } from "express"
import { search, create, getById, update, deleteVehicle, listByStudentId } from "../vehicles"
import type { VehicleInput } from "../vehicles"
import { requireAuth, requireAdmin } from "../middleware/auth"

const router = Router()

function parseId(id: string): number | null {
    const n = Number(id)
    return Number.isInteger(n) && n > 0 ? n : null
}

// GET /api/vehicles?q=...
router.get("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const q = typeof req.query.q === "string" ? req.query.q.trim() : ""
        if (!q) {
            res.status(400).json({ error: "Falta el parámetro q (placa o matrícula)." })
            return
        }
        const vehicle = await search(q)
        if (!vehicle) { res.status(404).json(null); return }
        res.json(vehicle)
    } catch (err) {
        console.error("GET /api/vehicles error:", err)
        res.status(500).json({ error: "Error al buscar el vehículo." })
    }
})

// GET /api/vehicles/student/:studentId — lista todos los vehículos de un alumno
router.get("/student/:studentId", requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const studentId = String(req.params.studentId ?? "").trim()
        if (!studentId) {
            res.status(400).json({ error: "Falta el parámetro studentId." })
            return
        }
        const vehicles = await listByStudentId(studentId)
        res.json(vehicles)
    } catch (err) {
        console.error("GET /api/vehicles/student/:studentId error:", err)
        res.status(500).json({ error: "Error al listar vehículos del alumno." })
    }
})

// POST /api/vehicles
router.post("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const json = req.body
        if (!json.plate || !json.studentId || !json.studentName) {
            res.status(400).json({ error: "Faltan datos obligatorios: plate, studentId, studentName." })
            return
        }
        const body: VehicleInput = {
            plate: json.plate,
            studentId: json.studentId,
            studentName: json.studentName,
            vehicleType: json.vehicleType ?? "moto",
            hasHelmet: Boolean(json.hasHelmet),
            helmetCount: Number(json.helmetCount) || 0,
            helmets: Array.isArray(json.helmets) ? json.helmets : [],
            vehicleDescription: json.vehicleDescription,
            vehiclePhotoPath: json.vehiclePhotoPath ?? null,
        }
        const vehicle = await create(body)
        res.status(201).json(vehicle)
    } catch (err) {
        console.error("POST /api/vehicles error:", err)
        res.status(500).json({ error: "Error al crear el vehículo." })
    }
})

// GET /api/vehicles/:id
router.get("/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicleId = parseId(req.params.id as string)
        if (vehicleId === null) { res.status(400).json({ error: "Id no válido." }); return }
        const vehicle = await getById(vehicleId)
        if (!vehicle) { res.status(404).json(null); return }
        res.json(vehicle)
    } catch (err) {
        console.error("GET /api/vehicles/:id error:", err)
        res.status(500).json({ error: "Error al obtener el vehículo." })
    }
})

// PUT /api/vehicles/:id
router.put("/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicleId = parseId(req.params.id as string)
        if (vehicleId === null) { res.status(400).json({ error: "Id no válido." }); return }
        const json = req.body
        if (!json.plate || !json.studentId || !json.studentName) {
            res.status(400).json({ error: "Faltan datos obligatorios: plate, studentId, studentName." })
            return
        }
        const body: VehicleInput = {
            plate: json.plate,
            studentId: json.studentId,
            studentName: json.studentName,
            vehicleType: json.vehicleType ?? "moto",
            hasHelmet: Boolean(json.hasHelmet),
            helmetCount: Number(json.helmetCount) || 0,
            helmets: Array.isArray(json.helmets) ? json.helmets : [],
            vehicleDescription: json.vehicleDescription,
            vehiclePhotoPath: json.vehiclePhotoPath ?? null,
        }
        const vehicle = await update(vehicleId, body)
        if (!vehicle) { res.status(404).json(null); return }
        res.json(vehicle)
    } catch (err) {
        console.error("PUT /api/vehicles/:id error:", err)
        res.status(500).json({ error: "Error al actualizar el vehículo." })
    }
})

// DELETE /api/vehicles/:id — solo admin
router.delete("/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicleId = parseId(req.params.id as string)
        if (vehicleId === null) { res.status(400).json({ error: "Id no válido." }); return }
        const deleted = await deleteVehicle(vehicleId)
        if (!deleted) { res.status(404).json(null); return }
        res.status(204).send()
    } catch (err) {
        console.error("DELETE /api/vehicles/:id error:", err)
        res.status(500).json({ error: "Error al eliminar el vehículo." })
    }
})

export default router
