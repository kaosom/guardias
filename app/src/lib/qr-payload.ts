/**
 * Decodificación del QR institucional.
 * El contenido suele venir en base64; al decodificar se obtiene un JSON con "matricula"
 * (y opcionalmente "action"). Si el payload está cifrado con AES-GCM, se usa
 * NEXT_PUBLIC_QR_SECRET para desencriptar (mismo secreto con el que se generó el QR).
 */

export interface ParsedQrPayload {
  searchTerm: string
  action?: "entry" | "exit"
}

function safeBase64Decode(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    const binary = atob(trimmed)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}

function isBase64Like(s: string): boolean {
  return /^[A-Za-z0-9+/]+=*$/.test(s.trim()) && s.trim().length % 4 !== 1
}

function extractSearchTermFromObject(obj: Record<string, unknown>): string | null {
  const matricula = obj.matricula
  if (typeof matricula === "string" && matricula.trim()) return matricula.trim()
  const studentId = obj.studentId
  if (typeof studentId === "string" && studentId.trim()) return studentId.trim()
  const plate = obj.plate
  if (typeof plate === "string" && plate.trim()) return plate.trim()
  return null
}

function extractAction(obj: Record<string, unknown>): "entry" | "exit" | undefined {
  const a = obj.action
  if (a === "entry" || a === "exit") return a
  return undefined
}

/**
 * Intenta desencriptar un payload con AES-GCM.
 * Formato esperado: base64(IV_12_bytes + ciphertext), clave = SHA-256(NEXT_PUBLIC_QR_SECRET).
 */
async function decryptAesGcm(base64Payload: string, secret: string): Promise<string | null> {
  if (typeof crypto === "undefined" || !crypto.subtle) return null
  try {
    const raw = atob(base64Payload.replace(/\s/g, ""))
    const bytes = new Uint8Array(raw.length)
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
    if (bytes.length < 12 + 16) return null // IV + al menos un bloque + tag
    const iv = bytes.slice(0, 12)
    const ciphertext = bytes.slice(12)
    const keyBytes = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(secret)
    )
    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    )
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    )
    return new TextDecoder().decode(decrypted)
  } catch {
    return null
  }
}

/**
 * Parsea el valor crudo del QR (institucional o no).
 * 1) Si es base64, decodifica y busca JSON con "matricula" (o studentId/plate) y "action".
 * 2) Si no es JSON pero hay NEXT_PUBLIC_QR_SECRET, intenta desencriptar y luego parsear.
 * 3) Si el contenido crudo ya es JSON, lo usa.
 * Devuelve { searchTerm, action } o null si no se pudo extraer un término de búsqueda.
 */
export function parseInstitutionalQrSync(raw: string): ParsedQrPayload | null {
  if (!raw || typeof raw !== "string") return null

  let decoded: string = raw.trim()

  if (isBase64Like(raw)) {
    const fromB64 = safeBase64Decode(raw)
    if (fromB64 != null) decoded = fromB64
  }

  try {
    const obj = JSON.parse(decoded) as Record<string, unknown>
    const searchTerm = extractSearchTermFromObject(obj)
    if (searchTerm) {
      return {
        searchTerm,
        action: extractAction(obj),
      }
    }
  } catch {
    // decoded no es JSON; más abajo probamos desencriptar si hay secret
  }

  return null
}

/**
 * Versión async: además de base64 + JSON, intenta desencriptar con NEXT_PUBLIC_QR_SECRET
 * si el contenido decodificado no es JSON válido.
 */
export async function parseInstitutionalQr(raw: string): Promise<ParsedQrPayload | null> {
  const syncResult = parseInstitutionalQrSync(raw)
  if (syncResult) return syncResult

  const qrSecret =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_QR_SECRET
      ? process.env.NEXT_PUBLIC_QR_SECRET
      : ""
  if (!qrSecret || typeof qrSecret !== "string") return null

  const trimmed = raw.trim()
  if (!isBase64Like(trimmed)) return null

  const decrypted = await decryptAesGcm(trimmed, qrSecret)
  if (!decrypted) return null

  try {
    const obj = JSON.parse(decrypted) as Record<string, unknown>
    const searchTerm = extractSearchTermFromObject(obj)
    if (searchTerm) {
      return {
        searchTerm,
        action: extractAction(obj),
      }
    }
  } catch {
    // ignore
  }
  return null
}
