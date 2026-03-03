# Database - Capa de Datos

Este modulo es el unico punto de contacto entre la aplicacion y MySQL. Centraliza la configuracion del pool de conexiones, expone una API sencilla para acceder a la base de datos y contiene el esquema relacional completo junto con las migraciones incrementales del proyecto.

---

## Tabla de contenidos

- [Proposito](#proposito)
- [Estructura de archivos](#estructura-de-archivos)
- [Variables de entorno requeridas](#variables-de-entorno-requeridas)
- [Instalacion y primera ejecucion](#instalacion-y-primera-ejecucion)
- [Esquema de la base de datos](#esquema-de-la-base-de-datos)
  - [users](#tabla-users)
  - [vehicles](#tabla-vehicles)
  - [helmets](#tabla-helmets)
  - [guards](#tabla-guards)
  - [movements](#tabla-movements)
- [Relaciones entre tablas](#relaciones-entre-tablas)
- [Migraciones](#migraciones)
- [API del modulo](#api-del-modulo)
- [Detalles tecnicos de la conexion](#detalles-tecnicos-de-la-conexion)

---

## Proposito

Al concentrar la logica de conexion en un unico lugar, se garantiza que:

- El pool de conexiones se crea una sola vez durante el ciclo de vida del proceso de Node.js (patron singleton).
- Cualquier cambio en las credenciales o el host de la base de datos se realiza en un solo archivo de configuracion.
- La capa `api` puede solicitar conexiones o usar el pool directamente sin preocuparse por los detalles de configuracion.

---

## Estructura de archivos

```
database/
├── index.ts              - Punto de entrada publico. Reexporta getConnection y getDb.
├── connection.ts         - Logica de creacion y gestion del pool de conexiones MySQL.
├── schema.sql            - Esquema relacional completo. Referencia estructural del modelo de datos.
└── migrations/           - Scripts SQL numerados. Cada uno representa un cambio incremental al esquema.
    ├── 001_add_users_and_guard_id.sql
    ├── 002_add_gate_to_users.sql
    ├── 003_rename_users_to_guards_and_add_users_table.sql
    ├── 004_vehicles_user_id.sql
    └── 005_drop_users_old.sql
```

---

## Variables de entorno requeridas

Todas las variables se configuran en el archivo `.env.local` ubicado en la raiz del directorio `app`. El modulo lee estas variables en tiempo de ejecucion al crear el pool por primera vez.

| Variable | Descripcion | Valor por defecto |
|---|---|---|
| `MYSQL_HOST` | Host del servidor MySQL | `localhost` |
| `MYSQL_PORT` | Puerto de conexion | `3306` |
| `MYSQL_USER` | Usuario de la base de datos | `root` |
| `MYSQL_PASSWORD` | Contrasena del usuario | *(vacio)* |
| `MYSQL_DATABASE` | Nombre de la base de datos | `guardias` |

> Si el archivo `.env.local` no existe, el modulo intentara conectarse con los valores por defecto. Esto puede funcionar en entornos de desarrollo locales con MySQL instalado sin contrasena, pero en produccion las credenciales siempre deben estar definidas explicitamente.

---

## Instalacion y primera ejecucion

### 1. Asegurarse de tener MySQL en ejecucion

```bash
# macOS con Homebrew
brew services start mysql

# Verificar que esta activo
mysql -u root -e "SELECT VERSION();"
```

### 2. Crear la base de datos

```sql
CREATE DATABASE IF NOT EXISTS guardias
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 3. Aplicar el esquema inicial

El archivo `schema.sql` contiene el modelo completo listo para ejecutarse en una base de datos vacia:

```bash
mysql -u root -p guardias < database/schema.sql
```

### 4. Aplicar migraciones (si la base de datos ya existe)

Si ya tienes una instancia en funcionamiento y necesitas actualizar el esquema, ejecuta las migraciones en orden estricto:

```bash
mysql -u root -p guardias < database/migrations/001_add_users_and_guard_id.sql
mysql -u root -p guardias < database/migrations/002_add_gate_to_users.sql
mysql -u root -p guardias < database/migrations/003_rename_users_to_guards_and_add_users_table.sql
mysql -u root -p guardias < database/migrations/004_vehicles_user_id.sql
mysql -u root -p guardias < database/migrations/005_drop_users_old.sql
```

> Aplica solo las migraciones que aun no se han ejecutado en tu instancia. El numero de prefijo indica el orden secuencial obligatorio.

---

## Esquema de la base de datos

Todas las tablas usan el motor `InnoDB`, juego de caracteres `utf8mb4` con collation `utf8mb4_unicode_ci`. Esto garantiza soporte completo para caracteres especiales, acentos y emojis.

### Tabla `users`

Almacena los alumnos que son duenos de vehiculos registrados.

| Columna | Tipo | Descripcion |
|---|---|---|
| `id` | INT AUTO_INCREMENT | Clave primaria |
| `matricula` | VARCHAR(12) | Matricula del alumno (9 digitos). Indice unico. |
| `full_name` | VARCHAR(255) | Nombre completo del alumno |
| `email` | VARCHAR(255) NULL | Correo electronico. Opcional, puede ser NULL. |
| `created_at` | TIMESTAMP | Fecha de creacion del registro |
| `updated_at` | TIMESTAMP | Fecha de ultima modificacion |

**Indices:** `uk_matricula` (unico), `idx_matricula` (busqueda rapida).

---

### Tabla `vehicles`

Cada fila representa un vehiculo registrado en el sistema, siempre asociado a un alumno.

| Columna | Tipo | Descripcion |
|---|---|---|
| `id` | INT AUTO_INCREMENT | Clave primaria |
| `user_id` | INT | FK hacia `users.id`. Cascade delete. |
| `plate` | VARCHAR(10) | Placa normalizada. Ej: `TNA-1234`. Indice unico. |
| `vehicle_type` | ENUM('moto', 'carro', 'bici') | Tipo de vehiculo |
| `has_helmet` | TINYINT(1) | 1 si el vehiculo lleva al menos un casco |
| `helmet_count` | TINYINT UNSIGNED | Cantidad total de cascos registrados |
| `vehicle_description` | VARCHAR(500) NULL | Descripcion libre (marca, color, etc.) |
| `vehicle_photo_path` | VARCHAR(500) NULL | Ruta relativa a la foto, ej: `vehicles/TNA-1234-xxx.jpg` |
| `status` | ENUM('inside', 'outside') | Estado actual: dentro o fuera del campus |
| `created_at` | TIMESTAMP | Fecha de registro |
| `updated_at` | TIMESTAMP | Ultima modificacion |

**Indices:** `uk_plate` (unico), `idx_user_id`, `idx_status`.

---

### Tabla `helmets`

Almacena la descripcion individual de cada casco asociado a un vehiculo. Un vehiculo puede tener multiples cascos.

| Columna | Tipo | Descripcion |
|---|---|---|
| `id` | INT AUTO_INCREMENT | Clave primaria |
| `vehicle_id` | INT | FK hacia `vehicles.id`. Cascade delete. |
| `description` | VARCHAR(255) | Descripcion del casco (color, marca, etc.) |
| `sort_order` | TINYINT UNSIGNED | Orden de visualizacion en la interfaz |

**Indices:** `idx_vehicle_id`.

---

### Tabla `guards`

Contiene los guardias de puerta y administradores del sistema. El rol diferencia el tipo de acceso.

| Columna | Tipo | Descripcion |
|---|---|---|
| `id` | INT AUTO_INCREMENT | Clave primaria |
| `email` | VARCHAR(255) | Correo institucional. Indice unico. |
| `password_hash` | VARCHAR(255) | Hash bcrypt de la contrasena |
| `role` | ENUM('admin', 'guard') | Rol del usuario en el sistema |
| `full_name` | VARCHAR(255) | Nombre completo |
| `gate` | TINYINT UNSIGNED NULL | Numero de puerta asignada (1-15). Solo aplica a guardias. |
| `created_at` | TIMESTAMP | Fecha de creacion |
| `updated_at` | TIMESTAMP | Ultima modificacion |

**Indices:** `uk_email` (unico), `idx_role`.

---

### Tabla `movements`

Historial completo de entradas y salidas al campus. Cada fila es inmutable; representa un evento puntual.

| Columna | Tipo | Descripcion |
|---|---|---|
| `id` | INT AUTO_INCREMENT | Clave primaria |
| `vehicle_id` | INT | FK hacia `vehicles.id`. Sin cascade; el historial persiste aunque el vehiculo sea eliminado. |
| `guard_id` | INT NULL | FK hacia `guards.id`. SET NULL si el guardia es eliminado. |
| `type` | ENUM('entry', 'exit') | Tipo de movimiento |
| `created_at` | TIMESTAMP | Fecha y hora exacta del evento |

**Indices:** `idx_vehicle_id`, `idx_guard_id`, `idx_created_at`.

---

## Relaciones entre tablas

```
users (alumnos)
  └── vehicles        [FK: vehicles.user_id → users.id, CASCADE DELETE]
        └── helmets   [FK: helmets.vehicle_id → vehicles.id, CASCADE DELETE]
        └── movements [FK: movements.vehicle_id → vehicles.id]

guards (guardias y admins)
  └── movements       [FK: movements.guard_id → guards.id, SET NULL ON DELETE]
```

La relacion entre `vehicles` y `movements` no tiene cascade delete de forma intencional: si se elimina un vehiculo del sistema, su historial de movimientos se conserva en la tabla `movements` aunque la FK quede sin referencia (el motor permite esto dado que solo hay indice, no FK con constraint en esa direccion). Si se requiere un comportamiento diferente, debe evaluarse en una migracion.

---

## Migraciones

Las migraciones estan en la carpeta `migrations/` y documentan la evolucion historica del esquema desde la version inicial hasta el estado actual:

| Archivo | Descripcion |
|---|---|
| `001_add_users_and_guard_id.sql` | Agrega la tabla de usuarios y la columna `guard_id` a movimientos. |
| `002_add_gate_to_users.sql` | Agrega el campo `gate` para indicar la puerta asignada. |
| `003_rename_users_to_guards_and_add_users_table.sql` | Renombra la tabla de autenticacion a `guards` y crea la nueva tabla `users` para alumnos. |
| `004_vehicles_user_id.sql` | Agrega la columna `user_id` a `vehicles` para ligar vehiculos a alumnos. |
| `005_drop_users_old.sql` | Limpia tablas obsoletas del esquema anterior. |

### Convencion para futuras migraciones

Cada nueva migracion debe seguir las siguientes reglas:

- Nombre: `NNN_descripcion_corta.sql` donde `NNN` es el siguiente numero secuencial con ceros a la izquierda.
- Contenido: usar `IF EXISTS` / `IF NOT EXISTS` donde sea posible para hacer las migraciones idempotentes.
- No modificar migraciones ya aplicadas en produccion. Cualquier correccion se hace con una nueva migracion.

---

## API del modulo

El archivo `index.ts` expone dos funciones para ser usadas exclusivamente desde la capa `api`:

```typescript
import { getConnection, getDb } from "@/database"

// getDb(): Pool
// Retorna el pool de conexiones global. Ideal para consultas simples con execute().
const db = getDb()
const [rows] = await db.execute("SELECT * FROM vehicles WHERE status = ?", ["inside"])

// getConnection(): Promise<PoolConnection>
// Retorna una conexion individual del pool. Necesaria para transacciones.
// Siempre hacer release() al terminar.
const conn = await getConnection()
try {
  await conn.beginTransaction()
  // ... operaciones
  await conn.commit()
} catch (err) {
  await conn.rollback()
  throw err
} finally {
  conn.release()
}
```

---

## Detalles tecnicos de la conexion

La configuracion del pool en `connection.ts` establece los siguientes parametros:

| Parametro | Valor | Descripcion |
|---|---|---|
| `waitForConnections` | `true` | Las solicitudes esperan si el pool esta en su limite, en lugar de lanzar error. |
| `connectionLimit` | `10` | Maximo de conexiones simultaneas. Ajustar segun la carga esperada y la configuracion del servidor MySQL. |
| `queueLimit` | `0` | Sin limite en la cola de solicitudes en espera. |
| `charset` | `utf8mb4` | Soporte completo para Unicode. |

El pool se crea con el patron singleton: la primera llamada a `getPool()` instancia el pool y las llamadas subsequentes retornan la misma instancia, evitando crear multiples pools durante el mismo ciclo de vida del proceso.
