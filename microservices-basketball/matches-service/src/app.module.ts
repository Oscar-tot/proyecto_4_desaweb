import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { MatchesModule } from './matches/matches.module';
import { EventsModule } from './events/events.module';
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
    MatchesModule,
    EventsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
