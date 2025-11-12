# Arquitectura del Sistema - Basketball Scoreboard

## 📐 Patrón Arquitectónico

El sistema implementa una **Arquitectura de Microservicios** con las siguientes características:

### Características Principales
- ✅ Desacoplamiento de servicios
- ✅ Escalabilidad independiente
- ✅ Tecnologías heterogéneas (Polyglot)
- ✅ Base de datos por servicio (Database per Service)
- ✅ API Gateway como punto de entrada único
- ✅ Comunicación HTTP/REST

---

## 🏗️ Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                     │
│                  http://localhost:4200                   │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/REST
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (Angular 18)                  │
│  - Componentes standalone                               │
│  - Signals para estado reactivo                         │
│  - Guards de autenticación                              │
│  - Interceptores HTTP                                   │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/REST
                        ▼
┌─────────────────────────────────────────────────────────┐
│              API GATEWAY (NestJS - Port 5000)           │
│  - Proxy HTTP con http-proxy-middleware                │
│  - Rate limiting (Throttler)                            │
│  - Logging centralizado                                 │
│  - Health checks de servicios                           │
│  - Manejo de redirecciones OAuth                        │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┬─────────────┬──────────┐
        │               │               │             │          │
        ▼               ▼               ▼             ▼          ▼
┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Auth Service │ │Teams Service │ │ Players  │ │ Matches  │ │ Reports  │
│  (NestJS)    │ │(.NET Core 8) │ │ (Flask)  │ │ (NestJS) │ │ (NestJS) │
│  Port 5005   │ │  Port 5001   │ │Port 5002 │ │Port 5004 │ │Port 5003 │
└──────┬───────┘ └──────┬───────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
       │                │               │            │            │
       ▼                ▼               ▼            ▼            ▼
┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│    MySQL     │ │ SQL Server   │ │ MongoDB  │ │  MySQL   │ │  File    │
│ auth_service │ │TeamsDatabase │ │basketball│ │basketball│ │ System   │
│     _db      │ │              │ │_players  │ │_matches  │ │  (PDF)   │
└──────────────┘ └──────────────┘ └──────────┘ └──────────┘ └──────────┘
```

---

## 🎯 Microservicios

### 1. API Gateway (NestJS)
**Responsabilidad:** Punto de entrada único y enrutamiento

**Tecnologías:**
- NestJS 10
- Axios para HTTP
- http-proxy-middleware
- Throttler (rate limiting)

**Funciones:**
- Enrutamiento a microservicios
- Manejo de redirecciones OAuth
- Health checks agregados
- CORS centralizado
- Logging de requests

**Endpoints:**
```
/api/auth/*      → Auth Service (5005)
/api/teams/*     → Teams Service (5001)
/api/players/*   → Players Service (5002)
/api/matches/*   → Matches Service (5004)
/api/reports/*   → Report Service (5003)
/api/users/*     → Auth Service (5005)
```

---

### 2. Auth Service (NestJS + MySQL)
**Responsabilidad:** Autenticación y autorización

**Tecnologías:**
- NestJS 10
- TypeORM
- Passport.js (JWT, OAuth 2.0)
- Bcrypt
- MySQL 8

**Funciones:**
- Login/Register tradicional
- OAuth 2.0 (Google, Facebook, GitHub)
- Generación de JWT tokens
- Refresh tokens
- Gestión de usuarios
- Control de roles (RBAC)
- Cambio de contraseña

**Base de Datos:**
```sql
tables:
  - users (id, username, email, password, provider, providerId, profilePicture)
  - roles (id, name, description)
  - user_roles (userId, roleId)
  - refresh_tokens (id, userId, token, expiresAt, userAgent, ipAddress)
```

---

### 3. Teams Service (.NET Core 8 + SQL Server)
**Responsabilidad:** Gestión de equipos

**Tecnologías:**
- ASP.NET Core 8
- Entity Framework Core
- SQL Server 2019+
- AutoMapper

**Funciones:**
- CRUD de equipos
- Gestión de planteles
- Estadísticas de equipo
- Histórico de equipos

**Base de Datos:**
```sql
tables:
  - Teams (Id, Name, City, Coach, Stadium, FoundedYear, Logo)
```

---

### 4. Players Service (Flask + MongoDB)
**Responsabilidad:** Gestión de jugadores

**Tecnologías:**
- Flask 3.0
- PyMongo
- MongoDB 6.0
- Flask-CORS

**Funciones:**
- CRUD de jugadores
- Asignación a equipos
- Estadísticas individuales
- Búsqueda y filtrado

**Base de Datos:**
```javascript
collection: players
{
  _id: ObjectId,
  name: String,
  number: Number,
  position: String,
  teamId: Number,
  height: Number,
  weight: Number,
  birthdate: Date,
  nationality: String,
  stats: {
    points: Number,
    assists: Number,
    rebounds: Number
  }
}
```

---

### 5. Matches Service (NestJS + MySQL)
**Responsabilidad:** Gestión de partidos y marcador en tiempo real

**Tecnologías:**
- NestJS 10
- TypeORM
- MySQL 8
- EventEmitter2 (eventos internos)

**Funciones:**
- CRUD de partidos
- Actualización de marcador en tiempo real
- Control de tiempo de juego
- Registro de eventos del partido
- Estadísticas del partido

**Base de Datos:**
```sql
tables:
  - matches (id, homeTeamId, awayTeamId, date, status, homeScore, awayScore)
  - match_events (id, matchId, type, team, player, minute, points)
```

---

### 6. Report Service (NestJS + PDFKit)
**Responsabilidad:** Generación de reportes

**Tecnologías:**
- NestJS 10
- PDFKit
- File System

**Funciones:**
- Reportes de partidos
- Reportes de estadísticas
- Reportes de equipos
- Exportación a PDF

---

## 🔄 Flujos de Comunicación

### Flujo de Autenticación OAuth
```
1. Usuario → Frontend: Click "Login con GitHub"
2. Frontend → API Gateway: GET /api/auth/github
3. API Gateway → Auth Service: GET /api/auth/github
4. Auth Service → GitHub: Redirección a autorización
5. GitHub → Usuario: Pantalla de autorización
6. Usuario → GitHub: Autoriza
7. GitHub → API Gateway: Callback con code
8. API Gateway → Auth Service: GET /api/auth/github/callback?code=xxx
9. Auth Service → GitHub: Exchange code por access_token
10. Auth Service → DB: Buscar/crear usuario
11. Auth Service → Frontend: Redirect con token JWT
12. Frontend: Guarda token, actualiza estado, redirige a dashboard
```

### Flujo de Request Autenticado
```
1. Frontend: Agrega header Authorization: Bearer <token>
2. Frontend → API Gateway: Request con token
3. API Gateway → Microservicio: Proxy de request
4. Microservicio → Auth Service: Valida token (opcional)
5. Microservicio → API Gateway: Response
6. API Gateway → Frontend: Response
```

---

## 🔐 Seguridad

### Autenticación
- JWT tokens con expiración (24h)
- Refresh tokens (7 días)
- OAuth 2.0 para proveedores externos
- Bcrypt para hash de contraseñas (salt rounds: 10)

### Autorización
- Guards por rol (Admin, User, Scorer, Moderator)
- Decorador @CurrentUser para obtener usuario autenticado
- Middleware de validación de tokens

### CORS
- Configurado en API Gateway
- Origin permitido: http://localhost:4200
- Credentials: true

### Rate Limiting
- Throttler en API Gateway
- Límite: 100 requests por minuto por IP

---

## 📊 Ventajas de esta Arquitectura

1. **Escalabilidad:** Cada servicio puede escalar independientemente
2. **Tecnología heterogénea:** Cada servicio usa la mejor tecnología para su función
3. **Mantenibilidad:** Código organizado y responsabilidades claras
4. **Resilencia:** Fallo de un servicio no afecta a los demás
5. **Despliegue independiente:** Cada servicio se despliega por separado
6. **Bases de datos especializadas:** Cada servicio usa la BD más adecuada

---

## 🚀 Próximas Mejoras

- [ ] Implementar Message Broker (RabbitMQ/Kafka) para eventos asíncronos
- [ ] Service Discovery (Consul/Eureka)
- [ ] Circuit Breaker pattern
- [ ] Distributed Tracing (Jaeger)
- [ ] Centralized Logging (ELK Stack)
- [ ] API Gateway con Kong o NGINX
- [ ] Containerización con Docker
- [ ] Orquestación con Kubernetes
