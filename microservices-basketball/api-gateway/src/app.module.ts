import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HttpModule } from '@nestjs/axios';
import { ProxyModule } from './proxy/proxy.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
    }),

    // HTTP Module para health checks
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.RATE_LIMIT_TTL) || 60000, // 60 segundos
      limit: parseInt(process.env.RATE_LIMIT_MAX) || 100,  // 100 requests
    }]),

    // Módulo de proxy
    ProxyModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
