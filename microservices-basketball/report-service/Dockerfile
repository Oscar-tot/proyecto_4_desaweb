# Dockerfile para Report Service (NestJS + TypeORM + SQL Server)
# Microservicio de generación de reportes PDF

# ========== Stage 1: Build ==========
FROM node:20-alpine AS builder

# Instalar dependencias necesarias para compilación
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Instalar dependencias
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código fuente
COPY src ./src

# Compilar la aplicación TypeScript
RUN npm run build

# ========== Stage 2: Production ==========
FROM node:20-alpine AS production

# Metadata
LABEL maintainer="Oscar <oscar@basketball.com>"
LABEL service="report-service"
LABEL description="Microservicio de generación de reportes PDF"

# Instalar dependencias del sistema necesarias para PDFKit y SQL Server
RUN apk add --no-cache \
    cairo \
    pango \
    libc6-compat \
    fontconfig \
    ttf-dejavu

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar dependencias de producción desde builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Copiar código compilado
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Crear directorio para reportes generados
RUN mkdir -p /app/generated-reports && \
    chown -R nodejs:nodejs /app/generated-reports

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto del servicio
EXPOSE 5003

# Variables de entorno por defecto (se sobrescriben con .env o docker-compose)
ENV NODE_ENV=production \
    PORT=5003

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5003/api/reports/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", "dist/main"]
