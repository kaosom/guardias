-- Migración: tabla users y columna guard_id en movements. Idempotente.

-- Tabla users (si no existe; sin gate, 002 añade gate)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'guard') NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_email (email),
  KEY idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Columna guard_id en movements solo si no existe
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movements' AND COLUMN_NAME = 'guard_id');
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE movements ADD COLUMN guard_id INT NULL COMMENT ''Usuario guardia que registró el movimiento'' AFTER vehicle_id',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice y FK solo si la columna existe (evitar error si ya estaban creados)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movements' AND COLUMN_NAME = 'guard_id');
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movements' AND INDEX_NAME = 'idx_guard_id');
SET @sql = IF(@col_exists > 0 AND @idx_exists = 0,
  'ALTER TABLE movements ADD KEY idx_guard_id (guard_id)',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movements' AND CONSTRAINT_NAME = 'fk_movements_guard');
SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE movements ADD CONSTRAINT fk_movements_guard FOREIGN KEY (guard_id) REFERENCES users (id) ON DELETE SET NULL',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
