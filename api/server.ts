/**
 * Servidor Express independiente — Guardias BUAP API
 * Puerto: process.env.PORT (default 3001)
 *
 * Rutas:
 *   POST   /api/auth/login
 *   POST   /api/auth/logout
 *   GET    /api/auth/session
 *   GET    /api/vehicles?q=...
 *   POST   /api/vehicles
 *   GET    /api/vehicles/:id
 *   PUT    /api/vehicles/:id
 *   DELETE /api/vehicles/:id        (solo admin)
 *   POST   /api/movements
 *   POST   /api/upload
 *   GET    /api/photos/*
 *   GET    /api/admin/guards
 *   POST   /api/admin/guards
 *   DELETE /api/admin/guards/:id    (solo admin)
 *   GET    /api/admin/guards/:id/movements
 */

import "dotenv/config"
import express, { Request, Response } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import authRouter from "./routes/auth"
import vehiclesRouter from "./routes/vehicles"
import movementsRouter from "./routes/movements"
import uploadRouter from "./routes/upload"
import photosRouter from "./routes/photos"
import adminRouter from "./routes/admin"
import usersRouter from "./routes/users"

const app = express()
const PORT = Number(process.env.PORT) || 3001
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "https://localhost:3000"

// ── Middlewares globales
app.use(
    cors({
        origin: FRONTEND_ORIGIN,
        credentials: true,
    })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ── Rutas
app.use("/api/auth", authRouter)
app.use("/api/vehicles", vehiclesRouter)
app.use("/api/movements", movementsRouter)
app.use("/api/upload", uploadRouter)
app.use("/api/photos", photosRouter)
app.use("/api/admin", adminRouter)
app.use("/api/users", usersRouter)

// ── Health check
app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// ── 404 catch-all 
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Ruta no encontrada." })
})

// ── Arrancar servidor 
app.listen(PORT, () => {
    console.log(`[API] Servidor en http://localhost:${PORT}`)
    console.log(`[API] CORS permitido para: ${FRONTEND_ORIGIN}`)
})

export default app
