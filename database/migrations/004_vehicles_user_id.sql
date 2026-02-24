-- Migración: vehicles.user_id y eliminar student_id/student_name.
-- Solo aplica si vehicles tiene la columna student_id (esquema viejo).

-- 1. Añadir user_id a vehicles si no existe
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vehicles' AND COLUMN_NAME = 'user_id');
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE vehicles ADD COLUMN user_id INT NULL COMMENT ''Alumno dueño'' AFTER id, ADD KEY idx_user_id (user_id), ADD CONSTRAINT fk_vehicles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Si vehicles tiene student_id: crear usuarios (alumnos) por cada (student_id, student_name) y rellenar user_id
-- Insertar alumnos únicos por matrícula (usamos student_id como matricula)
INSERT IGNORE INTO users (matricula, full_name)
SELECT DISTINCT student_id, student_name
FROM vehicles
WHERE EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vehicles' AND COLUMN_NAME = 'student_id')
  AND student_id IS NOT NULL
  AND student_id != '';

UPDATE vehicles v
JOIN users u ON u.matricula = v.student_id
SET v.user_id = u.id
WHERE EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vehicles' AND COLUMN_NAME = 'student_id')
  AND v.user_id IS NULL;

-- 3. Quitar FK fk_vehicles_user solo si estamos migrando (vehicles tiene student_id)
SET @sid = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vehicles' AND COLUMN_NAME = 'student_id');
SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vehicles' AND CONSTRAINT_NAME = 'fk_vehicles_user');
SET @sql = IF(@sid > 0 AND @fk_exists > 0, 'ALTER TABLE vehicles DROP FOREIGN KEY fk_vehicles_user', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Eliminar student_id y student_name si existen; hacer user_id NOT NULL
SET @sid = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vehicles' AND COLUMN_NAME = 'student_id');
SET @sql = IF(@sid > 0,
  'ALTER TABLE vehicles DROP COLUMN student_id, DROP COLUMN student_name, MODIFY COLUMN user_id INT NOT NULL, ADD CONSTRAINT fk_vehicles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
