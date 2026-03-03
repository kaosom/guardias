/**
 * GET /api/photos/* — Sirve fotos de vehículos de forma autenticada y segura.
 * Previene path-traversal. Content-Type por extensión real.
 */

import { Router, Request, Response } from "express"
import { readFile } from "fs/promises"
import path from "path"
import { resolvePhotoPath } from "../photos"
import { requireAuth } from "../middleware/auth"

const router = Router()

const MIME_BY_EXT: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
}

// GET /api/photos/vehicles/nombre-uuid.jpg
router.get("/*", requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        // Express pone la ruta completa después de /api/photos/ en req.params[0]
        const relativePath = (req.params as Record<string, string>)[0]
        if (!relativePath) {
            res.status(400).json({ error: "Ruta de archivo requerida." })
            return
        }

        const absolutePath = resolvePhotoPath(relativePath)
        const ext = path.extname(absolutePath).slice(1).toLowerCase()
        const contentType = MIME_BY_EXT[ext] ?? "application/octet-stream"

        const buffer = await readFile(absolutePath)
        res.set("Content-Type", contentType)
        res.set("Cache-Control", "private, max-age=3600")
        res.send(buffer)
    } catch (err) {
        const message = err instanceof Error ? err.message : "Error"
        if (message === "Archivo no encontrado." || message === "Ruta de archivo no permitida.") {
            res.status(404).json({ error: message })
            return
        }
        console.error("GET /api/photos error:", err)
        res.status(500).json({ error: "Error al obtener la foto." })
    }
})

export default router
