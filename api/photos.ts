/**
 * Servicio de fotos de vehículos: guardar en disco de forma segura y devolver ruta relativa.
 *
 * Seguridad implementada:
 * - Los archivos se guardan en `uploads/` en la RAÍZ del proyecto (fuera de app/)
 *   para que Next.js nunca los sirva directamente como archivos estáticos.
 * - Los nombres de archivo incluyen un UUID v4 para que sean imposibles de adivinar.
 * - `resolvePhotoPath` valida que la ruta pedida esté dentro de la carpeta
 *   privada, previniendo ataques de path-traversal (../../../etc/passwd).
 * - La ruta de la carpeta se configura con UPLOAD_DIR.
 *   Por defecto: <raíz del proyecto>/uploads  (un nivel por encima de api/).
 */

import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { randomUUID } from "crypto"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

/**
 * Devuelve la ruta absoluta de la carpeta de subidas de vehículos.
 * Está FUERA de public/ a propósito: Next.js no la servirá directamente.
 */
/** Ruta absoluta de la carpeta raíz de uploads (un nivel arriba de app/).
 *  process.cwd() en Next.js siempre es el directorio de app/package.json.
 */
const DEFAULT_UPLOAD_DIR = path.resolve(process.cwd(), "../private-uploads")

export function getUploadDir(): string {
  const base = process.env.UPLOAD_DIR ?? DEFAULT_UPLOAD_DIR
  const dir = path.join(base, "vehicles")
  console.log("[photos] 📂 Directorio de uploads:", dir)
  return dir
}

/**
 * Dado un subpath relativo (ej. "vehicles/ABC-1234-uuid.jpg"), devuelve la ruta
 * absoluta validada. Lanza un error si la ruta intenta salir de la carpeta de uploads
 * (protección contra path-traversal: ../../etc/passwd).
 */
export function resolvePhotoPath(relativePath: string): string {
  const base = process.env.UPLOAD_DIR ?? DEFAULT_UPLOAD_DIR
  const absoluteBase = path.resolve(base)
  // path.basename elimina cualquier separador de directorio del segmento final,
  // y path.resolve normaliza ".." antes de la comparación.
  const resolved = path.resolve(absoluteBase, relativePath)
  if (!resolved.startsWith(absoluteBase + path.sep) && resolved !== absoluteBase) {
    throw new Error("Ruta de archivo no permitida.")
  }
  if (!existsSync(resolved)) {
    throw new Error("Archivo no encontrado.")
  }
  return resolved
}

/**
 * Guarda la foto del vehículo en disco y devuelve la ruta relativa para guardar en BD.
 * Acepta buffer y nombre sugerido (placa o id). Valida tipo y tamaño.
 *
 * El nombre generado tiene el formato: {safeName}-{uuid}.{ext}
 * El UUID hace que la URL sea imposible de adivinar aunque alguien sepa la placa.
 */
export async function saveVehiclePhoto(
  buffer: Buffer,
  mimeType: string,
  identifier: string
): Promise<string> {

  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error("Tipo de archivo no permitido. Usa JPEG, PNG, WebP o GIF.")
  }
  if (buffer.length > MAX_SIZE_BYTES) {
    throw new Error("La imagen no puede superar 5 MB.")
  }

  const dir = getUploadDir()
  await mkdir(dir, { recursive: true })

  const ext =
    mimeType === "image/jpeg" ? "jpg"
      : mimeType === "image/png" ? "png"
        : mimeType === "image/webp" ? "webp"
          : "gif"

  const safeName = identifier.replace(/[^A-Za-z0-9-]/g, "_").slice(0, 20)
  const filename = `${safeName}-${randomUUID()}.${ext}`
  const filePath = path.join(dir, filename)

  await writeFile(filePath, buffer)

  const relativePath = path.join("vehicles", filename)
  return relativePath
}
