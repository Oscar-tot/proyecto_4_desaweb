// Script de inicialización de MongoDB para players-service
// Este script crea el usuario y la base de datos

print('🏀 Inicializando base de datos players_service_db...');

// Conectar a la base de datos admin para crear el usuario
db = db.getSiblingDB('admin');

// Crear usuario para players-service
try {
    db.createUser({
        user: 'player_user',
        pwd: 'player123',
        roles: [
            {
                role: 'readWrite',
                db: 'players_service_db'
            }
        ]
    });
    print('✅ Usuario player_user creado exitosamente');
} catch (e) {
    if (e.code === 51003) {
        print('⚠️  Usuario player_user ya existe');
    } else {
        print('❌ Error creando usuario:', e);
    }
}

// Cambiar a la base de datos del servicio
db = db.getSiblingDB('players_service_db');

// Crear colecciones
db.createCollection('players');
print('✅ Colección players creada');

// Crear índices
db.players.createIndex({ 'equipoId': 1, 'numeroCamiseta': 1 }, { unique: true, name: 'idx_equipo_numero' });
db.players.createIndex({ 'equipoId': 1 }, { name: 'idx_equipo' });
db.players.createIndex({ 'nombre': 1, 'apellidos': 1 }, { name: 'idx_nombre_completo' });
db.players.createIndex({ 'activo': 1 }, { name: 'idx_activo' });
print('✅ Índices creados');

// Insertar datos de ejemplo
db.players.insertMany([
    {
        nombre: 'LeBron',
        apellidos: 'James',
        fechaNacimiento: new Date('1984-12-30'),
        posicion: 'Alero',
        numeroCamiseta: 23,
        altura: 2.06,
        peso: 113.4,
        equipoId: 1,
        equipoNombre: 'Los Angeles Lakers',
        estadisticas: {
            partidosJugados: 82,
            promedioMinutos: 35.2,
            promedioAnotaciones: 27.1,
            promedioRebotes: 7.5,
            promedioAsistencias: 7.4,
            promedioRobos: 1.6,
            promedioBloqueos: 0.6,
            porcentajeTirosCampo: 50.4,
            porcentajeTiros3Puntos: 35.9,
            porcentajeTirosLibres: 73.5
        },
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        nombre: 'Stephen',
        apellidos: 'Curry',
        fechaNacimiento: new Date('1988-03-14'),
        posicion: 'Base',
        numeroCamiseta: 30,
        altura: 1.91,
        peso: 84.8,
        equipoId: 2,
        equipoNombre: 'Golden State Warriors',
        estadisticas: {
            partidosJugados: 82,
            promedioMinutos: 34.7,
            promedioAnotaciones: 29.4,
            promedioRebotes: 5.1,
            promedioAsistencias: 6.1,
            promedioRobos: 1.2,
            promedioBloqueos: 0.4,
            porcentajeTirosCampo: 48.2,
            porcentajeTiros3Puntos: 42.8,
            porcentajeTirosLibres: 91.6
        },
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        nombre: 'Kevin',
        apellidos: 'Durant',
        fechaNacimiento: new Date('1988-09-29'),
        posicion: 'Alero',
        numeroCamiseta: 7,
        altura: 2.08,
        peso: 108.9,
        equipoId: 3,
        equipoNombre: 'Phoenix Suns',
        estadisticas: {
            partidosJugados: 75,
            promedioMinutos: 36.9,
            promedioAnotaciones: 28.2,
            promedioRebotes: 6.7,
            promedioAsistencias: 5.0,
            promedioRobos: 0.9,
            promedioBloqueos: 1.1,
            porcentajeTirosCampo: 52.6,
            porcentajeTiros3Puntos: 38.4,
            porcentajeTirosLibres: 88.9
        },
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        nombre: 'Giannis',
        apellidos: 'Antetokounmpo',
        fechaNacimiento: new Date('1994-12-06'),
        posicion: 'Ala-Pívot',
        numeroCamiseta: 34,
        altura: 2.11,
        peso: 109.8,
        equipoId: 4,
        equipoNombre: 'Milwaukee Bucks',
        estadisticas: {
            partidosJugados: 67,
            promedioMinutos: 33.1,
            promedioAnotaciones: 31.1,
            promedioRebotes: 11.8,
            promedioAsistencias: 5.7,
            promedioRobos: 1.2,
            promedioBloqueos: 1.4,
            porcentajeTirosCampo: 55.3,
            porcentajeTiros3Puntos: 27.5,
            porcentajeTirosLibres: 71.3
        },
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        nombre: 'Luka',
        apellidos: 'Dončić',
        fechaNacimiento: new Date('1999-02-28'),
        posicion: 'Base',
        numeroCamiseta: 77,
        altura: 2.01,
        peso: 104.3,
        equipoId: 5,
        equipoNombre: 'Dallas Mavericks',
        estadisticas: {
            partidosJugados: 66,
            promedioMinutos: 36.2,
            promedioAnotaciones: 28.4,
            promedioRebotes: 9.1,
            promedioAsistencias: 8.7,
            promedioRobos: 1.4,
            promedioBloqueos: 0.5,
            porcentajeTirosCampo: 47.3,
            porcentajeTiros3Puntos: 35.3,
            porcentajeTirosLibres: 74.2
        },
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
]);

print('✅ Datos de ejemplo insertados');

// Contar documentos
const count = db.players.countDocuments();
print(`📊 Total de jugadores: ${count}`);

print('✅ Base de datos players_service_db inicializada correctamente');
