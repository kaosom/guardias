const VALID_FIRST_LETTERS = new Set(['T', 'U'])
const EXCLUDED_LETTERS = new Set(['I', 'Ñ', 'O', 'Q'])
const VALID_LETTERS = new Set([
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M',
  'N', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
])

export function isValidPueblaLetter(letter: string, position: number): boolean {
  const upper = letter.toUpperCase()
  
  if (EXCLUDED_LETTERS.has(upper)) {
    return false
  }
  
  if (position === 0) {
    return VALID_FIRST_LETTERS.has(upper)
  }
  
  return VALID_LETTERS.has(upper)
}

export function validatePueblaPlate(plate: string): boolean {
  const clean = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  
  if (clean.length < 6 || clean.length > 7) {
    return false
  }
  
  const letters = clean.slice(0, 3)
  const numbers = clean.slice(3)
  
  if (letters.length !== 3) {
    return false
  }
  
  if (numbers.length < 3 || numbers.length > 4) {
    return false
  }
  
  if (!/^\d+$/.test(numbers)) {
    return false
  }
  
  for (let i = 0; i < letters.length; i++) {
    if (!isValidPueblaLetter(letters[i], i)) {
      return false
    }
  }
  
  return true
}

export function formatPueblaPlate(value: string): string {
  const clean = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  
  let letters = ''
  let numbers = ''
  
  for (const char of clean) {
    if (/[A-Z]/.test(char) && letters.length < 3) {
      if (isValidPueblaLetter(char, letters.length)) {
        letters += char
      }
    } else if (/\d/.test(char) && numbers.length < 4) {
      numbers += char
    }
  }
  
  if (!letters) return ''
  if (!numbers) return letters
  
  return `${letters}-${numbers}`
}

export function validateMatricula(matricula: string): boolean {
  const digits = matricula.replace(/\D/g, '')
  return digits.length === 9
}

export function formatMatricula(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  return digits
}

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export function validatePlateWithMessage(plate: string): ValidationResult {
  const clean = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  
  if (!clean) {
    return { isValid: false, error: 'Placa requerida' }
  }
  
  if (clean.length < 6) {
    return { isValid: false, error: 'Placa incompleta (mínimo 6 caracteres)' }
  }
  
  if (clean.length > 7) {
    return { isValid: false, error: 'Placa demasiado larga (máximo 7 caracteres)' }
  }
  
  const letters = clean.slice(0, 3)
  const numbers = clean.slice(3)
  
  if (letters.length !== 3) {
    return { isValid: false, error: 'Se requieren 3 letras' }
  }
  
  const firstLetter = letters[0]
  if (!VALID_FIRST_LETTERS.has(firstLetter)) {
    return { isValid: false, error: `Primera letra debe ser T o U (Puebla)` }
  }
  
  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i]
    if (EXCLUDED_LETTERS.has(letter)) {
      return { isValid: false, error: `Letra ${letter} no permitida (NOM-001-SCT-2-2016)` }
    }
    if (!VALID_LETTERS.has(letter)) {
      return { isValid: false, error: `Letra ${letter} no válida` }
    }
  }
  
  if (!/^\d+$/.test(numbers)) {
    return { isValid: false, error: 'Números no válidos' }
  }
  
  if (numbers.length < 3 || numbers.length > 4) {
    return { isValid: false, error: 'Se requieren 3 o 4 números' }
  }
  
  return { isValid: true }
}

export function validateMatriculaWithMessage(matricula: string): ValidationResult {
  const digits = matricula.replace(/\D/g, '')
  
  if (!digits) {
    return { isValid: false, error: 'Matrícula requerida' }
  }
  
  if (digits.length < 9) {
    return { isValid: false, error: `Matrícula incompleta (${digits.length}/9 dígitos)` }
  }
  
  if (digits.length > 9) {
    return { isValid: false, error: 'Matrícula demasiado larga (máximo 9 dígitos)' }
  }
  
  return { isValid: true }
}
