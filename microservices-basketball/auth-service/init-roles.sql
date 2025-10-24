-- Script de inicialización para Auth Service
-- Ejecutar este script después de que TypeORM cree las tablas

USE auth_service_db;

-- Insertar roles iniciales si no existen
INSERT IGNORE INTO roles (name, description, createdAt) VALUES
('admin', 'Administrador con acceso total al sistema', NOW()),
('user', 'Usuario estándar del sistema', NOW()),
('moderator', 'Moderador de contenido y partidos', NOW()),
('scorer', 'Anotador autorizado para registrar eventos en partidos', NOW());

-- Mostrar roles creados
SELECT * FROM roles;

-- Nota: Para asignar rol admin al primer usuario, ejecutar después del registro:
-- INSERT INTO user_roles (user_id, role_id) 
-- SELECT 1, id FROM roles WHERE name = 'admin';
