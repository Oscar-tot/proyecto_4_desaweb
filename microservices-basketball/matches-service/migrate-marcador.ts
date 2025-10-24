import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'mysqlweb',
  password: process.env.DB_PASSWORD || 'mysql123@',
  database: process.env.DB_DATABASE || 'matches_service_db',
});

async function runMigration() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await dataSource.initialize();
    console.log('✅ Conexión establecida');

    console.log('📝 Ejecutando migración: Agregar columnas de marcador...');
    
    // Verificar columnas existentes
    const existingColumns = await dataSource.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_DATABASE}' 
      AND TABLE_NAME = 'matches'
    `);
    
    const columnNames = existingColumns.map((col: any) => col.COLUMN_NAME);
    
    // Agregar columnas solo si no existen
    const columnsToAdd = [
      { name: 'faltas_local', query: 'ALTER TABLE matches ADD COLUMN faltas_local INT DEFAULT 0' },
      { name: 'faltas_visitante', query: 'ALTER TABLE matches ADD COLUMN faltas_visitante INT DEFAULT 0' },
      { name: 'tiempos_muertos_local', query: 'ALTER TABLE matches ADD COLUMN tiempos_muertos_local INT DEFAULT 0' },
      { name: 'tiempos_muertos_visitante', query: 'ALTER TABLE matches ADD COLUMN tiempos_muertos_visitante INT DEFAULT 0' },
    ];

    for (const column of columnsToAdd) {
      if (columnNames.includes(column.name)) {
        console.log(`ℹ️  Columna ya existe: ${column.name}`);
      } else {
        await dataSource.query(column.query);
        console.log(`✅ Columna agregada: ${column.name}`);
      }
    }

    console.log('\n📊 Estructura actualizada de la tabla matches:');
    const columns = await dataSource.query('DESCRIBE matches');
    console.table(columns);

    console.log('\n✅ Migración completada exitosamente!');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    process.exit(0);
  }
}

runMigration();
