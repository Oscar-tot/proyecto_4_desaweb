import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchEvent, EventType } from '../entities/match-event.entity';
import { MatchStats } from '../entities/match-stats.entity';
import { MatchesService } from '../matches/matches.service';
import { CreateEventDto } from '../matches/dto/event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(MatchEvent)
    private eventRepository: Repository<MatchEvent>,
    @InjectRepository(MatchStats)
    private statsRepository: Repository<MatchStats>,
    private matchesService: MatchesService,
  ) {}

  async findByMatch(matchId: number): Promise<MatchEvent[]> {
    return this.eventRepository.find({
      where: { matchId },
      order: { createdAt: 'ASC' },
    });
  }

  async create(matchId: number, createEventDto: CreateEventDto): Promise<MatchEvent> {
    // Verificar que el partido existe
    await this.matchesService.findOne(matchId);

    // Calcular puntos según el tipo de evento
    const puntos = this.calculatePoints(createEventDto.tipo);

    // Crear evento
    const event = this.eventRepository.create({
      ...createEventDto,
      matchId,
      puntos: createEventDto.puntos !== undefined ? createEventDto.puntos : puntos,
    });

    const savedEvent = await this.eventRepository.save(event);

    // Actualizar estadísticas del jugador
    await this.updatePlayerStats(matchId, savedEvent);

    // Actualizar marcador del partido si es canasta
    if (puntos > 0) {
      await this.updateMatchScore(matchId, createEventDto.equipoId, puntos);
    }

    return savedEvent;
  }

  async getMatchStats(matchId: number): Promise<MatchStats[]> {
    return this.statsRepository.find({
      where: { matchId },
    });
  }

  private calculatePoints(eventType: EventType): number {
    switch (eventType) {
      case EventType.CANASTA_2:
        return 2;
      case EventType.CANASTA_3:
        return 3;
      case EventType.TIRO_LIBRE:
        return 1;
      default:
        return 0;
    }
  }

  private async updatePlayerStats(matchId: number, event: MatchEvent): Promise<void> {
    let stats = await this.statsRepository.findOne({
      where: {
        matchId,
        jugadorId: event.jugadorId,
      },
    });

    if (!stats) {
      stats = this.statsRepository.create({
        matchId,
        jugadorId: event.jugadorId,
        jugadorNombre: event.jugadorNombre,
        equipoId: event.equipoId,
      });
    }

    // Actualizar estadísticas según el tipo de evento
    switch (event.tipo) {
      case EventType.CANASTA_2:
        stats.puntos += 2;
        stats.tirosCampoAnotados += 1;
        stats.tirosCampoIntentados += 1;
        break;
      case EventType.CANASTA_3:
        stats.puntos += 3;
        stats.tiros3Anotados += 1;
        stats.tiros3Intentados += 1;
        stats.tirosCampoAnotados += 1;
        stats.tirosCampoIntentados += 1;
        break;
      case EventType.TIRO_LIBRE:
        stats.puntos += 1;
        stats.tirosLibresAnotados += 1;
        stats.tirosLibresIntentados += 1;
        break;
      case EventType.REBOTE:
        stats.rebotes += 1;
        break;
      case EventType.ASISTENCIA:
        stats.asistencias += 1;
        break;
      case EventType.ROBO:
        stats.robos += 1;
        break;
      case EventType.BLOQUEO:
        stats.bloqueos += 1;
        break;
      case EventType.FALTA:
        stats.faltas += 1;
        break;
    }

    await this.statsRepository.save(stats);
  }

  private async updateMatchScore(
    matchId: number,
    equipoId: number,
    puntos: number,
  ): Promise<void> {
    const match = await this.matchesService.findOne(matchId);

    if (match.equipoLocalId === equipoId) {
      match.marcadorLocal += puntos;
    } else if (match.equipoVisitanteId === equipoId) {
      match.marcadorVisitante += puntos;
    }

    await this.matchesService.updateScore(
      matchId,
      match.marcadorLocal,
      match.marcadorVisitante,
    );
  }
}
