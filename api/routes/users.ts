/**
 * Rutas para alumnos (users).
 * PUT /api/users/:id — Actualiza nombre y matrícula de un alumno.
 */

import { Router, Request, Response } from "express"
import { requireAuth } from "../middleware/auth"
import { updateUser } from "../users"

const router = Router()

function parseId(id: string): number | null {
  const n = Number(id)
  return Number.isInteger(n) && n > 0 ? n : null
}

// PUT /api/users/:id
router.put("/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseId(req.params.id as string)
    if (userId === null) {
      res.status(400).json({ error: "Id no válido." })
      return
    }

    const { fullName, studentId } = req.body ?? {}
    const nameStr = typeof fullName === "string" ? fullName.trim() : ""
    const matriculaStr = typeof studentId === "string" ? studentId : ""

    if (!nameStr || !matriculaStr) {
      res.status(400).json({ error: "fullName y studentId son obligatorios." })
      return
    }

    const updated = await updateUser(userId, { fullName: nameStr, matricula: matriculaStr })
    if (!updated) {
      res.status(404).json({ error: "Alumno no encontrado." })
      return
    }

    res.json({
      id: updated.id,
      studentId: updated.matricula,
      fullName: updated.full_name,
      email: updated.email,
    })
  } catch (err) {
    console.error("PUT /api/users/:id error:", err)
    res.status(500).json({ error: "Error al actualizar datos del alumno." })
  }
})

export default router

