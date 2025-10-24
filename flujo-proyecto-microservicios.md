# Flujo del Proyecto: Microservicios con API Gateway y Frontend

## Diagrama Explicativo del Flujo (Jugadores)

```
[ Usuario ]
     │
     ▼
[ Componente Angular ]
     │
     ▼
[ Servicio Angular (jugador.service.ts) ]
     │
     ▼
[ API Gateway (NestJS) ]
     │
     ▼
[ Controlador Proxy (players-proxy.controller.ts) ]
     │
     ▼
[ ProxyService (proxy.service.ts) ]
     │
     ▼
[ Microservicio de Jugadores (Flask) ]
     │
     ▼
[ Base de datos MongoDB ]
```

---

## Explicación Paso a Paso

### 1. Frontend Angular
- El usuario interactúa con la interfaz (por ejemplo, ver jugadores).
- El componente llama al servicio Angular:

```typescript
this.jugadorService.getJugadores().subscribe(...);
```

- El servicio hace una petición GET a:
```
http://localhost:5000/api/players
```

### 2. API Gateway (NestJS)
- El controlador `players-proxy.controller.ts` recibe la petición:

```typescript
@All('players*')
async proxy(@Req() req: Request, @Res() res: Response) {
  const serviceUrl = 'http://localhost:5002';
  const path = req.url;
  const result = await this.proxyService.forwardRequest(
    serviceUrl, path, req.method, req.body, req.headers, req.query
  );
  res.json(result);
}
```

- El controlador llama al `ProxyService` para reenviar la petición al microservicio.

### 3. ProxyService (NestJS)
- Construye la petición HTTP y la envía al microservicio:

```typescript
const config: AxiosRequestConfig = {
  method: method as any,
  url: fullUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Forwarded-By': 'API-Gateway',
    'X-Request-ID': requestId,
    ...(headers?.authorization && { 'Authorization': headers.authorization }),
  },
  params: queryParams,
  timeout: 10000,
};

if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
  config.data = body;
}

const response = await firstValueFrom(this.httpService.request(config));
return response.data;
```

- Maneja errores y los traduce para el frontend:

```typescript
if (error.response) {
  // Error HTTP del microservicio (400, 401, 403, 404, 500)
  throw new HttpException({ ...error.response.data, ... }, error.response.status);
} else if (error.code === 'ECONNREFUSED') {
  // Servicio caído
  throw new HttpException({ ... }, HttpStatus.SERVICE_UNAVAILABLE);
} else if (error.code === 'ETIMEDOUT') {
  // Timeout
  throw new HttpException({ ... }, HttpStatus.GATEWAY_TIMEOUT);
} else if (error.request) {
  // No hubo respuesta
  throw new HttpException({ ... }, HttpStatus.SERVICE_UNAVAILABLE);
} else {
  // Error inesperado
  throw new HttpException({ ... }, HttpStatus.INTERNAL_SERVER_ERROR);
}
```

### 4. Microservicio de Jugadores (Flask)
- Recibe la petición en la ruta:

```python
@players_bp.route('', methods=['GET'])
def get_all_players():
    filters = {}
    if request.args.get('equipoId'):
        filters['equipoId'] = request.args.get('equipoId')
    players = player_service.get_all_players(filters)
    return jsonify({
        'success': True,
        'count': len(players),
        'data': players
    }), 200
```

- Consulta la base de datos y responde con la lista de jugadores.

---

## Errores que maneja la Gateway

- **error.response:** El microservicio responde con error HTTP (400, 401, 403, 404, 500).
- **error.code === 'ECONNREFUSED':** El microservicio está caído.
- **error.code === 'ETIMEDOUT':** El microservicio tarda demasiado en responder.
- **error.request:** No hubo respuesta del microservicio.
- **Otros:** Error inesperado en la configuración o envío de la petición.

---

## Explicación de 403 Forbidden
- El usuario está autenticado pero no tiene permisos suficientes para la acción (por ejemplo, no es admin).
- La gateway devuelve el error al frontend indicando que la operación está bloqueada por falta de permisos.

---

## Resumen del Flujo
1. Usuario → Componente Angular → Servicio Angular
2. Servicio Angular → API Gateway
3. API Gateway → Controlador Proxy → ProxyService
4. ProxyService → Microservicio de Jugadores (Flask)
5. Microservicio → Base de datos → Respuesta
6. Respuesta regresa por el mismo camino hasta el frontend

---

**Este archivo resume todo lo que vimos y explicamos en el chat, con ejemplos de código y explicaciones claras para cada paso del flujo.**
