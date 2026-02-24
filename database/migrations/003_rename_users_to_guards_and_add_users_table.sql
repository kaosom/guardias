-- Migración: pasar guardias de users a guards; crear users (alumnos).
-- Idempotente: solo actúa si existe la tabla users con columna password_hash (esquema viejo).

-- 1. Crear tabla guards si no existe (misma estructura que la antigua users)
CREATE TABLE IF NOT EXISTS guards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'guard') NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  gate TINYINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_email (email),
  KEY idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Si existe tabla users con password_hash (esquema viejo) y guards está vacía, copiar
INSERT INTO guards (id, email, password_hash, role, full_name, gate, created_at, updated_at)
SELECT id, email, password_hash, role, full_name, gate, created_at, updated_at
FROM users
WHERE EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password_hash')
  AND (SELECT COUNT(*) FROM guards) = 0;

-- 3. Quitar FK movements -> users/guards si existe
SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movements' AND CONSTRAINT_NAME = 'fk_movements_guard');
SET @sql = IF(@fk_exists > 0, 'ALTER TABLE movements DROP FOREIGN KEY fk_movements_guard', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Si users es la tabla vieja (tiene password_hash), renombrar a users_old
SET @old_users = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password_hash');
SET @sql = IF(@old_users > 0, 'RENAME TABLE users TO users_old', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Crear tabla users (alumnos) si no existe
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  matricula VARCHAR(12) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_matricula (matricula),
  KEY idx_matricula (matricula)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Añadir FK movements.guard_id -> guards(id) si no existe
SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movements' AND CONSTRAINT_NAME = 'fk_movements_guard');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE movements ADD CONSTRAINT fk_movements_guard FOREIGN KEY (guard_id) REFERENCES guards (id) ON DELETE SET NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
