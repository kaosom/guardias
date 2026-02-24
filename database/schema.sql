-- =============================================================================
-- Esquema de base de datos para el sistema de guardias (entrada/salida de vehículos)
-- MySQL 8+. Orden: users (alumnos), vehicles, helmets, guards, movements.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tabla: users (alumnos)
-- Alumnos con matrícula y nombre. Un usuario puede tener múltiples vehículos.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  matricula VARCHAR(12) NOT NULL COMMENT 'Matrícula del alumno, 9 dígitos',
  full_name VARCHAR(255) NOT NULL COMMENT 'Nombre completo del alumno',
  email VARCHAR(255) NULL COMMENT 'Correo opcional',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_matricula (matricula),
  KEY idx_matricula (matricula)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Alumnos (dueños de vehículos)';

-- -----------------------------------------------------------------------------
-- Tabla: vehicles
-- Vehículos asociados a un alumno (user_id). Placa única.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT 'Alumno dueño del vehículo',
  plate VARCHAR(10) NOT NULL COMMENT 'Placa normalizada, ej. TNA-1234',
  vehicle_type ENUM('moto', 'carro', 'bici') NOT NULL COMMENT 'Tipo de vehículo',
  has_helmet TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 si lleva casco',
  helmet_count TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Cantidad de cascos',
  vehicle_description VARCHAR(500) NULL COMMENT 'Descripción del vehículo (marca, color, etc.)',
  vehicle_photo_path VARCHAR(500) NULL COMMENT 'Ruta relativa de la foto en el servidor',
  status ENUM('inside', 'outside') NOT NULL DEFAULT 'outside' COMMENT 'Dentro o fuera del campus',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_plate (plate),
  KEY idx_user_id (user_id),
  KEY idx_status (status),
  CONSTRAINT fk_vehicles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Vehículos registrados para control de entrada y salida';

-- -----------------------------------------------------------------------------
-- Tabla: helmets
-- Descripción de cada casco asociado a un vehículo (motocicleta/bici).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS helmets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL COMMENT 'Vehículo al que pertenece el casco',
  description VARCHAR(255) NOT NULL COMMENT 'Descripción del casco (color, marca, etc.)',
  sort_order TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Orden de visualización',
  KEY idx_vehicle_id (vehicle_id),
  CONSTRAINT fk_helmets_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cascos por vehículo';

-- -----------------------------------------------------------------------------
-- Tabla: guards
-- Guardias de puerta y administradores. Contraseña en hash bcrypt.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL COMMENT 'Correo institucional',
  password_hash VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt de la contraseña',
  role ENUM('admin', 'guard') NOT NULL COMMENT 'Rol: admin o guardia',
  full_name VARCHAR(255) NOT NULL COMMENT 'Nombre completo',
  gate TINYINT UNSIGNED NULL COMMENT 'Número de puerta asignada (1-15), solo guardias',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_email (email),
  KEY idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Guardias de puerta y administradores';

-- -----------------------------------------------------------------------------
-- Tabla: movements
-- Historial de entradas y salidas por vehículo. guard_id indica quién registró.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL COMMENT 'Vehículo que entró o salió',
  guard_id INT NULL COMMENT 'Guardia que registró el movimiento',
  type ENUM('entry', 'exit') NOT NULL COMMENT 'Entrada o salida',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora del movimiento',
  KEY idx_vehicle_id (vehicle_id),
  KEY idx_guard_id (guard_id),
  KEY idx_created_at (created_at),
  CONSTRAINT fk_movements_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (id),
  CONSTRAINT fk_movements_guard FOREIGN KEY (guard_id) REFERENCES guards (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Registro de entradas y salidas al campus';
