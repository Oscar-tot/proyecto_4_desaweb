import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Match } from '../entities/match.entity';
import { MatchEvent } from '../entities/match-event.entity';
import { MatchStats } from '../entities/match-stats.entity';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, MatchEvent, MatchStats]),
    HttpModule,
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
