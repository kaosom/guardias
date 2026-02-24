/**
 * Punto de entrada de la capa API.
 * Reexporta los servicios para que las rutas HTTP importen desde @/api.
 */

export {
  create,
  getById,
  getByPlate,
  getByStudentId,
  search,
  update,
  deleteVehicle,
  type VehicleInput,
  type VehicleRecordWithId,
} from "./vehicles"

export { registerMovement, getByVehicleId, getByGuardId, type MovementType } from "./movements"

export { saveVehiclePhoto, resolvePhotoPath } from "./photos"

export {
  findByEmail,
  listGuards,
  getById as getUserById,
  createGuard,
  deleteGuard,
  countAdmins,
  type GuardRow,
  type UserSession,
  type UserRole,
} from "./guards"

export { findByMatricula, findOrCreateByMatriculaAndName, getById as getAlumnoById, type UserRow } from "./users"
