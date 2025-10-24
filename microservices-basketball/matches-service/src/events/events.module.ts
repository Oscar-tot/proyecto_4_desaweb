import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEvent } from '../entities/match-event.entity';
import { MatchStats } from '../entities/match-stats.entity';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { MatchesModule } from '../matches/matches.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatchEvent, MatchStats]),
    MatchesModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
