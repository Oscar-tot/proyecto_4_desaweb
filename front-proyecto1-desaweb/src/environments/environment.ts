export const environment = {
    production: false,
    // API Gateway - Punto de entrada único para todos los microservicios
    apiUrl: 'http://localhost:5000/api',
    appName: 'Marcador de Baloncesto - Desarrollo',
    
    // URLs de microservicios (para referencia)
    services: {
        gateway: 'http://localhost:5000/api',
        teams: 'http://localhost:5001/api/equipos',
        players: 'http://localhost:5002/api/jugadores',
        reports: 'http://localhost:5003/api/reports',
        matches: 'http://localhost:5004/api/matches',
        auth: 'http://localhost:5005/api/auth'
    }
};
