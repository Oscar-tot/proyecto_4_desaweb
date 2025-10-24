# Multi-stage build para Matches Service (NestJS + MySQL)

# ============================
# Stage 1: Builder
# ============================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar dependencias
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código fuente
COPY src ./src

# Compilar TypeScript
RUN npm run build

# ============================
# Stage 2: Runtime
# ============================
FROM node:20-alpine

WORKDIR /app

# Copiar dependencias desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nestjs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nestjs /app

# Cambiar a usuario no-root
USER nestjs

# Exponer puerto 5004
EXPOSE 5004

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=5004

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5004/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", "dist/main.js"]
