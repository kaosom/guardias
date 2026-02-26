-- =============================================================================
-- Esquema de base de datos para el sistema de guardias (entrada/salida de vehículos)
-- MySQL 8+. Orden: users (alumnos), vehicles, helmets, locations, guards, movements.
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
-- Tabla: locations
-- Planteles o lugares donde pueden estar asignados los guardias (ej. CU, CU2).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS locations (
  id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL COMMENT 'Código corto del lugar, ej. CU, CU2',
  name VARCHAR(255) NOT NULL COMMENT 'Nombre descriptivo del plantel',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_locations_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Planteles o lugares disponibles para asignar guardias';

-- Valores iniciales de lugares. El administrador puede editarlos o añadir más.
INSERT INTO locations (id, code, name)
VALUES
  (1, 'CU', 'Ciudad Universitaria (CU)'),
  (2, 'CU2', 'Ciudad Universitaria 2 (CU2)'),
  (3, 'AREA_CENTRO_HISTORICO', 'Área Centro Histórico (Carolino y sedes del centro)'),
  (4, 'AREA_SALUD', 'Área de la Salud'),
  (5, 'AREA_ANGELOPOLIS_CCU', 'Área Angelópolis / Complejo Cultural Universitario (CCU)'),

  (10, 'CRC_TECAMACHALCO', 'Complejo Regional Centro · Tecamachalco'),
  (11, 'CRC_SAN_JOSE_CHIAPA', 'Complejo Regional Centro · San José Chiapa'),
  (12, 'CRC_ACAJETE', 'Complejo Regional Centro · Acajete'),
  (13, 'CRC_CIUDAD_SERDAN', 'Complejo Regional Centro · Ciudad Serdán'),
  (14, 'CRC_ACATZINGO', 'Complejo Regional Centro · Acatzingo'),
  (15, 'CRC_TEPEACA', 'Complejo Regional Centro · Tepeaca'),

  (20, 'CRM_ATLIXCO', 'Complejo Regional Mixteca · Atlixco'),
  (21, 'CRM_CHIAUTLA', 'Complejo Regional Mixteca · Chiautla de Tapia'),
  (22, 'CRM_IZUCAR', 'Complejo Regional Mixteca · Izúcar de Matamoros'),

  (30, 'CRN_TEZIUTLAN', 'Complejo Regional Nororiental · Teziutlán'),
  (31, 'CRN_ZACAPOAXTLA', 'Complejo Regional Nororiental · Zacapoaxtla'),
  (32, 'CRN_CUETZALAN', 'Complejo Regional Nororiental · Cuetzalan'),
  (33, 'CRN_LIBRES', 'Complejo Regional Nororiental · Libres'),

  (40, 'CRNTE_HUAUCHINANGO', 'Complejo Regional Norte · Huauchinango'),
  (41, 'CRNTE_CHIGNAHUAPAN', 'Complejo Regional Norte · Chignahuapan'),
  (42, 'CRNTE_ZACATLAN', 'Complejo Regional Norte · Zacatlán'),
  (43, 'CRNTE_TETELA', 'Complejo Regional Norte · Tetela de Ocampo'),

  (50, 'CRS_TEHUACAN', 'Complejo Regional Sur · Tehuacán'),

  (60, 'MAGDALENA_TLATLAUQUITEPEC', 'Unidad regional La Magdalena Tlatlauquitepec'),

  (70, 'PREP_EMILIANO_ZAPATA', 'Preparatoria Emiliano Zapata'),
  (71, 'PREP_2_OCTUBRE', 'Preparatoria 2 de Octubre de 1968'),
  (72, 'PREP_BENITO_JUAREZ', 'Preparatoria Benito Juárez García'),
  (73, 'PREP_ENRIQUE_CABRERA_URBANA', 'Preparatoria Enrique Cabrera Barroso Urbana'),
  (74, 'PREP_ENRIQUE_CABRERA_REGIONAL', 'Preparatoria Enrique Cabrera Barroso Regional'),
  (75, 'PREP_ALFONSO_CALDERON', 'Preparatoria Alfonso Calderón Moreno'),
  (76, 'PREP_LAZARO_CARDENAS', 'Preparatoria Lázaro Cárdenas del Río'),
  (77, 'PREP_BI_5MAYO', 'Bachillerato Internacional 5 de Mayo'),
  (78, 'PREP_SIMON_BOLIVAR', 'Preparatoria Regional Simón Bolívar'),
  (79, 'PREP_ATLIXCO', 'Preparatoria Regional de Atlixco'),
  (80, 'PREP_TEHUACAN', 'Preparatoria Regional de Tehuacán'),
  (81, 'PREP_TECAMACHALCO', 'Preparatoria Regional de Tecamachalco'),
  (82, 'PREP_ZACAPOAXTLA', 'Preparatoria Regional de Zacapoaxtla'),
  (83, 'PREP_CHIGNAHUAPAN', 'Preparatoria Regional de Chignahuapan'),
  (84, 'PREP_HUAUCHINANGO', 'Preparatoria Regional de Huauchinango'),
  (85, 'PREP_IZUCAR', 'Preparatoria Regional de Izúcar de Matamoros')
ON DUPLICATE KEY UPDATE
  name = VALUES(name);

-- -----------------------------------------------------------------------------
-- Tabla: guards
-- Guardias de puerta y administradores. Contraseña en hash bcrypt.
-- Cada guardia puede tener un puesto: puerta (gate) y plantel (location_name).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL COMMENT 'Correo institucional',
  password_hash VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt de la contraseña',
  role ENUM('admin', 'guard') NOT NULL COMMENT 'Rol: admin o guardia',
  full_name VARCHAR(255) NOT NULL COMMENT 'Nombre completo',
  gate TINYINT UNSIGNED NULL COMMENT 'Número de puerta asignada (1-15), solo guardias',
  location_name VARCHAR(255) NULL COMMENT 'Nombre del plantel asignado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_email (email),
  KEY idx_role (role),
  KEY idx_location_name (location_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Guardias de puerta y administradores con su puesto (puerta y plantel)';

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
COMMENT='Registro de entradas y salidas al campus por vehículo';
