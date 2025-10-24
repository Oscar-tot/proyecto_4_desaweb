-- Crear bases de datos para microservicios
CREATE DATABASE IF NOT EXISTS auth_service_db;
CREATE DATABASE IF NOT EXISTS matches_service_db;

-- Otorgar permisos
GRANT ALL PRIVILEGES ON auth_service_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON matches_service_db.* TO 'root'@'%';
FLUSH PRIVILEGES;
