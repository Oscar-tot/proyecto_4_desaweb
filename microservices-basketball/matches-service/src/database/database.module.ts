import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Match } from '../entities/match.entity';
import { MatchEvent } from '../entities/match-event.entity';
import { MatchStats } from '../entities/match-stats.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql' as const,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'mysqlweb'),
        password: configService.get<string>('DB_PASSWORD', 'mysql123@'),
        database: configService.get<string>('DB_DATABASE', 'matches_service_db'),
        entities: [Match, MatchEvent, MatchStats],
        synchronize: configService.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
        logging: configService.get<string>('DB_LOGGING', 'true') === 'true',
        charset: 'utf8mb4',
        timezone: '+00:00',
      }),
    }),
  ],
})
export class DatabaseModule {}
