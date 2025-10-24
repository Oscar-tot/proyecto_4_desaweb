/**
 * Punto de entrada de la aplicación Matches Service
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4200'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Configurar prefijo global
  app.setGlobalPrefix('api');

  // Configurar validación global
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

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Matches Service API')
    .setDescription('API para gestión de partidos de baloncesto')
    .setVersion('1.0')
    .addTag('matches', 'Gestión de partidos')
    .addTag('events', 'Eventos del partido')
    .addTag('stats', 'Estadísticas')
    .addTag('health', 'Health check')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const port = process.env.PORT || 5004;
  await app.listen(port);

  console.log(`
   Matches Service Starting...
   Port: ${port}
   Environment: ${process.env.NODE_ENV}
   Database: ${process.env.DB_DATABASE}
  
   Server running at: http://localhost:${port}
   Swagger: http://localhost:${port}/swagger
   Health check: http://localhost:${port}/health
  `);
}

bootstrap();
