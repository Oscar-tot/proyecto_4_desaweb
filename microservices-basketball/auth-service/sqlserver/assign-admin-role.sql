-- ============================================
-- ASIGNAR ROL DE ADMINISTRADOR AL USUARIO
-- ============================================

USE auth_service_db;

-- 1. Ver todos los usuarios
SELECT id, username, email, firstName, lastName FROM users;

-- 2. Ver todos los roles
SELECT * FROM roles;

-- 3. Ver las asignaciones actuales de roles
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    r.id as role_id,
    r.name as role_name
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
ORDER BY u.id;

-- ============================================
-- 4. ASIGNAR ROL DE ADMIN AL USUARIO 'admin'
-- ============================================

-- Primero, eliminar cualquier asignación existente para evitar duplicados
DELETE FROM user_roles WHERE user_id = 1;

-- Asignar rol de admin (role_id = 1 es 'admin')
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);

-- ============================================
-- 5. VERIFICAR LA ASIGNACIÓN
-- ============================================

SELECT 
    u.id as user_id,
    u.username,
    u.email,
    r.id as role_id,
    r.name as role_name
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'admin';

-- Debería mostrar:
-- user_id | username | email                          | role_id | role_name
-- 1       | admin    | admin@basketballscoreboard.com | 1       | admin
