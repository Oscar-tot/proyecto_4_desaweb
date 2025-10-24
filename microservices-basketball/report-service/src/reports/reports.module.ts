import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportHistory } from '../entities/report-history.entity';
import { CachedTeam } from '../entities/cached-team.entity';
import { CachedPlayer } from '../entities/cached-player.entity';
import { CachedMatch } from '../entities/cached-match.entity';
import { PdfModule } from '../pdf/pdf.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReportHistory,
      CachedTeam,
      CachedPlayer,
      CachedMatch,
    ]),
    PdfModule,
    ClientsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
