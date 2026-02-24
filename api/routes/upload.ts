/**
 * POST /api/upload — Sube una foto de vehículo.
 * Multipart: campo "file" (imagen), "plate" o "vehicleId" como identificador.
 * Devuelve { path: string } para guardar en vehicles.vehicle_photo_path.
 */

import { Router, Request, Response } from "express"
import multer from "multer"
import { saveVehiclePhoto } from "../photos"
import { requireAuth } from "../middleware/auth"

const router = Router()

// Usar memoria para recibir el buffer (saveVehiclePhoto ya lo escribe a disco)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
})

router.post(
    "/",
    requireAuth,
    upload.single("file"),
    async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.file || req.file.size === 0) {
                res.status(400).json({ error: "Falta el archivo de la foto (campo 'file')." })
                return
            }

            const plate = typeof req.body.plate === "string" ? req.body.plate.trim() : ""
            const vehicleId = typeof req.body.vehicleId === "string" ? req.body.vehicleId : null

            const identifier = plate
                ? plate.replace(/[^A-Za-z0-9]/g, "_").slice(0, 20)
                : (vehicleId ?? "vehicle")

            const path = await saveVehiclePhoto(
                req.file.buffer,
                req.file.mimetype,
                identifier
            )
            res.status(201).json({ path })
        } catch (err) {
            console.error("POST /api/upload error:", err)
            const message = err instanceof Error ? err.message : "Error al subir la foto."
            res.status(500).json({ error: message })
        }
    }
)

export default router
