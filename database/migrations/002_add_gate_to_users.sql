-- Añadir columna gate a users (1-15). Idempotente.

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'gate');
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN gate TINYINT UNSIGNED NULL COMMENT ''Número de puerta (1-15), solo guardias'' AFTER full_name',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
