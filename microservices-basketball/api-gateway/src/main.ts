import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression = require('compression');
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Security
  app.use(helmet());
  
  // Compression
  app.use(compression());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization,Accept',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Basketball Scoreboard API Gateway')
    .setDescription('API Gateway centralizado para todos los microservicios')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('gateway', 'Información del Gateway')
    .addTag('teams', 'Proxy a Teams Service')
    .addTag('players', 'Proxy a Players Service')
    .addTag('matches', 'Proxy a Matches Service')
    .addTag('reports', 'Proxy a Reports Service')
    .addTag('auth', 'Proxy a Auth Service')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);

  console.log(`
  API GATEWAY STARTING...
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Port: ${port}
  Environment: ${process.env.NODE_ENV || 'development'}
  
  Gateway URL: http://localhost:${port}
  Swagger: http://localhost:${port}/swagger
  Health: http://localhost:${port}/api/health
  
  MICROSERVICES ROUTES:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Teams    → /api/teams/*    → ${process.env.TEAMS_SERVICE_URL}
   Players  → /api/players/*  → ${process.env.PLAYERS_SERVICE_URL}
   Matches  → /api/matches/*  → ${process.env.MATCHES_SERVICE_URL}
   Reports  → /api/reports/*  → ${process.env.REPORTS_SERVICE_URL}
   Auth     → /api/auth/*     → ${process.env.AUTH_SERVICE_URL}
   Users    → /api/users/*    → ${process.env.AUTH_SERVICE_URL}
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

bootstrap();
