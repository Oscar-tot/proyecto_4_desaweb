export const environment = {
    production: true,
    // API Gateway - Punto de entrada único para todos los microservicios
    apiUrl: 'https://tu-dominio.com/api', // Cambiar por tu dominio en producción
    appName: 'Marcador de Baloncesto - Producción',
    
    // URLs de microservicios en producción
    services: {
        gateway: 'https://tu-dominio.com/api',
        teams: 'https://teams.tu-dominio.com/api/equipos',
        players: 'https://players.tu-dominio.com/api/jugadores',
        reports: 'https://reports.tu-dominio.com/api/reports',
        matches: 'https://matches.tu-dominio.com/api/matches',
        auth: 'https://auth.tu-dominio.com/api/auth'
    }
};
