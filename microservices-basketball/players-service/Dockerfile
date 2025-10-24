# Multi-stage build para Players Service (Flask + MongoDB)

# ============================
# Stage 1: Builder
# ============================
FROM python:3.11-slim as builder

WORKDIR /app

# Instalar dependencias del sistema necesarias para compilar
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Crear virtualenv e instalar dependencias
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ============================
# Stage 2: Runtime
# ============================
FROM python:3.11-slim

WORKDIR /app

# Copiar virtualenv del builder
COPY --from=builder /opt/venv /opt/venv

# Configurar PATH para usar el virtualenv
ENV PATH="/opt/venv/bin:$PATH"

# Copiar código de la aplicación
COPY . .

# Crear usuario no-root para seguridad
RUN useradd -m -u 1000 flaskuser && \
    chown -R flaskuser:flaskuser /app

# Cambiar a usuario no-root
USER flaskuser

# Exponer puerto 5002
EXPOSE 5002

# Variables de entorno por defecto
ENV FLASK_ENV=production
ENV PORT=5002
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5002/health', timeout=5)"

# Comando de inicio
CMD ["gunicorn", "--bind", "0.0.0.0:5002", "--workers", "4", "--timeout", "120", "run:app"]
