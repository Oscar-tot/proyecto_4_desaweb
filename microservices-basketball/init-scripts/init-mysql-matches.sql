-- Script de inicialización de MySQL para matches-service
-- Base de datos: matches_service_db
-- Usuario: mysqlweb / mysql123@

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS matches_service_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE matches_service_db;

-- Las tablas se crearán automáticamente con TypeORM synchronize
-- Este script es solo para verificar que la base de datos existe

-- Verificar conexión
SELECT 'matches_service_db inicializada correctamente' AS status;
