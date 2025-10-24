import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReportHistory } from '../entities/report-history.entity';
import { CachedTeam } from '../entities/cached-team.entity';
import { CachedPlayer } from '../entities/cached-player.entity';
import { CachedMatch } from '../entities/cached-match.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbHost = configService.get('DB_HOST');
        const dbUser = configService.get('DB_USERNAME');
        const dbPass = configService.get('DB_PASSWORD');
        const dbName = configService.get('DB_DATABASE');
        const dbInstance = configService.get('DB_INSTANCE');
        
        console.log('\n Report Service Database Configuration:');
        console.log(`   Host: ${dbHost}`);
        console.log(`   User: ${dbUser}`);
        console.log(`   Database: ${dbName}`);
        console.log('   ✓ Base de datos específica: report_service_db');
        console.log('   ✓ Usuario específico: Inge_tot');
        console.log('   ✓ Conectando por puerto 1433 (sin instance name)\n');
        
        return {
          type: 'mssql',
          host: dbHost,
          port: 1433,
          username: dbUser,
          password: dbPass,
          database: dbName,
          entities: [ReportHistory, CachedTeam, CachedPlayer, CachedMatch],
          synchronize: configService.get('NODE_ENV') === 'development',
          logging: configService.get('NODE_ENV') === 'development',
          options: {
            encrypt: false,
            trustServerCertificate: true,
            enableArithAbort: true,
            // SIN instanceName - usar puerto directo
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
