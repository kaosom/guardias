/**
 * Middleware de autenticación JWT para Express.
 * Lee la cookie "session" y verifica el JWT. Igual lógica que app/src/lib/auth.ts.
 */

import { Request, Response, NextFunction } from "express"
import { jwtVerify } from "jose"

const COOKIE_NAME = "session"
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7 // 7 días

export interface SessionUser {
    id: number
    email: string
    role: "admin" | "guard"
    fullName: string
    gate?: number | null
}

// Extender Request para incluir el usuario de sesión
declare global {
    namespace Express {
        interface Request {
            session?: SessionUser
        }
    }
}

function getSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET
    if (!secret || secret.length < 16) {
        throw new Error("JWT_SECRET debe estar definido y tener al menos 16 caracteres (api/.env)")
    }
    return new TextEncoder().encode(secret)
}

/**
 * Crea un JWT firmado con el usuario de sesión.
 */
export async function createToken(user: SessionUser, maxAgeSeconds = DEFAULT_MAX_AGE): Promise<string> {
    const { SignJWT } = await import("jose")
    const secret = getSecret()
    const exp = Math.floor(Date.now() / 1000) + maxAgeSeconds
    return new SignJWT({
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        ...(user.gate != null && { gate: user.gate }),
    })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(exp)
        .setIssuedAt(Math.floor(Date.now() / 1000))
        .sign(secret)
}

/**
 * Verifica el JWT y devuelve el payload como SessionUser.
 */
export async function verifyToken(token: string): Promise<SessionUser> {
    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret)
    const userId = payload.userId
    const email = payload.email
    const role = payload.role
    const fullName = payload.fullName
    const gate = payload.gate
    if (typeof email !== "string" || typeof role !== "string" || typeof fullName !== "string") {
        throw new Error("Token inválido: claims faltantes")
    }
    if (role !== "admin" && role !== "guard") {
        throw new Error("Token inválido: role desconocido")
    }
    return {
        id: Number(userId),
        email,
        role: role as "admin" | "guard",
        fullName,
        ...(gate != null && { gate: Number(gate) }),
    }
}

/**
 * Middleware: requiere sesión válida. Pone req.session y llama next().
 * Si no hay sesión válida devuelve 401.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = req.cookies?.[COOKIE_NAME]
    if (!token) {
        res.status(401).json({ error: "No autorizado." })
        return
    }
    try {
        req.session = await verifyToken(token)
        next()
    } catch {
        res.status(401).json({ error: "No autorizado." })
    }
}

/**
 * Middleware: requiere sesión con role = admin. Devuelve 403 si no.
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    await requireAuth(req, res, async () => {
        if (req.session?.role !== "admin") {
            res.status(403).json({ error: "No autorizado. Se requiere rol de administrador." })
            return
        }
        next()
    })
}

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: DEFAULT_MAX_AGE,
}

export { COOKIE_NAME }
