/**
 * POST /api/auth/login  — Iniciar sesión. Body: { email, password }
 * POST /api/auth/logout — Cerrar sesión. Borra la cookie.
 * GET  /api/auth/session — Devuelve el usuario de la sesión activa.
 *
 * Rate limiting: máximo 10 intentos por IP en 15 minutos.
 */

import { Router, Request, Response } from "express"
import bcrypt from "bcrypt"
import { findByEmail } from "../guards"
import { createToken, requireAuth, COOKIE_NAME, COOKIE_OPTIONS } from "../middleware/auth"

const router = Router()

// Rate limiting en memoria: ip → { count, resetAt }
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 10
const WINDOW_MS = 15 * 60 * 1000 // 15 minutos

function getClientIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"]
    if (typeof forwarded === "string") return forwarded.split(",")[0].trim()
    return req.socket.remoteAddress ?? "unknown"
}

function checkRateLimit(ip: string): { allowed: boolean } {
    const now = Date.now()
    const entry = loginAttempts.get(ip)
    if (!entry || now > entry.resetAt) {
        loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
        return { allowed: true }
    }
    if (entry.count >= MAX_ATTEMPTS) return { allowed: false }
    entry.count += 1
    return { allowed: true }
}

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
    const ip = getClientIp(req)
    if (!checkRateLimit(ip).allowed) {
        res.status(429).json({ error: "Demasiados intentos. Intenta en 15 minutos." })
        return
    }
    try {
        const { email, password } = req.body ?? {}
        if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
            res.status(400).json({ error: "Correo y contraseña son obligatorios." })
            return
        }
        const user = await findByEmail(email)
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            res.status(401).json({ error: "Credenciales incorrectas." })
            return
        }
        loginAttempts.delete(ip)
        const sessionUser = {
            id: user.id,
            email: user.email,
            role: user.role,
            fullName: user.full_name,
            ...(user.gate != null && { gate: user.gate }),
        }
        const token = await createToken(sessionUser)
        res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS)
        res.status(200).json({ user: sessionUser })
    } catch (err) {
        console.error("POST /api/auth/login error:", err)
        res.status(500).json({ error: "Error al iniciar sesión." })
    }
})

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response): void => {
    res.cookie(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 })
    res.json({ ok: true })
})

// GET /api/auth/session
router.get("/session", requireAuth, (req: Request, res: Response): void => {
    res.json({ user: req.session })
})

export default router
