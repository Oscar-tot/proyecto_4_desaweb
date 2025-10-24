// MongoDB initialization script
db = db.getSiblingDB('players_service_db');

// Crear colección de jugadores
db.createCollection('players');

// Crear índices
db.players.createIndex({ "equipoId": 1 });
db.players.createIndex({ "numero": 1, "equipoId": 1 }, { unique: true });
db.players.createIndex({ "nombreCompleto": "text" });

print("MongoDB inicializado para players-service");
