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

export const MOCK_RECORDS: Record<string, VehicleRecord> = {
  "TNA-1234": {
    studentName: "Maria Garcia Lopez",
    studentId: "202161606",
    vehicleType: "moto",
    plate: "TNA-1234",
    hasHelmet: true,
    helmetCount: 2,
    helmets: [
      { description: "Negro con sticker rojo, marca LS2" },
      { description: "Blanco liso, marca HJC" },
    ],
    vehicleDescription: "Honda CB190R negra con escape Yoshimura",
    vehiclePhotoUrl: null,
    status: "outside",
  },
  "UBZ-5678": {
    studentName: "Carlos Ramirez Torres",
    studentId: "202045789",
    vehicleType: "carro",
    plate: "UBZ-5678",
    hasHelmet: false,
    helmetCount: 0,
    helmets: [],
    vehicleDescription: "Nissan Versa blanco 2019",
    vehiclePhotoUrl: null,
    status: "inside",
  },
  "TPQ-123": {
    studentName: "Ana Martinez Ruiz",
    studentId: "202198234",
    vehicleType: "bici",
    plate: "TPQ-123",
    hasHelmet: true,
    helmetCount: 1,
    helmets: [
      { description: "Casco verde con luz trasera" },
    ],
    vehicleDescription: "Bicicleta de montaña azul Trek",
    vehiclePhotoUrl: null,
    status: "outside",
  },
  "URX-9876": {
    studentName: "Luis Hernandez Perez",
    studentId: "201923456",
    vehicleType: "moto",
    plate: "URX-9876",
    hasHelmet: true,
    helmetCount: 1,
    helmets: [
      { description: "Casco integral negro mate Shoei" },
    ],
    vehicleDescription: "Yamaha R15 azul con escape deportivo",
    vehiclePhotoUrl: null,
    status: "inside",
  },
  "202161606": {
    studentName: "Angel Gabriel Sosa Morales",
    studentId: "202161606",
    vehicleType: "moto",
    plate: "TNA-1234",
    hasHelmet: true,
    helmetCount: 2,
    helmets: [
      { description: "Negro con sticker rojo, marca LS2" },
      { description: "Blanco liso, marca HJC" },
    ],
    vehicleDescription: "Honda CB190R negra con escape Yoshimura",
    vehiclePhotoUrl: null,
    status: "outside",
  },
  "202045789": {
    studentName: "Carlos Ramirez Torres",
    studentId: "202045789",
    vehicleType: "carro",
    plate: "UBZ-5678",
    hasHelmet: false,
    helmetCount: 0,
    helmets: [],
    vehicleDescription: "Nissan Versa blanco 2019",
    vehiclePhotoUrl: null,
    status: "inside",
  },
  "202198234": {
    studentName: "Ana Martinez Ruiz",
    studentId: "202198234",
    vehicleType: "bici",
    plate: "TPQ-123",
    hasHelmet: true,
    helmetCount: 1,
    helmets: [
      { description: "Casco verde con luz trasera" },
    ],
    vehicleDescription: "Bicicleta de montaña azul Trek",
    vehiclePhotoUrl: null,
    status: "outside",
  },
  "201923456": {
    studentName: "Luis Hernandez Perez",
    studentId: "201923456",
    vehicleType: "moto",
    plate: "URX-9876",
    hasHelmet: true,
    helmetCount: 1,
    helmets: [
      { description: "Casco integral negro mate Shoei" },
    ],
    vehicleDescription: "Yamaha R15 azul con escape deportivo",
    vehiclePhotoUrl: null,
    status: "inside",
  },
  "TXY-5678": {
    studentName: "Pedro Sanchez Morales",
    studentId: "202134567",
    vehicleType: "moto",
    plate: "TXY-5678",
    hasHelmet: true,
    helmetCount: 2,
    helmets: [
      { description: "Casco rojo brillante con calcomanías, marca AGV" },
      { description: "Casco negro mate con visera ahumada, marca LS2" },
    ],
    vehicleDescription: "Kawasaki Ninja 400 verde 2022, escape Akrapovic",
    vehiclePhotoUrl: null,
    status: "outside",
  },
  "202134567": {
    studentName: "Pedro Sanchez Morales",
    studentId: "202134567",
    vehicleType: "moto",
    plate: "TXY-5678",
    hasHelmet: true,
    helmetCount: 2,
    helmets: [
      { description: "Casco rojo brillante con calcomanías, marca AGV" },
      { description: "Casco negro mate con visera ahumada, marca LS2" },
    ],
    vehicleDescription: "Kawasaki Ninja 400 verde 2022, escape Akrapovic",
    vehiclePhotoUrl: null,
    status: "outside",
  },
}
