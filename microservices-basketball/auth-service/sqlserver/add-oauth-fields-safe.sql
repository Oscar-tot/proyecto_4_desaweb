-- Migración: Agregar campos OAuth a la tabla users (versión segura)
-- Fecha: 2025-11-11
-- Descripción: Agrega soporte para autenticación con Google, Facebook y GitHub

USE auth_service_db;

-- Verificar columnas existentes
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'auth_service_db' 
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME IN ('provider', 'providerId', 'profilePicture');

-- Agregar columna provider solo si no existe
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'auth_service_db' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'provider';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE users ADD COLUMN provider VARCHAR(50) NULL COMMENT "Proveedor OAuth: local, google, facebook, github"',
    'SELECT "Column provider already exists" AS Info');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar columna providerId solo si no existe
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'auth_service_db' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'providerId';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE users ADD COLUMN providerId VARCHAR(255) NULL COMMENT "ID del usuario en el proveedor OAuth"',
    'SELECT "Column providerId already exists" AS Info');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar columna profilePicture solo si no existe
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'auth_service_db' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'profilePicture';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE users ADD COLUMN profilePicture TEXT NULL COMMENT "URL de la foto de perfil del usuario"',
    'SELECT "Column profilePicture already exists" AS Info');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Hacer que la columna password sea nullable (para usuarios OAuth)
ALTER TABLE users 
MODIFY COLUMN password VARCHAR(255) NULL;

-- Crear índice solo si no existe
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'auth_service_db' 
  AND TABLE_NAME = 'users' 
  AND INDEX_NAME = 'idx_provider_providerId';

SET @query = IF(@index_exists = 0, 
    'CREATE INDEX idx_provider_providerId ON users(provider, providerId)',
    'SELECT "Index idx_provider_providerId already exists" AS Info');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar usuarios existentes para que tengan provider 'local'
UPDATE users 
SET provider = 'local' 
WHERE provider IS NULL OR provider = '';

-- Mostrar resumen
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN provider = 'local' THEN 1 END) as usuarios_locales,
    COUNT(CASE WHEN provider = 'google' THEN 1 END) as usuarios_google,
    COUNT(CASE WHEN provider = 'facebook' THEN 1 END) as usuarios_facebook,
    COUNT(CASE WHEN provider = 'github' THEN 1 END) as usuarios_github
FROM users;

-- Verificar estructura final de la tabla
DESCRIBE users;
