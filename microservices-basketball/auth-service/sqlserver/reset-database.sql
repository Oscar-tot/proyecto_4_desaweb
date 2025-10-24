-- ============================================
-- SCRIPT COMPLETO DE REINICIO DE BASE DE DATOS
-- Auth Service - Basketball Scoreboard
-- ============================================

-- 1. ELIMINAR BASE DE DATOS SI EXISTE Y RECREARLA
DROP DATABASE IF EXISTS auth_service_db;
CREATE DATABASE auth_service_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE auth_service_db;

-- ============================================
-- 2. CREAR TABLA DE ROLES
-- ============================================
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name ENUM('admin', 'user', 'moderator', 'scorer') NOT NULL UNIQUE,
  description VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_role_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. CREAR TABLA DE USUARIOS
-- ============================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  status ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
  isEmailVerified TINYINT(1) DEFAULT 0,
  lastLogin DATETIME NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_email (email),
  INDEX idx_user_username (username),
  INDEX idx_user_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. CREAR TABLA DE RELACIÓN USUARIOS-ROLES
-- ============================================
CREATE TABLE user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  INDEX idx_user_roles_user (user_id),
  INDEX idx_user_roles_role (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. CREAR TABLA DE REFRESH TOKENS
-- ============================================
CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(500) NOT NULL UNIQUE,
  userId INT NOT NULL,
  expiresAt DATETIME NOT NULL,
  userAgent VARCHAR(255),
  ipAddress VARCHAR(45),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_refresh_token (token),
  INDEX idx_refresh_user (userId),
  INDEX idx_refresh_expires (expiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. INSERTAR ROLES PREDEFINIDOS
-- ============================================
INSERT INTO roles (name, description, createdAt) VALUES
('admin', 'Administrador con acceso total al sistema', NOW()),
('user', 'Usuario estándar del sistema', NOW()),
('moderator', 'Moderador de contenido y partidos', NOW()),
('scorer', 'Anotador autorizado para registrar eventos en partidos', NOW());

-- ============================================
-- 7. VERIFICAR CREACIÓN DE TABLAS
-- ============================================
SHOW TABLES;

-- ============================================
-- 8. VERIFICAR ROLES INSERTADOS
-- ============================================
SELECT * FROM roles;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
