-- Script de inicialización de la base de datos BasketballDB

USE master;
GO

-- Crear la base de datos si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'BasketballDB')
BEGIN
    CREATE DATABASE BasketballDB;
    PRINT 'Base de datos BasketballDB creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La base de datos BasketballDB ya existe.';
END
GO

USE BasketballDB;
GO

-- Crear tabla de Partidos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Partidos' AND xtype='U')
BEGIN
    CREATE TABLE Partidos (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        EquipoLocal NVARCHAR(100) NOT NULL,
        EquipoVisitante NVARCHAR(100) NOT NULL,
        PuntuacionLocal INT DEFAULT 0,
        PuntuacionVisitante INT DEFAULT 0,
        Periodo INT DEFAULT 1,
        TiempoRestante INT DEFAULT 600, -- 10 minutos en segundos
        FaltasLocal INT DEFAULT 0,
        FaltasVisitante INT DEFAULT 0,
        TiemposMuertosLocal INT DEFAULT 7,
        TiemposMuertosVisitante INT DEFAULT 7,
        Estado NVARCHAR(20) DEFAULT 'EN_CURSO',
        FechaCreacion DATETIME2 DEFAULT GETDATE(),
        FechaFinalizacion DATETIME2 NULL
    );
    PRINT 'Tabla Partidos creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Partidos ya existe.';
END
GO

-- Crear índices para mejor rendimiento
CREATE INDEX IX_Partidos_Estado ON Partidos(Estado);
CREATE INDEX IX_Partidos_FechaCreacion ON Partidos(FechaCreacion DESC);
GO

PRINT 'Inicialización de la base de datos completada.';
