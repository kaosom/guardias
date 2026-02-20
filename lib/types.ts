export type VehicleType = "moto" | "carro" | "bici"

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  moto: "Motocicleta",
  carro: "Automovil",
  bici: "Bicicleta",
}

export interface HelmetDetail {
  description: string
}

export interface VehicleRecord {
  id?: number
  studentName: string
  studentId: string
  vehicleType: VehicleType
  plate: string
  hasHelmet: boolean
  helmetCount: number
  helmets: HelmetDetail[]
  vehicleDescription: string
  vehiclePhotoUrl: string | null
  status: "inside" | "outside"
}
