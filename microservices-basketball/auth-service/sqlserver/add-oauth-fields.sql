-- Migración: Agregar campos OAuth a la tabla users
-- Fecha: 2025-11-11
-- Descripción: Agrega soporte para autenticación con Google, Facebook y GitHub

USE auth_service_db;

-- Agregar columnas OAuth (si ya existen, MySQL las ignorará con un warning)
ALTER TABLE users 
ADD COLUMN provider VARCHAR(50) NULL COMMENT 'Proveedor OAuth: local, google, facebook, github';

ALTER TABLE users 
ADD COLUMN providerId VARCHAR(255) NULL COMMENT 'ID del usuario en el proveedor OAuth';

ALTER TABLE users 
ADD COLUMN profilePicture TEXT NULL COMMENT 'URL de la foto de perfil del usuario';

-- Hacer que la columna password sea nullable (para usuarios OAuth)
ALTER TABLE users 
MODIFY COLUMN password VARCHAR(255) NULL;

-- Crear índice en provider y providerId para búsquedas rápidas
CREATE INDEX idx_provider_providerId ON users(provider, providerId);

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

-- Verificar estructura de la tabla
DESCRIBE users;
