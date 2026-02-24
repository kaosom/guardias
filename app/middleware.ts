/**
 * Protege rutas: sin sesión válida redirige a /login; /admin solo para role admin.
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const COOKIE_NAME = "session"

async function getSession(request: NextRequest): Promise<{ role: string } | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 16) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    const role = payload.role
    if (role !== "admin" && role !== "guard") return null
    return { role: role as string }
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (path.startsWith("/_next") || path.startsWith("/api/auth/login") || path.includes(".")) {
    return NextResponse.next()
  }

  const session = await getSession(request)

  if (path === "/login") {
    if (session) return NextResponse.redirect(new URL("/", request.url))
    return NextResponse.next()
  }

  if (!session) {
    const login = new URL("/login", request.url)
    login.searchParams.set("from", path)
    return NextResponse.redirect(login)
  }

  if (path.startsWith("/admin")) {
    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/login", "/admin/:path*"],
}
