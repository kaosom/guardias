-- Eliminar tabla users_old si existe (restos de la migración 003).

SET @tbl = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users_old');
SET @sql = IF(@tbl > 0, 'DROP TABLE users_old', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
