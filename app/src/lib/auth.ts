/**
 * Autenticación: JWT en cookie httpOnly. Helpers para crear/verificar token y leer sesión.
 */

import { SignJWT, jwtVerify } from "jose"
import { NextRequest } from "next/server"

const COOKIE_NAME = "session"
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7 // 7 días

export interface SessionUser {
  id: number
  email: string
  role: "admin" | "guard"
  fullName: string
  gate?: number | null
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET debe estar definido y tener al menos 16 caracteres (app/.env.local)")
  }
  return new TextEncoder().encode(secret)
}

/**
 * Crea un JWT con el usuario y lo devuelve como string (para setear en cookie).
 */
export async function createToken(user: SessionUser, maxAgeSeconds: number = DEFAULT_MAX_AGE): Promise<string> {
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
 * Verifica el JWT y devuelve el payload como SessionUser. Lanza si es inválido o expirado.
 */
export async function verifyToken(token: string): Promise<SessionUser> {
  const secret = getSecret()
  const { payload } = await jwtVerify(token, secret)
  const userId = payload.userId
  const email = payload.email
  const role = payload.role
  const fullName = payload.fullName
  const gate = payload.gate
  if (userId !== undefined && typeof userId !== "number" && typeof userId !== "string") {
    throw new Error("Invalid token: userId")
  }
  if (typeof email !== "string" || typeof role !== "string" || typeof fullName !== "string") {
    throw new Error("Invalid token: missing claims")
  }
  if (role !== "admin" && role !== "guard") {
    throw new Error("Invalid token: role")
  }
  return {
    id: Number(userId),
    email,
    role: role as "admin" | "guard",
    fullName,
    ...(gate !== undefined && gate !== null && (gate === Number(gate) || typeof gate === "number") && { gate: Number(gate) }),
  }
}

/**
 * Lee la cookie de sesión de la request y verifica el JWT. Devuelve null si no hay cookie o es inválida.
 */
export async function getSessionFromRequest(request: NextRequest): Promise<SessionUser | null> {
  const cookie = request.cookies.get(COOKIE_NAME)?.value
  if (!cookie) return null
  try {
    return await verifyToken(cookie)
  } catch {
    return null
  }
}

export function getCookieName(): string {
  return COOKIE_NAME
}

/**
 * Opciones para setear la cookie de sesión (httpOnly, SameSite, path).
 */
export function sessionCookieOptions(maxAgeSeconds: number = DEFAULT_MAX_AGE) {
  const isProd = process.env.NODE_ENV === "production"
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  }
}
