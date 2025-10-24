-- ========================================
-- SCRIPT DE INICIALIZACIÓN COMPLETO
-- Auth Service - Basketball Scoreboard
-- ========================================

USE auth_service_db;

-- 1. INSERTAR ROLES INICIALES
-- ========================================
INSERT IGNORE INTO roles (name, description, createdAt, updatedAt) VALUES
('admin', 'Administrador con acceso total al sistema', NOW(), NOW()),
('user', 'Usuario estándar del sistema', NOW(), NOW()),
('moderator', 'Moderador de contenido y partidos', NOW(), NOW()),
('scorer', 'Anotador autorizado para registrar eventos en partidos', NOW(), NOW());

-- Verificar roles creados
SELECT * FROM roles;

-- 2. CREAR USUARIO ADMINISTRADOR
-- ========================================
-- NOTA: La contraseña debe ser hasheada con bcrypt
-- Password: Admin123!
-- Hash bcrypt: $2b$10$rZ5xGJ9KqYJZGqF5xH9pjOXJdKlMnQwPqYv3sZFqYvZqYvZqYvZqY

-- Insertar usuario admin (ajustar hash según tu bcrypt)
INSERT INTO users (
    email, 
    username, 
    password, 
    firstName, 
    lastName, 
    status, 
    createdAt, 
    updatedAt
) VALUES (
    'admin@basketballscoreboard.com',
    'admin',
    -- Password: Admin123! (debes hashear con bcrypt)
    '$2b$10$YourBcryptHashHere',  
    'Admin',
    'User',
    'activo',
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE username=username;

-- 3. ASIGNAR ROL ADMIN AL USUARIO
-- ========================================
-- Asignar todos los roles al usuario admin
INSERT INTO user_roles (userId, roleId)
SELECT u.id, r.id 
FROM users u, roles r
WHERE u.username = 'admin' 
  AND r.name IN ('admin', 'user', 'moderator', 'scorer')
ON DUPLICATE KEY UPDATE userId=userId;

-- 4. VERIFICAR CREACIÓN
-- ========================================
-- Ver usuarios creados
SELECT 
    u.id,
    u.username,
    u.email,
    u.firstName,
    u.lastName,
    u.status,
    GROUP_CONCAT(r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.userId
LEFT JOIN roles r ON ur.roleId = r.id
GROUP BY u.id;

-- 5. USUARIOS DE PRUEBA ADICIONALES
-- ========================================
-- Usuario normal
INSERT INTO users (email, username, password, firstName, lastName, status, createdAt, updatedAt) 
VALUES (
    'user@basketball.com',
    'testuser',
    '$2b$10$YourBcryptHashHere',  -- Password: User123!
    'Test',
    'User',
    'activo',
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE username=username;

-- Asignar rol 'user' al testuser
INSERT INTO user_roles (userId, roleId)
SELECT u.id, r.id 
FROM users u, roles r
WHERE u.username = 'testuser' 
  AND r.name = 'user'
ON DUPLICATE KEY UPDATE userId=userId;

-- Usuario scorer (anotador)
INSERT INTO users (email, username, password, firstName, lastName, status, createdAt, updatedAt) 
VALUES (
    'scorer@basketball.com',
    'scorer',
    '$2b$10$YourBcryptHashHere',  -- Password: Scorer123!
    'John',
    'Scorer',
    'activo',
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE username=username;

-- Asignar rol 'scorer' 
INSERT INTO user_roles (userId, roleId)
SELECT u.id, r.id 
FROM users u, roles r
WHERE u.username = 'scorer' 
  AND r.name IN ('user', 'scorer')
ON DUPLICATE KEY UPDATE userId=userId;

-- ========================================
-- VERIFICACIÓN FINAL
-- ========================================
SELECT 
    '=== ROLES ===' as Info,
    NULL as id,
    NULL as username,
    NULL as email,
    NULL as roles
UNION ALL
SELECT 
    '',
    r.id,
    r.name as username,
    r.description as email,
    NULL as roles
FROM roles r
UNION ALL
SELECT 
    '=== USUARIOS ===' as Info,
    NULL as id,
    NULL as username,
    NULL as email,
    NULL as roles
UNION ALL
SELECT 
    '',
    u.id,
    u.username,
    u.email,
    GROUP_CONCAT(r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.userId
LEFT JOIN roles r ON ur.roleId = r.id
GROUP BY u.id, u.username, u.email;

-- ========================================
-- NOTAS IMPORTANTES
-- ========================================
/*
1. Los passwords deben ser hasheados con bcrypt ANTES de insertarlos
   
2. Para hashear passwords en Node.js (bcrypt):
   const bcrypt = require('bcrypt');
   const hash = await bcrypt.hash('Admin123!', 10);
   console.log(hash);

3. MEJOR OPCIÓN: Usar el endpoint de registro desde la API
   POST http://localhost:5005/api/auth/register
   
4. Una vez creado el usuario, usa el script para asignar rol admin:
   INSERT INTO user_roles (userId, roleId)
   SELECT u.id, r.id FROM users u, roles r
   WHERE u.username = 'admin' AND r.name = 'admin';

5. Credenciales sugeridas después del registro via API:
   - Username: admin
   - Password: Admin123!
   - Email: admin@basketballscoreboard.com

6. Para login:
   POST http://localhost:5005/api/auth/login
   Body: { "username": "admin", "password": "Admin123!" }
*/
