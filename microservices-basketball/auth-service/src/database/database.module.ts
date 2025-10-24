import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql' as const,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'OAuth'),
        password: configService.get<string>('DB_PASSWORD', 'OAuth1234@'),
        database: configService.get<string>('DB_DATABASE', 'auth_service_db'),
        entities: [User, Role, RefreshToken],
        synchronize: true, // Activado para crear tablas automáticamente
        logging: configService.get<boolean>('DB_LOGGING', false),
        timezone: 'Z',
      }),
    }),
    TypeOrmModule.forFeature([Role, User, RefreshToken]),
  ],
  providers: [SeedService],
})
export class DatabaseModule {}
