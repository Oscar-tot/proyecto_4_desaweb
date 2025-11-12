# Documentación Investigativa - Basketball Scoreboard

## 📚 Índice de Investigación

Esta carpeta contiene toda la documentación investigativa del proyecto, organizada en las siguientes secciones:

---

## 1. Marco Teórico

### 1.1 Arquitectura de Microservicios
**Archivo:** `01_marco_teorico/microservicios.md`

**Contenido sugerido:**
- Definición de microservicios
- Historia y evolución
- Principios fundamentales
- Comparación con arquitectura monolítica
- Patrones de diseño (API Gateway, Service Discovery, Circuit Breaker)
- Ventajas y desventajas

**Referencias bibliográficas:**
- Martin Fowler - Microservices Architecture
- Sam Newman - Building Microservices
- Chris Richardson - Microservices Patterns

---

### 1.2 OAuth 2.0 y Autenticación
**Archivo:** `01_marco_teorico/oauth2.md`

**Contenido sugerido:**
- Protocolos de autenticación
- OAuth 2.0 vs OAuth 1.0
- Flujos de autorización (Authorization Code, Implicit, etc.)
- JWT (JSON Web Tokens)
- Refresh Tokens
- Proveedores OAuth (Google, Facebook, GitHub)
- Seguridad en autenticación

**Referencias bibliográficas:**
- RFC 6749 - OAuth 2.0 Authorization Framework
- RFC 7519 - JSON Web Token (JWT)
- OWASP - Authentication Cheat Sheet

---

### 1.3 Bases de Datos Relacionales vs NoSQL
**Archivo:** `01_marco_teorico/bases_de_datos.md`

**Contenido sugerido:**
- Bases de datos relacionales (SQL)
- Bases de datos NoSQL (Document, Key-Value, Graph)
- Teorema CAP
- ACID vs BASE
- Cuándo usar cada tipo
- Polyglot Persistence

**Referencias bibliográficas:**
- Martin Kleppmann - Designing Data-Intensive Applications
- MongoDB Documentation
- MySQL/SQL Server Documentation

---

### 1.4 Frameworks Web Modernos
**Archivo:** `01_marco_teorico/frameworks_web.md`

**Contenido sugerido:**
- Single Page Applications (SPA)
- Angular vs React vs Vue
- Server Side Rendering (SSR)
- State Management (Signals, RxJS, NgRx)
- Component-based architecture

**Referencias bibliográficas:**
- Angular Documentation
- React Documentation
- State of JS Survey

---

## 2. Estado del Arte

### 2.1 Sistemas de Marcador Deportivo Existentes
**Archivo:** `02_estado_del_arte/sistemas_existentes.md`

**Contenido sugerido:**
- Análisis de sistemas comerciales
- Funcionalidades comunes
- Tecnologías utilizadas
- Ventajas y limitaciones
- Oportunidades de mejora

**Sistemas a analizar:**
- ScoreStream
- GameChanger
- MaxPreps
- Hudl
- Basketball ScoreKeeper

---

### 2.2 Tendencias en Desarrollo Web
**Archivo:** `02_estado_del_arte/tendencias_desarrollo.md`

**Contenido sugerido:**
- JAMstack
- Serverless architecture
- Edge computing
- WebAssembly
- Progressive Web Apps (PWA)
- Real-time communications (WebSockets, SSE)

---

## 3. Comparativa de Tecnologías

### 3.1 Backend Frameworks
**Archivo:** `03_comparativas/backend_frameworks.md`

**Tabla comparativa:**

| Característica | NestJS | ASP.NET Core | Flask |
|----------------|--------|--------------|-------|
| Lenguaje | TypeScript | C# | Python |
| Paradigma | OOP/FP | OOP | Funcional |
| Performance | Alta | Muy Alta | Media |
| Curva de aprendizaje | Media | Media-Alta | Baja |
| Ecosistema | Node.js | .NET | Python |
| Tipado | Fuerte | Fuerte | Dinámico |
| Comunidad | Grande | Muy Grande | Muy Grande |

**Justificación de elecciones:**
- NestJS: Para Auth, Matches, Reports por su estructura modular y TypeScript
- ASP.NET Core: Para Teams por su performance y Entity Framework
- Flask: Para Players por su simplicidad y compatibilidad con MongoDB

---

### 3.2 Bases de Datos
**Archivo:** `03_comparativas/bases_de_datos.md`

**Tabla comparativa:**

| Característica | MySQL | SQL Server | MongoDB |
|----------------|-------|------------|---------|
| Tipo | Relacional | Relacional | NoSQL (Document) |
| ACID | Sí | Sí | Eventual Consistency |
| Escalabilidad | Vertical | Vertical/Horizontal | Horizontal |
| Consultas | SQL | T-SQL | MQL |
| Transacciones | Sí | Sí | Sí (desde 4.0) |
| Costo | Gratis | Licencia | Gratis (Community) |

---

### 3.3 Frontend Frameworks
**Archivo:** `03_comparativas/frontend_frameworks.md`

**Tabla comparativa:**

| Característica | Angular | React | Vue |
|----------------|---------|-------|-----|
| Arquitectura | Full framework | Library | Progressive |
| Curva aprendizaje | Alta | Media | Baja |
| TypeScript | Nativo | Opcional | Opcional |
| State Management | Signals/RxJS | Redux/Context | Vuex/Pinia |
| Routing | Incluido | React Router | Vue Router |
| CLI | Angular CLI | Create React App | Vue CLI |

**Justificación:** Angular por su estructura completa, TypeScript nativo y Signals

---

## 4. Metodología de Desarrollo

### 4.1 Metodología Ágil
**Archivo:** `04_metodologia/agil.md`

**Contenido sugerido:**
- Scrum vs Kanban
- Sprints y retrospectivas
- User Stories
- Definition of Done
- Continuous Integration/Deployment

---

### 4.2 Versionado de Código
**Archivo:** `04_metodologia/git.md`

**Contenido sugerido:**
- Git Flow
- Conventional Commits
- Pull Requests
- Code Review
- Branching strategies

---

## 5. Seguridad

### 5.1 OWASP Top 10
**Archivo:** `05_seguridad/owasp.md`

**Contenido sugerido:**
- Injection
- Broken Authentication
- XSS (Cross-Site Scripting)
- CSRF (Cross-Site Request Forgery)
- Seguridad en APIs
- Mitigaciones implementadas

---

### 5.2 Seguridad en Microservicios
**Archivo:** `05_seguridad/microservicios.md`

**Contenido sugerido:**
- API Gateway security
- Service-to-service authentication
- Secrets management
- HTTPS/TLS
- Rate limiting
- Input validation

---

## 6. Patrones de Diseño

### 6.1 Patrones de Microservicios
**Archivo:** `06_patrones/microservicios_patterns.md`

**Contenido sugerido:**
- API Gateway pattern
- Database per Service
- Event Sourcing
- CQRS (Command Query Responsibility Segregation)
- Saga pattern
- Circuit Breaker

---

### 6.2 Patrones de Frontend
**Archivo:** `06_patrones/frontend_patterns.md`

**Contenido sugerido:**
- Component composition
- Container/Presentational components
- Reactive programming
- Guards y Interceptors
- Lazy loading
- State management patterns

---

## 📝 Formato de Documentos Investigativos

Cada documento investigativo debe seguir este formato:

```markdown
# Título del Tema

## 1. Introducción
Breve introducción al tema

## 2. Conceptos Fundamentales
Definiciones y conceptos clave

## 3. Análisis Detallado
Explicación profunda del tema

## 4. Ventajas y Desventajas
Pros y contras del enfoque/tecnología

## 5. Casos de Uso
Cuándo aplicar esta solución

## 6. Aplicación en el Proyecto
Cómo se implementó en Basketball Scoreboard

## 7. Conclusiones
Conclusiones basadas en la investigación

## 8. Referencias Bibliográficas
[1] Autor, "Título", Editorial, Año
[2] URL del recurso
[3] ...
```

---

## 📚 Referencias Generales Recomendadas

### Libros
1. "Microservices Patterns" - Chris Richardson
2. "Building Microservices" - Sam Newman
3. "Clean Architecture" - Robert C. Martin
4. "Designing Data-Intensive Applications" - Martin Kleppmann
5. "OAuth 2 in Action" - Justin Richer

### Artículos y Papers
1. Martin Fowler - "Microservices" (martinfowler.com)
2. Netflix Tech Blog - Microservices Architecture
3. Microsoft Azure - Microservices Architecture Guide

### Documentación Oficial
1. Angular Documentation
2. NestJS Documentation
3. ASP.NET Core Documentation
4. MongoDB Documentation
5. OAuth 2.0 RFC 6749

### Recursos Online
1. MDN Web Docs
2. StackOverflow
3. GitHub repositories
4. Dev.to articles
5. Medium engineering blogs

---

**Nota:** Esta es una guía estructural. Cada archivo debe ser creado y completado con investigación detallada, análisis crítico y referencias académicas apropiadas.
