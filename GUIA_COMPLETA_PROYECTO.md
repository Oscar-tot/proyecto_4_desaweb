# Guía Completa - Sistema de Marcador de Baloncesto

> Documentación unificada del proyecto completo con microservicios

---

## Índice

1. [Arquitectura del Sistema](#arquitectura)
2. [Bases de Datos y Credenciales](#bases-de-datos)
3. [Microservicios](#microservicios)
4. [API Gateway](#api-gateway)
5. [Frontend Angular](#frontend)
6. [Comandos Útiles](#comandos)
7. [Pruebas de API](#pruebas)

---

## Arquitectura del Sistema {#arquitectura}

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular 18)                     │
│                   http://localhost:4200                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  API GATEWAY (NestJS)                        │
│                   http://localhost:5000                      │
│  • Rate Limiting  • CORS  • Security  • Proxy                │
└───┬─────────┬─────────┬──────────┬────────────┬─────────────┘
    │         │         │          │            │
    ▼         ▼         ▼          ▼            ▼
┌───────┐ ┌──────┐ ┌────────┐ ┌────────┐ ┌──────────┐
│ Auth  │ │Teams │ │Players │ │Matches │ │ Reports  │
│ :5005 │ │:5001 │ │ :5002  │ │ :5004  │ │  :5003   │
│MySQL  │ │MySql │ │MongoDB │ │ MySQL  │ │ (NestJS) │
└───────┘ └──────┘ └────────┘ └────────┘ └──────────┘
```

**Tecnologías:**
- **Frontend**: Angular 18 (Standalone Components, Signals)
- **Gateway**: NestJS + Express + Throttler
- **Auth**: NestJS + JWT + MySQL
- **Teams**: ASP.NET Core + Entity Framework + MySQL
- **Players**: Python Flask + MongoDB
- **Matches**: NestJS + TypeORM + MySQL
- **Reports**: NestJS + PDFKit

---

## Bases de Datos y Credenciales {#bases-de-datos}

### 1. Auth Service - MySQL

**Base de datos:** `auth_service_db`

**Credenciales:**
```
Host: localhost
Port: 3306
Usuario: OAuth
Contraseña: OAuth1234@
Database: auth_service_db
```

**Conexión:**
```bash
mysql -u OAuth -pOAuth1234@ auth_service_db
```

**Tablas:**
- `users` - Información de usuarios
- `roles` - Roles del sistema (admin, user, moderator, scorer)
- `user_roles` - Relación usuarios-roles (muchos a muchos)
- `refresh_tokens` - Tokens JWT de refresco

**Usuario por defecto:**
```
Username: admin
Password: Admin123!
Email: admin@basketballscoreboard.com
Roles: admin, user
```

**Crear usuario desde API:**
```bash
curl -X POST http://localhost:5005/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "username": "usuario123",
    "password": "Password123!",
    "firstName": "Nombre",
    "lastName": "Apellido"
  }'
```

**Asignar rol admin (MySQL):**
```sql
INSERT INTO user_roles (userId, roleId)
SELECT u.id, r.id 
FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'admin';
```

---

### 2. Teams Service - MySQL

**Base de datos:** `teams_service_db`

**Credenciales:**
```
Host: localhost
Port: 3306
Usuario: teams_user
Contraseña: teams_pass123
Database: teams_service_db
```

**Conexión:**
```bash
mysql -u teams_user -pteams_pass123 teams_service_db
```

**Tabla:**
- `Equipos` - Equipos de baloncesto

**Campos:**
- `Id` (int, PK)
- `Nombre` (string)
- `Ciudad` (string)
- `Logo` (string, URL)
- `Descripcion` (string)
- `FechaCreacion` (datetime)
- `IsActivo` (bool)

---

### 3. Players Service - MongoDB

**Base de datos:** `players_db`

**Credenciales:**
```
Host: localhost
Port: 27017
Usuario: players_user
Contraseña: players_pass123
Database: players_db
```

**Conexión URI:**
```
mongodb://players_user:players_pass123@localhost:27017/players_db?authSource=admin
```

**Conexión CLI:**
```bash
mongosh "mongodb://players_user:players_pass123@localhost:27017/players_db?authSource=admin"
```

**Colección:**
- `players` - Jugadores de baloncesto

**Estructura de documento:**
```javascript
{
  "_id": ObjectId("..."),
  "nombre": "LeBron",
  "apellidos": "James",
  "fechaNacimiento": ISODate("1984-12-30"),
  "edad": 39,
  "posicion": "Alero",
  "numeroCamiseta": 23,
  "altura": 2.06,
  "peso": 113.4,
  "nacionalidad": "Estados Unidos",
  "foto": "url_imagen",
  "equipoId": 1,
  "equipoNombre": "Los Angeles Lakers",
  "activo": true,
  "estadisticas": {
    "partidosJugados": 0,
    "promedioAnotaciones": 0.0,
    "promedioRebotes": 0.0,
    "promedioAsistencias": 0.0
  },
  "createdAt": ISODate("2025-10-23"),
  "updatedAt": ISODate("2025-10-23")
}
```

---

### 4. Matches Service - MySQL

**Base de datos:** `matches_service_db`

**Credenciales:**
```
Host: localhost
Port: 3306
Usuario: matches_user
Contraseña: matches_pass123
Database: matches_service_db
```

**Conexión:**
```bash
mysql -u matches_user -pmatches_pass123 matches_service_db
```

**Tablas:**
- `matches` - Partidos
- `match_events` - Eventos del partido (puntos, faltas, etc.)
- `match_players` - Jugadores en el partido

---

## Microservicios {#microservicios}

### Auth Service (Puerto 5005)

**Tecnología:** NestJS + JWT + MySQL

**Funcionalidad:**
- Autenticación y autorización
- Gestión de usuarios y roles
- Tokens JWT (access + refresh)
- Protección de rutas

**Iniciar:**
```bash
cd "c:\proyecto desarrollo web\microservices-basketball\auth-service"
npm run start:dev
```

**Endpoints principales:**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/refresh` | Renovar token | Sí |
| GET | `/api/auth/profile` | Ver perfil | Sí |
| GET | `/api/users` | Listar usuarios | Admin |
| PUT | `/api/users/:id` | Actualizar usuario | Admin |
| DELETE | `/api/users/:id` | Eliminar usuario | Admin |
| POST | `/api/users/:id/roles` | Asignar rol | Admin |

**Ejemplo de login:**
```bash
curl -X POST http://localhost:5005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }'
```

**Respuesta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@basketballscoreboard.com",
    "roles": ["admin", "user"]
  },
  "expiresIn": "24h"
}
```

---

### Teams Service (Puerto 5001)

**Tecnología:** ASP.NET Core 8 + Entity Framework + MySQL

**Funcionalidad:**
- CRUD de equipos de baloncesto
- Validación de datos
- Soft delete (isActivo)

**Iniciar:**
```bash
cd "c:\proyecto desarrollo web\microservices-basketball\teams-service"
dotnet run
```

**Endpoints:**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/equipos` | Listar equipos | Sí |
| GET | `/api/equipos/:id` | Ver equipo | Sí |
| POST | `/api/equipos` | Crear equipo | Admin |
| PUT | `/api/equipos/:id` | Actualizar equipo | Admin |
| DELETE | `/api/equipos/:id` | Eliminar equipo | Admin |

**Ejemplo - Crear equipo:**
```bash
curl -X POST http://localhost:5001/api/equipos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -d '{
    "nombre": "Los Angeles Lakers",
    "ciudad": "Los Angeles",
    "logo": "https://example.com/lakers.png",
    "descripcion": "Equipo legendario de la NBA"
  }'
```

---

### Players Service (Puerto 5002)

**Tecnología:** Python Flask + MongoDB + Marshmallow

**Funcionalidad:**
- CRUD de jugadores
- Estadísticas de jugadores
- Búsqueda por equipo
- Soft delete (activo)

**Iniciar:**
```bash
cd "c:\proyecto desarrollo web\microservices-basketball\players-service"
python run.py
```

**Endpoints:**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/players` | Listar jugadores | Sí |
| GET | `/api/players/:id` | Ver jugador | Sí |
| GET | `/api/players/team/:teamId` | Jugadores por equipo | Sí |
| POST | `/api/players` | Crear jugador | Admin |
| PUT | `/api/players/:id` | Actualizar jugador | Admin |
| DELETE | `/api/players/:id` | Eliminar jugador (soft) | Admin |
| PUT | `/api/players/:id/stats` | Actualizar estadísticas | Scorer |

**Ejemplo - Crear jugador:**
```bash
curl -X POST http://localhost:5002/api/players \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -d '{
    "nombreCompleto": "LeBron James",
    "numero": 23,
    "posicion": "Alero",
    "estatura": 2.06,
    "edad": 39,
    "nacionalidad": "Estados Unidos",
    "equipoId": 1,
    "equipoNombre": "Los Angeles Lakers"
  }'
```

**Nota:** El campo `isActivo` en frontend se convierte a `activo` en backend automáticamente.

---

### Matches Service (Puerto 5004)

**Tecnología:** NestJS + TypeORM + MySQL

**Funcionalidad:**
- CRUD de partidos
- Gestión de eventos (puntos, faltas)
- Marcador en vivo
- Historial de partidos

**Iniciar:**
```bash
cd "c:\proyecto desarrollo web\microservices-basketball\matches-service"
npm run start:dev
```

**Endpoints:**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/matches` | Listar partidos | Sí |
| GET | `/api/matches/:id` | Ver partido | Sí |
| POST | `/api/matches` | Crear partido | Admin |
| PUT | `/api/matches/:id` | Actualizar partido | Scorer |
| POST | `/api/matches/:id/events` | Agregar evento | Scorer |
| GET | `/api/matches/:id/score` | Ver marcador | Sí |

---

### Reports Service (Puerto 5003)

**Tecnología:** NestJS + PDFKit

**Funcionalidad:**
- Generar reportes PDF
- Estadísticas de equipos
- Estadísticas de jugadores
- Historial de partidos

**Iniciar:**
```bash
cd "c:\proyecto desarrollo web\microservices-basketball\report-service"
npm run start:dev
```

**Endpoints:**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/reports/team/:id` | Reporte de equipo (PDF) | Admin |
| GET | `/api/reports/player/:id` | Reporte de jugador (PDF) | Admin |
| GET | `/api/reports/matches` | Reporte de partidos (PDF) | Admin |

---

## API Gateway (Puerto 5000) {#api-gateway}

**Tecnología:** NestJS + Axios + Throttler

**Funcionalidad:**
- Punto de entrada único
- Proxy a microservicios
- Rate limiting (10 req/min)
- CORS habilitado
- Headers de seguridad (Helmet)
- Logging de requests

**Iniciar:**
```bash
cd "c:\proyecto desarrollo web\microservices-basketball\api-gateway"
npm run start:dev
```

**URL Base:** `http://localhost:5000/api`

### Rutas del Gateway:

| Patrón | Destino | Puerto | Servicio |
|--------|---------|--------|----------|
| `/api/auth/*` | Auth Service | 5005 | Autenticación |
| `/api/users/*` | Auth Service | 5005 | Usuarios |
| `/api/teams/*` | Teams Service | 5001 | Equipos |
| `/api/players/*` | Players Service | 5002 | Jugadores |
| `/api/matches/*` | Matches Service | 5004 | Partidos |
| `/api/reports/*` | Reports Service | 5003 | Reportes |

### Flujo de una Request:

```
Frontend → http://localhost:5000/api/players
    ↓
Gateway (validación, rate limit, logging)
    ↓
Proxy → http://localhost:5002/api/players
    ↓
Players Service (procesa y responde)
    ↓
Gateway (retorna respuesta)
    ↓
Frontend (recibe datos)
```

### Características de Seguridad:

**1. Rate Limiting:**
- 10 requests por minuto por IP
- Previene ataques DDoS

**2. CORS:**
- Permite requests desde http://localhost:4200
- Headers configurados correctamente

**3. Helmet:**
- Headers de seguridad HTTP
- Protección XSS, clickjacking, etc.

**4. Request Logging:**
- ID único por request
- Timestamp de cada operación
- Tiempo de respuesta
- Errores detallados

---

## Frontend Angular {#frontend}

**Puerto:** 4200  
**URL:** http://localhost:4200

**Tecnología:**
- Angular 18
- Standalone Components
- Signals para estado
- Reactive Forms
- SweetAlert2 para alertas
- Font Awesome icons
- Material Icons

**Iniciar:**
```bash
cd "c:\proyecto desarrollo web\front-proyecto1-desaweb"
npm start
```

### Estructura:

```
src/
├── app/
│   ├── components/
│   │   ├── login.component.ts       # Login con visualización de contraseña
│   │   ├── jugadores/               # Gestión de jugadores (con inactivos)
│   │   ├── equipos/                 # Gestión de equipos
│   │   ├── partidos/                # Gestión de partidos
│   │   ├── usuarios/                # Gestión de usuarios
│   │   ├── reportes/                # Reportes y estadísticas
│   │   └── panel-usuario/           # Panel para usuarios normales
│   ├── services/
│   │   ├── auth.service.ts          # Autenticación JWT
│   │   ├── jugador.service.ts       # API de jugadores
│   │   ├── equipo.service.ts        # API de equipos
│   │   ├── partido.service.ts       # API de partidos
│   │   ├── reporte.service.ts       # API de reportes
│   │   └── alert.service.ts         # SweetAlert2 wrapper
│   ├── guards/
│   │   ├── auth.guard.ts            # Protección rutas admin
│   │   └── user.guard.ts            # Protección rutas usuario
│   ├── interceptors/
│   │   └── auth.interceptor.ts      # Inyecta token JWT
│   └── environments/
│       └── environment.ts           # apiUrl: http://localhost:5000/api
└── styles.css                        # Estilos globales + SweetAlert2
```

### Características:

**1. Sistema de Autenticación:**
- Login con JWT
- Refresh token automático
- Guards para proteger rutas
- Interceptor para agregar token

**2. Gestión de Jugadores:**
- CRUD completo
- Vista de activos/inactivos (toggle)
- Reactivación de jugadores eliminados
- Soft delete (isActivo)

**3. Alertas Mejoradas:**
- SweetAlert2 integrado
- Estilos personalizados (~100 líneas)
- Sin animaciones complejas
- Confirmaciones de eliminación

**4. Login Mejorado:**
- Botón para mostrar/ocultar contraseña
- Icono de ojo dinámico
- Validación en tiempo real

---

## Comandos Útiles {#comandos}

### Iniciar Todo el Sistema:

**Terminal 1 - API Gateway:**
```bash
cd "c:\proyecto desarrollo web\microservices-basketball\api-gateway"
npm run start:dev
```

**Terminal 2 - Auth Service:**
```bash
cd "c:\proyecto desarrollo web\microservices-basketball\auth-service"
npm run start:dev
```

**Terminal 3 - Teams Service:**
```bash
cd "c:\proyecto desarrollo web\microservices-basketball\teams-service"
dotnet run
```

**Terminal 4 - Players Service:**
```bash
cd "c:\proyecto desarrollo web\microservices-basketball\players-service"
python run.py
```

**Terminal 5 - Matches Service:**
```bash
cd "c:\proyecto desarrollo web\microservices-basketball\matches-service"
npm run start:dev
```

**Terminal 6 - Reports Service:**
```bash
cd "c:\proyecto desarrollo web\microservices-basketball\report-service"
npm run start:dev
```

**Terminal 7 - Frontend:**
```bash
cd "c:\proyecto desarrollo web\front-proyecto1-desaweb"
npm start
```

### Verificar Servicios:

```bash
# Health check del Gateway (verifica todos los servicios)
curl http://localhost:5000/api/health/services

# Respuesta esperada:
{
  "status": "ok",
  "services": {
    "auth": "online",
    "teams": "online",
    "players": "online",
    "matches": "online",
    "reports": "online"
  }
}
```

### Bases de Datos:

**MySQL - Conectar:**
```bash
# Auth Service
mysql -u OAuth -pOAuth1234@ auth_service_db

# Teams Service
mysql -u teams_user -pteams_pass123 teams_service_db

# Matches Service
mysql -u matches_user -pmatches_pass123 matches_service_db
```

**MongoDB - Conectar:**
```bash
mongosh "mongodb://players_user:players_pass123@localhost:27017/players_db?authSource=admin"
```

**Ver todas las colecciones (MongoDB):**
```javascript
show collections
db.players.find().pretty()
db.players.countDocuments()
```

---

## Pruebas de API {#pruebas}

### 1. Login y Obtener Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }'
```

**Guarda el `accessToken` de la respuesta.**

### 2. Listar Equipos

```bash
curl -X GET http://localhost:5000/api/teams \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### 3. Crear Equipo

```bash
curl -X POST http://localhost:5000/api/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "nombre": "Golden State Warriors",
    "ciudad": "San Francisco",
    "logo": "https://example.com/warriors.png",
    "descripcion": "Campeones de la NBA"
  }'
```

### 4. Listar Jugadores

```bash
curl -X GET http://localhost:5000/api/players \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### 5. Crear Jugador

```bash
curl -X POST http://localhost:5000/api/players \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "nombreCompleto": "Stephen Curry",
    "numero": 30,
    "posicion": "Base",
    "estatura": 1.91,
    "edad": 36,
    "nacionalidad": "Estados Unidos",
    "equipoId": 1,
    "equipoNombre": "Golden State Warriors"
  }'
```

### 6. Actualizar Jugador (Reactivar)

```bash
curl -X PUT http://localhost:5000/api/players/PLAYER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "nombreCompleto": "Stephen Curry",
    "numero": 30,
    "posicion": "Base",
    "estatura": 1.91,
    "edad": 36,
    "nacionalidad": "Estados Unidos",
    "equipoId": 1,
    "isActivo": true
  }'
```

### 7. Listar Usuarios (Admin)

```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer TU_TOKEN_ADMIN"
```

### 8. Crear Partido

```bash
curl -X POST http://localhost:5000/api/matches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "equipoLocalId": 1,
    "equipoVisitanteId": 2,
    "fecha": "2025-10-25T19:00:00Z",
    "lugar": "Staples Center"
  }'
```

### 9. Generar Reporte PDF

```bash
curl -X GET http://localhost:5000/api/reports/team/1 \
  -H "Authorization: Bearer TU_TOKEN_ADMIN" \
  --output reporte_equipo.pdf
```

---

## Notas Importantes

### Compatibilidad de Campos:

El sistema maneja automáticamente las diferencias de nombres entre frontend y backend:

| Frontend (Angular) | Backend (Python/C#) |
|-------------------|---------------------|
| `isActivo` | `activo` |
| `numero` | `numeroCamiseta` |
| `estatura` | `altura` |
| `nombreCompleto` | `nombre + apellidos` |

### Puertos Utilizados:

| Servicio | Puerto | Accesible desde |
|----------|--------|-----------------|
| Frontend | 4200 | Navegador |
| API Gateway | 5000 | Frontend |
| Teams | 5001 | Gateway |
| Players | 5002 | Gateway |
| Reports | 5003 | Gateway |
| Matches | 5004 | Gateway |
| Auth | 5005 | Gateway |
| MySQL | 3306 | Localhost |
| MongoDB | 27017 | Localhost |

### Seguridad:

- Todos los endpoints (excepto login/register) requieren token JWT
- Roles: `admin`, `user`, `moderator`, `scorer`
- Los tokens expiran en 24 horas
- Rate limit: 10 requests/minuto por IP

### Soft Delete:

Los siguientes recursos usan soft delete (no se eliminan físicamente):
- Equipos (`isActivo = false`)
- Jugadores (`activo = false`)
- Usuarios (`status = 'inactivo'`)

---

## Solución de Problemas Comunes

### Error: "ECONNREFUSED"

**Causa:** Un microservicio no está corriendo.

**Solución:**
```bash
# Verifica qué servicios están activos
curl http://localhost:5000/api/health/services

# Inicia el servicio que falta (ejemplo: players)
cd "c:\proyecto desarrollo web\microservices-basketball\players-service"
python run.py
```

### Error: "Access denied for user"

**Causa:** Credenciales de base de datos incorrectas.

**Solución:** Verifica las credenciales en los archivos de configuración:
- Auth: `auth-service/.env`
- Teams: `teams-service/appsettings.json`
- Players: `players-service/app/config.py`
- Matches: `matches-service/.env`

### Error: "Token expired"

**Causa:** El token JWT expiró (24 horas).

**Solución:** Haz login nuevamente para obtener un nuevo token.

### Error: "Rate limit exceeded"

**Causa:** Más de 10 requests por minuto desde tu IP.

**Solución:** Espera 1 minuto antes de hacer más requests.

---

## Changelog

### Últimas Mejoras:

- **Login:** Agregado botón para mostrar/ocultar contraseña
- **Jugadores:** Sistema de jugadores inactivos con reactivación
- **Alertas:** SweetAlert2 simplificado y optimizado
- **API Gateway:** Logging mejorado con Request ID y tiempos
- **Players Service:** Soporte para campos `isActivo` y `activo`
- **Código:** Eliminados emojis de archivos de código (solo en .md para docs)

---

**Versión:** 1.0  
**Fecha:** Octubre 2025  
**Autor:** Oscar tot  
**Proyecto:** Sistema de Marcador de Baloncesto con Microservicios
