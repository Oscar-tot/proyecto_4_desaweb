import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
    }),
    
    // Base de datos MySQL
    DatabaseModule,
    
    // Módulos de funcionalidad
    AuthModule,
    UsersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
