 Sistema de Marcador de Baloncesto

> Documentación del desarrollo Sistema de Marcador de Baloncesto

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
- **Gateway**: NestJS + Express + Throttler + OAuth Proxy
- **Auth**: NestJS + JWT + OAuth 2.0 (Google, Facebook, GitHub) + MySQL
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

**Estructura de tabla users (con OAuth):**
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NULL,              -- Nullable para usuarios OAuth
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  provider VARCHAR(50) DEFAULT 'local',     -- 'local', 'google', 'facebook', 'github'
  providerId VARCHAR(255),                  -- ID del usuario en el proveedor OAuth
  profilePicture TEXT,                      -- URL de la foto de perfil
  isEmailVerified BOOLEAN DEFAULT FALSE,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  lastLogin DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_provider_providerId (provider, providerId)
);
```

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
-- Ver usuarios y sus roles actuales
SELECT u.id, u.username, u.email, u.provider, r.name as role_name 
FROM users u 
LEFT JOIN user_roles ur ON u.id = ur.userId 
LEFT JOIN roles r ON ur.roleId = r.id 
WHERE u.email = 'usuario@ejemplo.com';

-- Asignar rol admin a un usuario (por email)
INSERT INTO user_roles (userId, roleId)
SELECT u.id, r.id 
FROM users u, roles r
WHERE u.email = 'usuario@ejemplo.com' AND r.name = 'admin';

-- Asignar rol admin a usuario OAuth (por username)
INSERT INTO user_roles (userId, roleId)
VALUES ((SELECT id FROM users WHERE username = 'oscartot444'), 
        (SELECT id FROM roles WHERE name = 'admin'));
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
| GET | `/api/auth/me` | Ver perfil | Sí |
| POST | `/api/auth/change-password` | Cambiar contraseña | Sí |
| POST | `/api/auth/logout` | Cerrar sesión | Sí |
| **OAuth 2.0** | | | |
| GET | `/api/auth/google` | Login con Google | No |
| GET | `/api/auth/google/callback` | Callback de Google | No |
| GET | `/api/auth/facebook` | Login con Facebook | No |
| GET | `/api/auth/facebook/callback` | Callback de Facebook | No |
| GET | `/api/auth/github` | Login con GitHub | No |
| GET | `/api/auth/github/callback` | Callback de GitHub | No |
| **Gestión de Usuarios** | | | |
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

**Login con OAuth 2.0 (Google/Facebook/GitHub):**

El sistema soporta autenticación OAuth 2.0 con tres proveedores:

**1. Login con GitHub:**
- Frontend: Usuario hace clic en "Continuar con GitHub"
- Browser redirige a: `http://localhost:5000/api/auth/github`
- API Gateway proxy a: `http://localhost:5005/api/auth/github`
- Auth Service redirige a GitHub para autorización
- Usuario autoriza en GitHub
- GitHub redirige a: `http://localhost:5000/api/auth/github/callback?code=xxx`
- Auth Service procesa el código y crea/actualiza usuario
- Redirige al frontend: `http://localhost:4200/auth/oauth-callback?token=...&refreshToken=...`
- Frontend guarda tokens y redirige al dashboard según rol

**2. Login con Google:**
```
URL de inicio: http://localhost:5000/api/auth/google
Callback URL: http://localhost:5000/api/auth/google/callback
```

**3. Login con Facebook:**
```
URL de inicio: http://localhost:5000/api/auth/facebook
Callback URL: http://localhost:5000/api/auth/facebook/callback
```

**Configuración OAuth:**

Variables de entorno en `auth-service/.env.development`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=tu_facebook_app_id
FACEBOOK_APP_SECRET=tu_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback

# GitHub OAuth
GITHUB_CLIENT_ID=tu_github_client_id
GITHUB_CLIENT_SECRET=tu_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

**Tabla de usuarios con OAuth:**

Campos adicionales en la tabla `users`:
- `provider` (string): 'local', 'google', 'facebook', 'github'
- `providerId` (string): ID del usuario en el proveedor OAuth
- `profilePicture` (string): URL de la foto de perfil
- `password` (string, nullable): NULL para usuarios OAuth

**Asignación de roles en OAuth:**
- Por defecto, todos los usuarios OAuth obtienen el rol `user`
- Un administrador puede promover usuarios a `admin` desde la base de datos
- Los usuarios OAuth pueden tener contraseña local si se registran también con email/password
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
│   │   ├── login.component.ts       # Login tradicional + OAuth buttons
│   │   ├── oauth-callback.component.ts  # Procesa redirección OAuth
│   │   ├── jugadores/               # Gestión de jugadores (con inactivos)
│   │   ├── equipos/                 # Gestión de equipos
│   │   ├── partidos/                # Gestión de partidos
│   │   ├── usuarios/                # Gestión de usuarios
│   │   ├── reportes/                # Reportes y estadísticas
│   │   └── panel-usuario/           # Panel para usuarios normales
│   ├── services/
│   │   ├── auth.service.ts          # Autenticación JWT + OAuth
│   │   ├── jugador.service.ts       # API de jugadores
│   │   ├── equipo.service.ts        # API de equipos
│   │   ├── partido.service.ts       # API de partidos
│   │   ├── reporte.service.ts       # API de reportes
│   │   └── alert.service.ts         # SweetAlert2 wrapper
│   ├── guards/
│   │   ├── auth.guard.ts            # Protección rutas autenticadas
│   │   ├── admin.guard.ts           # Protección rutas admin
│   │   └── user.guard.ts            # Protección rutas usuario
│   ├── interceptors/
│   │   └── auth.interceptor.ts      # Inyecta token JWT
│   └── environments/
│       └── environment.ts           # apiUrl: http://localhost:5000/api
└── styles.css                        # Estilos globales + SweetAlert2
```

### Características:

**1. Sistema de Autenticación:**
- Login tradicional con JWT
- **Login con OAuth 2.0** (Google, Facebook, GitHub)
- Refresh token automático
- Guards para proteger rutas
- Interceptor para agregar token
- Componente oauth-callback para procesar respuestas OAuth

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

## Autenticación OAuth 2.0 {#oauth}

### Descripción General

El sistema implementa autenticación OAuth 2.0 con tres proveedores sociales:
- ✅ **Google** - Google OAuth 2.0
- ✅ **Facebook** - Facebook Login
- ✅ **GitHub** - GitHub OAuth Apps

### Arquitectura OAuth

```
┌──────────────┐
│   Usuario    │
└──────┬───────┘
       │ 1. Click "Login con GitHub"
       ▼
┌──────────────┐
│   Frontend   │ http://localhost:4200/login
└──────┬───────┘
       │ 2. window.location = /api/auth/github
       ▼
┌──────────────┐
│ API Gateway  │ http://localhost:5000
└──────┬───────┘
       │ 3. Proxy transparente (preserva redirecciones)
       ▼
┌──────────────┐
│ Auth Service │ http://localhost:5005
└──────┬───────┘
       │ 4. Passport GitHub Strategy
       │    Redirige a GitHub.com
       ▼
┌──────────────┐
│  GitHub.com  │
└──────┬───────┘
       │ 5. Usuario autoriza
       │ 6. Callback con code
       ▼
┌──────────────┐
│ API Gateway  │ /api/auth/github/callback?code=xxx
└──────┬───────┘
       │ 7. Proxy al Auth Service
       ▼
┌──────────────┐
│ Auth Service │
│              │ 8. Exchange code por access_token
│              │ 9. Obtiene perfil del usuario
│              │ 10. Busca/Crea usuario en DB
│              │ 11. Genera JWT tokens
└──────┬───────┘
       │ 12. Redirect al frontend con tokens
       ▼
┌──────────────┐
│   Frontend   │ /auth/oauth-callback?token=xxx&refreshToken=yyy
│              │ 13. Guarda tokens en storage
│              │ 14. Actualiza estado de autenticación
│              │ 15. Redirige al dashboard según rol
└──────────────┘
```

### Configuración de Proveedores OAuth

#### 1. Google OAuth

**Paso 1: Crear OAuth Client en Google Cloud Console**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a "APIs & Services" > "Credentials"
4. Haz clic en "Create Credentials" > "OAuth client ID"
5. Configura la pantalla de consentimiento OAuth
6. Selecciona "Web application" como tipo
7. Agrega URIs de redirección autorizadas:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
8. Copia el `Client ID` y `Client Secret`

**Paso 2: Configurar en el proyecto**

Edita `auth-service/.env.development`:
```bash
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

---

#### 2. Facebook OAuth

**Paso 1: Crear App en Facebook Developers**

1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Haz clic en "My Apps" > "Create App"
3. Selecciona "Consumer" como tipo de app
4. Completa el formulario de creación
5. Ve a "Settings" > "Basic"
6. Copia el `App ID` y `App Secret`
7. Agrega "Facebook Login" en Products
8. Ve a "Facebook Login" > "Settings"
9. Agrega Valid OAuth Redirect URIs:
   ```
   http://localhost:5000/api/auth/facebook/callback
   ```

**Paso 2: Configurar en el proyecto**

Edita `auth-service/.env.development`:
```bash
FACEBOOK_APP_ID=tu_facebook_app_id_aqui
FACEBOOK_APP_SECRET=tu_facebook_app_secret_aqui
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback
```

---

#### 3. GitHub OAuth

**Paso 1: Crear OAuth App en GitHub**

1. Ve a [GitHub Settings](https://github.com/settings/developers)
2. Haz clic en "OAuth Apps" > "New OAuth App"
3. Completa el formulario:
   - **Application name:** Basketball Scoreboard
   - **Homepage URL:** `http://localhost:4200`
   - **Authorization callback URL:** `http://localhost:5000/api/auth/github/callback`
4. Haz clic en "Register application"
5. Copia el `Client ID`
6. Genera un nuevo `Client Secret` y cópialo

**Paso 2: Configurar en el proyecto**

Edita `auth-service/.env.development`:
```bash
GITHUB_CLIENT_ID=tu_github_client_id_aqui
GITHUB_CLIENT_SECRET=tu_github_client_secret_aqui
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

---

### Implementación Técnica

#### Backend (Auth Service)

**Estrategias Passport.js:**

```typescript
// auth-service/src/auth/strategies/github.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { id, displayName, emails, photos } = profile;
    const user = {
      provider: 'github',
      providerId: id,
      email: emails[0].value,
      firstName: displayName.split(' ')[0],
      lastName: displayName.split(' ').slice(1).join(' '),
      profilePicture: photos[0].value,
      accessToken,
    };
    return user;
  }
}
```

**Controlador OAuth:**

```typescript
// auth-service/src/auth/auth.controller.ts

@Get('github')
@UseGuards(AuthGuard('github'))
async githubAuth() {
  // Guard redirige a GitHub
}

@Get('github/callback')
@UseGuards(AuthGuard('github'))
async githubAuthCallback(@Req() req, @Res() res: Response) {
  const result = await this.authService.validateOAuthLogin(req.user);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
  const redirectUrl = `${frontendUrl}/auth/oauth-callback?token=${result.accessToken}&refreshToken=${result.refreshToken}`;
  return res.redirect(redirectUrl);
}
```

**Servicio de validación OAuth:**

```typescript
// auth-service/src/auth/auth.service.ts

async validateOAuthLogin(oauthUser: {
  provider: string;
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}) {
  // Buscar usuario por provider y providerId
  let user = await this.userRepository.findOne({
    where: { provider: oauthUser.provider, providerId: oauthUser.providerId },
    relations: ['roles'],
  });

  if (!user) {
    // Buscar por email (vincular con cuenta existente)
    user = await this.userRepository.findOne({
      where: { email: oauthUser.email },
      relations: ['roles'],
    });

    if (user) {
      // Actualizar con datos OAuth
      user.provider = oauthUser.provider;
      user.providerId = oauthUser.providerId;
      user.profilePicture = oauthUser.profilePicture;
      await this.userRepository.save(user);
    } else {
      // Crear nuevo usuario con rol 'user' por defecto
      const userRole = await this.roleRepository.findOne({
        where: { name: RoleType.USER },
      });

      user = this.userRepository.create({
        email: oauthUser.email,
        username: this.generateUsername(oauthUser.email),
        firstName: oauthUser.firstName,
        lastName: oauthUser.lastName,
        provider: oauthUser.provider,
        providerId: oauthUser.providerId,
        profilePicture: oauthUser.profilePicture,
        password: null, // OAuth users no tienen password
        isEmailVerified: true,
        roles: [userRole],
        status: UserStatus.ACTIVE,
      });

      await this.userRepository.save(user);
    }
  }

  // Generar tokens JWT
  return this.generateTokens(user);
}
```

#### Frontend (Angular)

**Componente de Login:**

```typescript
// src/app/components/login.component.ts

loginWithGoogle() {
  window.location.href = 'http://localhost:5000/api/auth/google';
}

loginWithFacebook() {
  window.location.href = 'http://localhost:5000/api/auth/facebook';
}

loginWithGithub() {
  window.location.href = 'http://localhost:5000/api/auth/github';
}
```

**Componente OAuth Callback:**

```typescript
// src/app/components/oauth-callback.component.ts

@Component({
  selector: 'app-oauth-callback',
  template: `<div>Completando inicio de sesión...</div>`
})
export class OauthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const refreshToken = params['refreshToken'];

      if (token && refreshToken) {
        // Guardar tokens
        sessionStorage.setItem('basketball_token', token);
        sessionStorage.setItem('basketball_refresh_token', refreshToken);
        localStorage.setItem('basketball_token', token);
        localStorage.setItem('basketball_refresh_token', refreshToken);

        // Decodificar JWT
        const payload = JSON.parse(atob(token.split('.')[1]));
        const usuario = {
          id: payload.sub,
          username: payload.username,
          email: payload.email,
          roles: payload.roles || []
        };

        // Actualizar estado
        this.authService.isAuthenticated.set(true);
        this.authService.currentUser.set(usuario);

        // Redirigir según rol
        setTimeout(() => {
          if (usuario.roles.includes('admin')) {
            this.router.navigate(['/jugadores']);
          } else {
            this.router.navigate(['/panel-usuario']);
          }
        }, 1000);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
```

**Ruta OAuth Callback:**

```typescript
// src/app/app.routes.ts

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'auth/oauth-callback', component: OauthCallbackComponent },
  // ... otras rutas
];
```

#### API Gateway (Proxy OAuth)

**Controlador con proxy transparente:**

```typescript
// api-gateway/src/proxy/auth-proxy.controller.ts

@Get('auth/github')
async githubAuth(@Req() req: Request, @Res() res: Response) {
  const serviceUrl = this.configService.get('AUTH_SERVICE_URL');
  const response = await axios.get(`${serviceUrl}/api/auth/github`, {
    maxRedirects: 0, // No seguir redirecciones automáticamente
    validateStatus: (status) => status >= 200 && status < 400,
  });
  
  if (response.status >= 300 && response.status < 400) {
    const redirectUrl = response.headers.location;
    return res.redirect(redirectUrl); // Redirigir al navegador
  }
}

@Get('auth/github/callback')
async githubCallback(@Req() req: Request, @Res() res: Response) {
  const serviceUrl = this.configService.get('AUTH_SERVICE_URL');
  const queryString = new URLSearchParams(req.query as any).toString();
  const response = await axios.get(
    `${serviceUrl}/api/auth/github/callback?${queryString}`,
    { maxRedirects: 0, validateStatus: (status) => status >= 200 && status < 400 }
  );
  
  if (response.status >= 300 && response.status < 400) {
    return res.redirect(response.headers.location);
  }
}
```

---

### Gestión de Usuarios OAuth

#### Asignación de Roles

**Por defecto:** Todos los usuarios OAuth reciben el rol `user`

**Promover a admin (SQL):**

```sql
-- Ver usuario OAuth y sus roles
SELECT u.id, u.username, u.email, u.provider, u.providerId, 
       GROUP_CONCAT(r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.userId
LEFT JOIN roles r ON ur.roleId = r.id
WHERE u.provider != 'local'
GROUP BY u.id;

-- Asignar rol admin
INSERT INTO user_roles (userId, roleId)
VALUES (
  (SELECT id FROM users WHERE email = 'usuario@gmail.com'),
  (SELECT id FROM roles WHERE name = 'admin')
);
```

#### Vinculación de Cuentas

Si un usuario:
1. Se registra con email/password → tiene `provider='local'`
2. Luego hace login con GitHub usando el mismo email → se actualiza a `provider='github'`
3. Mantiene sus roles originales
4. Puede alternar entre ambos métodos de login

---

### Seguridad OAuth

#### Validaciones Implementadas

1. **Verificación de Email:** Los proveedores OAuth verifican el email
2. **HTTPS en Producción:** Callback URLs deben usar HTTPS
3. **State Parameter:** Previene CSRF (manejado por Passport)
4. **Tokens Seguros:** JWT con expiración y refresh tokens
5. **Secrets Protegidos:** Variables de entorno nunca en git

#### Mejores Prácticas

- ✅ Callback URLs exactas (no wildcards)
- ✅ Scopes mínimos necesarios (user:email)
- ✅ Validación de email del proveedor
- ✅ Generación de username único
- ✅ Profile picture opcional
- ✅ Manejo de errores robusto

---

### Troubleshooting OAuth

#### Error: "Redirect URI mismatch"

**Causa:** La URL de callback configurada en el proveedor no coincide con la del código.

**Solución:**
```
Proveedor OAuth: http://localhost:5000/api/auth/github/callback
.env GITHUB_CALLBACK_URL: http://localhost:5000/api/auth/github/callback
```
Deben ser **exactamente iguales**.

---

#### Error: "Invalid client"

**Causa:** Client ID o Client Secret incorrectos.

**Solución:** Verifica las credenciales en `.env.development`:
```bash
# Revisar credenciales
cat auth-service/.env.development | grep GITHUB
```

---

#### Error: "User redirected to login after OAuth"

**Causa:** El componente oauth-callback no se está ejecutando o hay error en el procesamiento de tokens.

**Solución:**
1. Verifica que la ruta `/auth/oauth-callback` esté registrada
2. Abre DevTools Console y busca errores
3. Verifica que los query params `token` y `refreshToken` estén presentes en la URL

---

### Ejemplo Completo de Flujo OAuth (GitHub)

**1. Usuario hace clic en "Continuar con GitHub"**
```
URL: http://localhost:4200/login
Action: window.location.href = 'http://localhost:5000/api/auth/github'
```

**2. API Gateway redirige**
```
Request: GET http://localhost:5000/api/auth/github
Proxy to: http://localhost:5005/api/auth/github
Response: 302 Redirect to GitHub.com
```

**3. GitHub autoriza**
```
URL: https://github.com/login/oauth/authorize?client_id=xxx&redirect_uri=...
User: Click "Authorize Basketball Scoreboard"
```

**4. GitHub callback**
```
Redirect to: http://localhost:5000/api/auth/github/callback?code=abc123
```

**5. Auth Service procesa**
```
Exchange code for access_token
GET https://api.github.com/user (with token)
Response: { id: "12345", login: "oscartot", email: "oscar@example.com", ... }
```

**6. Crear/Actualizar usuario**
```sql
INSERT INTO users (username, email, provider, providerId, ...)
VALUES ('oscartot', 'oscar@example.com', 'github', '12345', ...)
ON DUPLICATE KEY UPDATE ...
```

**7. Generar JWT tokens**
```javascript
{
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  expiresIn: "24h"
}
```

**8. Redirigir al frontend**
```
302 Redirect to:
http://localhost:4200/auth/oauth-callback?token=xxx&refreshToken=yyy
```

**9. Frontend procesa y guarda**
```javascript
sessionStorage.setItem('basketball_token', token);
sessionStorage.setItem('basketball_refresh_token', refreshToken);
authService.isAuthenticated.set(true);
```

**10. Redirigir al dashboard**
```
router.navigate(['/panel-usuario']); // o /jugadores si es admin
```

---

## Changelog

### Últimas Mejoras:

- **OAuth 2.0:** Implementación completa de Google, Facebook y GitHub
- **API Gateway:** Proxy transparente para redirecciones OAuth
- **Base de Datos:** Campos adicionales para OAuth (provider, providerId, profilePicture)
- **Frontend:** Botones OAuth en login y componente oauth-callback
- **Seguridad:** Validación de tokens OAuth y asignación de roles
- **Login:** Agregado botón para mostrar/ocultar contraseña
- **Jugadores:** Sistema de jugadores inactivos con reactivación
- **Alertas:** SweetAlert2 simplificado y optimizado
- **API Gateway:** Logging mejorado con Request ID y tiempos
- **Players Service:** Soporte para campos `isActivo` y `activo`
- **Código:** Eliminados emojis de archivos de código (solo en .md para docs)

---



