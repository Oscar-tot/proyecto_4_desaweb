-- Agregar columnas de faltas y tiempos muertos a la tabla matches
USE matches_service_db;

-- Verificar si las columnas no existen antes de agregarlas
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS faltas_local INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS faltas_visitante INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS tiempos_muertos_local INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS tiempos_muertos_visitante INT DEFAULT 0;

-- Verificar la estructura actualizada
DESCRIBE matches;
