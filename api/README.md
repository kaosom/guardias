# API - Capa de Servicios

Esta capa actua como la frontera entre la base de datos y los controladores HTTP de la aplicacion. Todo acceso a MySQL pasa obligatoriamente por aqui, evitando que las rutas o componentes de Next.js escriban SQL directamente. El resultado es un codebase mas limpio, testeable y facil de mantener.

---

## Tabla de contenidos

- [Proposito](#proposito)
- [Estructura de archivos](#estructura-de-archivos)
- [Descripcion de cada servicio](#descripcion-de-cada-servicio)
  - [vehicles.ts](#vehiclests)
  - [movements.ts](#movementsts)
  - [guards.ts](#guardsts)
  - [users.ts](#usersts)
  - [photos.ts](#photosets)
  - [index.ts](#indexts)
- [Tipos compartidos](#tipos-compartidos)
- [Convenciones de uso](#convenciones-de-uso)
- [Dependencias](#dependencias)

---

## Proposito

La capa `api` es un conjunto de modulos TypeScript orientados al servidor. Encapsula toda la logica de consultas SQL, normalizacion de datos y reglas de negocio simples (como la normalizacion de placas o la logica de busqueda inteligente por matricula o placa).

Desde cualquier Route Handler o Server Action de Next.js, el consumo es directo e idiomatico:

```typescript
import { getByPlate, registerMovement } from "@/api"
```

Esta convencion mantiene las rutas HTTP delgadas, responsables unicamente de parsear la request, invocar el servicio correspondiente y preparar la response.

---

## Estructura de archivos

```
api/
├── index.ts        - Barrel de exportaciones. Punto de entrada publico del modulo.
├── vehicles.ts     - CRUD completo y busqueda de vehiculos.
├── movements.ts    - Registro transaccional de entradas y salidas.
├── guards.ts       - Gestion de cuentas de guardias y administradores.
├── users.ts        - Gestion de alumnos (duenos de vehiculos).
└── photos.ts       - Almacenamiento de fotografias de vehiculos en disco.
```

---

## Descripcion de cada servicio

### `vehicles.ts`

Gestiona el ciclo de vida completo de un vehiculo en el sistema.

**Funciones exportadas:**

| Funcion | Descripcion |
|---|---|
| `create(data: VehicleInput)` | Crea un vehiculo nuevo. Encuentra o crea al alumno dueno internamente. Inserta cascos asociados en la misma operacion. |
| `getById(id: number)` | Retorna un vehiculo completo (incluyendo cascos) por su ID interno. |
| `getByPlate(plate: string)` | Busca un vehiculo por su placa, normalizando el formato antes de consultar (ej. `tna1234` => `TNA-1234`). |
| `getByStudentId(studentId: string)` | Retorna el primer vehiculo encontrado asociado a una matricula de alumno. |
| `search(query: string)` | Busqueda inteligente: detecta si el query es una matricula (9 digitos) o una placa (3 letras + digitos) y ejecuta la estrategia correcta. |
| `update(id: number, data: VehicleInput)` | Actualiza todos los campos de un vehiculo. Reemplaza los cascos en su totalidad (delete + insert). |
| `deleteVehicle(id: number)` | Elimina un vehiculo. Los cascos se eliminan en cascada por la FK de la base de datos. |

**Normalizacion de placas:**

Todas las placas pasan por `normalizePlate()` antes de cualquier operacion de escritura o lectura. La funcion quita caracteres especiales, convierte a mayusculas y aplica el formato `XXX-0000`. Esto garantiza consistencia independientemente de como el usuario ingrese la placa.

**Tipos exportados:**

```typescript
// Datos necesarios para crear o actualizar un vehiculo
interface VehicleInput {
  plate: string
  studentId: string
  studentName: string
  vehicleType: "moto" | "carro" | "bici"
  hasHelmet: boolean
  helmetCount: number
  helmets: { description: string }[]
  vehicleDescription?: string
  vehiclePhotoPath?: string | null
}

// Vehiculo completo tal como se devuelve a quien consume la API
type VehicleRecordWithId = VehicleRecord & { id: number }
```

---

### `movements.ts`

Gestiona el historial de entradas y salidas de cada vehiculo.

**Funciones exportadas:**

| Funcion | Descripcion |
|---|---|
| `registerMovement(vehicleId, type, guardId?)` | Registra un movimiento (entry o exit) y actualiza el `status` del vehiculo atomicamente en la misma transaccion SQL. Retorna el `movementId` y el nuevo `status`. |
| `getByVehicleId(vehicleId, limit?)` | Lista los ultimos movimientos de un vehiculo. Limite predeterminado: 50 registros. |
| `getByGuardId(guardId, limit?)` | Lista los movimientos registrados por un guardia especifico, incluyendo la placa del vehiculo. Util para el panel de administracion. Limite maximo: 500. |

**Transaccionalidad:**

`registerMovement` usa una conexion dedicada del pool (via `getConnection`) para garantizar que el INSERT en `movements` y el UPDATE en `vehicles.status` sean atomicos. Si alguna operacion falla, se ejecuta un ROLLBACK automatico.

---

### `guards.ts`

Administra las cuentas de los guardias de puerta y administradores del sistema.

**Funciones exportadas:**

| Funcion | Descripcion |
|---|---|
| `findByEmail(email)` | Busca un guardia o administrador por su correo electronico. Devuelve la fila completa, incluyendo el `password_hash`, unicamente para uso interno en el proceso de autenticacion. |
| `createGuard(data, hashPassword)` | Crea un guardia nuevo con rol `guard`. Recibe la contrasena en texto plano y una funcion de hash como parametro, lo que permite desacoplar la logica de bcrypt del servicio de datos. El numero de puerta se valida en el rango 1-15. |
| `listGuards()` | Retorna todos los usuarios con rol `guard`, ordenados alfabeticamente por nombre. No expone hashes de contrasena. |
| `getById(id)` | Retorna la sesion de un guardia o administrador por ID. No expone datos sensibles. |
| `deleteGuard(id)` | Elimina un guardia. Solo funciona sobre cuentas con rol `guard`; los administradores no pueden ser eliminados por esta via. |
| `countAdmins()` | Cuenta el numero de administradores registrados. Se utiliza para validar que no se elimine el ultimo administrador del sistema. |

**Tipos exportados:**

```typescript
type UserRole = "admin" | "guard"

interface GuardRow {
  id: number
  email: string
  password_hash: string
  role: UserRole
  full_name: string
  gate: number | null
  created_at: Date
  updated_at: Date
}

interface UserSession {
  id: number
  email: string
  role: UserRole
  fullName: string
  gate?: number | null
}
```

---

### `users.ts`

Gestiona los registros de alumnos (duenos de vehiculos).

**Funciones exportadas:**

| Funcion | Descripcion |
|---|---|
| `findByMatricula(matricula)` | Busca un alumno por matricula. La funcion normaliza el input extrayendo solo digitos y tomando maximo 12 caracteres. |
| `findOrCreateByMatriculaAndName(matricula, fullName)` | Patron "find or create". Si el alumno no existe, lo crea. Usado en la creacion y actualizacion de vehiculos para garantizar que el dueno siempre este registrado. |
| `getById(id)` | Retorna un alumno por su ID interno. |

---

### `photos.ts`

Maneja el almacenamiento fisico de las fotografias de vehiculos en el servidor de forma segura.

**Funciones exportadas:**

| Funcion | Descripcion |
|---|---|
| `saveVehiclePhoto(buffer, mimeType, identifier)` | Guarda una imagen en disco y retorna la ruta relativa que debe persistirse en la columna `vehicle_photo_path` de la base de datos. |
| `resolvePhotoPath(relativePath)` | Valida que una ruta relativa apunte dentro de la carpeta de uploads (prevencion de path-traversal) y retorna la ruta absoluta del archivo. Lanza si la ruta intenta salir de la carpeta o el archivo no existe. |
| `getUploadDir()` | Retorna la ruta absoluta del directorio de uploads de vehiculos. |

**Reglas de validacion:**

- Tipos de archivo permitidos: `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
- Tamano maximo: 5 MB.
- El nombre del archivo se genera combinando el identificador del vehiculo (placa o ID) con un **UUID v4**, lo que hace los nombres imposibles de adivinar.

**Ruta de almacenamiento (seguridad critica):**

La variable de entorno `UPLOAD_DIR` controla el directorio base. Si no se define, se usa `./private-uploads` (relativo a `app/`). Esta carpeta esta **intencionalmente fuera de `public/`** para que Next.js no la sirva como archivo estatico.

Las fotos solo son accesibles a traves del endpoint autenticado `GET /api/photos/[...path]`.

La ruta relativa que devuelve `saveVehiclePhoto` (ej. `vehicles/TNA-1234-550e8400-uuid.jpg`) es la que se persiste en la base de datos.

**Proteccion contra path-traversal:**

`resolvePhotoPath` verifica que la ruta resuelta empiece con la ruta absoluta del directorio de uploads, bloqueando ataques del tipo `../../etc/passwd`.

---

### `index.ts`

Barrel file que reexporta todas las funciones y tipos necesarios desde los demas archivos del modulo. Cualquier consumidor externo debe importar desde `@/api` y no desde los archivos individuales directamente.

```typescript
// Correcto
import { create, deleteVehicle, registerMovement } from "@/api"

// Evitar
import { create } from "@/api/vehicles"
```

---

## Tipos compartidos

El tipo `VehicleRecord` (definido en `@/lib/types`) es la representacion canonica de un vehiculo a lo largo de toda la aplicacion:

```typescript
interface VehicleRecord {
  id?: number
  studentName: string
  studentId: string
  vehicleType: "moto" | "carro" | "bici"
  plate: string
  hasHelmet: boolean
  helmetCount: number
  helmets: { description: string }[]
  vehicleDescription: string
  vehiclePhotoUrl: string | null
  status: "inside" | "outside"
}
```

---

## Convenciones de uso

- Todos los metodos son `async` y deben ser invocados con `await`.
- Nunca se llama a esta capa desde componentes del lado del cliente. Unicamente desde Server Actions o Route Handlers (`app/api/**`).
- Las funciones no lanzan errores HTTP (como 404 o 400). Devuelven `null` en caso de "no encontrado" y lanzan errores de JS en caso de fallo critico. Es responsabilidad de la capa de rutas traducir eso a respuestas HTTP.

---

## Dependencias

Esta capa depende exclusivamente del modulo `@/database` para acceder al pool de conexiones MySQL. No tiene dependencias de UI ni de Next.js.

```
@/api → @/database → mysql2/promise
```
