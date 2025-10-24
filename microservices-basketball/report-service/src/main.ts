import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Report Service API')
    .setDescription('Microservicio de generación de reportes PDF para el sistema de baloncesto')
    .setVersion('1.0')
    .addTag('reports', 'Endpoints para generación de reportes')
    .addTag('health', 'Health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const port = configService.get<number>('PORT') || 5003;
  await app.listen(port);

  console.log(`\n Report Service running on: http://localhost:${port}`);
  console.log(` Swagger UI available at: http://localhost:${port}/swagger`);
  console.log(` Database: ${configService.get('DB_DATABASE')}\n`);
}

bootstrap();
