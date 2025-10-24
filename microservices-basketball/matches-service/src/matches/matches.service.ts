import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Match, MatchStatus } from '../entities/match.entity';
import { MatchStats } from '../entities/match-stats.entity';
import { CreateMatchDto, UpdateMatchDto } from './dto/match.dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(MatchStats)
    private matchStatsRepository: Repository<MatchStats>,
    private httpService: HttpService,
  ) {}

  async findAll(): Promise<Match[]> {
    return this.matchRepository.find({
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: ['events', 'stats'],
    });

    if (!match) {
      throw new NotFoundException(`Partido con ID ${id} no encontrado`);
    }

    return match;
  }

  async findByTeam(teamId: number): Promise<Match[]> {
    return this.matchRepository.find({
      where: [
        { equipoLocalId: teamId },
        { equipoVisitanteId: teamId },
      ],
      order: { fecha: 'DESC' },
    });
  }

  async create(createMatchDto: CreateMatchDto): Promise<Match> {
    // Validar que los equipos no sean el mismo
    if (createMatchDto.equipoLocalId === createMatchDto.equipoVisitanteId) {
      throw new BadRequestException('Un equipo no puede jugar contra sí mismo');
    }

    // Obtener nombres de equipos si no se proporcionaron
    if (!createMatchDto.equipoLocalNombre) {
      createMatchDto.equipoLocalNombre = await this.getTeamName(createMatchDto.equipoLocalId);
    }
    if (!createMatchDto.equipoVisitanteNombre) {
      createMatchDto.equipoVisitanteNombre = await this.getTeamName(createMatchDto.equipoVisitanteId);
    }

    // Normalizar el estado (convertir de mayúsculas a minúsculas)
    let estadoNormalizado = createMatchDto.estado || 'programado';
    if (estadoNormalizado) {
      estadoNormalizado = estadoNormalizado.toLowerCase();
      // Convertir EN_CURSO a en_curso
      if (estadoNormalizado === 'en_curso' || estadoNormalizado === 'en curso') {
        estadoNormalizado = MatchStatus.EN_CURSO;
      } else if (estadoNormalizado === 'programado') {
        estadoNormalizado = MatchStatus.PROGRAMADO;
      } else if (estadoNormalizado === 'finalizado') {
        estadoNormalizado = MatchStatus.FINALIZADO;
      } else if (estadoNormalizado === 'cancelado') {
        estadoNormalizado = MatchStatus.CANCELADO;
      }
    }

    // Normalizar campos (aliases del frontend)
    const matchData: any = {
      equipoLocalId: createMatchDto.equipoLocalId,
      equipoVisitanteId: createMatchDto.equipoVisitanteId,
      equipoLocalNombre: createMatchDto.equipoLocalNombre,
      equipoVisitanteNombre: createMatchDto.equipoVisitanteNombre,
      fecha: createMatchDto.fecha || createMatchDto.fechaPartido || new Date().toISOString(),
      lugar: createMatchDto.lugar || 'Por definir',
      estado: estadoNormalizado,
      marcadorLocal: createMatchDto.puntuacionLocal || 0,
      marcadorVisitante: createMatchDto.puntuacionVisitante || 0,
      cuartoActual: createMatchDto.periodo || 1,
      tiempoRestante: createMatchDto.tiempoRestante || '12:00',
      descripcion: createMatchDto.descripcion,
    };

    // Crear y guardar partido
    const savedMatch = await this.matchRepository.save(matchData);

    // Guardar jugadores del roster en match_stats
    if (createMatchDto.jugadoresLocalIds && createMatchDto.jugadoresLocalIds.length > 0) {
      await this.saveRosterPlayers(savedMatch.id, createMatchDto.jugadoresLocalIds, createMatchDto.equipoLocalId);
    }
    if (createMatchDto.jugadoresVisitanteIds && createMatchDto.jugadoresVisitanteIds.length > 0) {
      await this.saveRosterPlayers(savedMatch.id, createMatchDto.jugadoresVisitanteIds, createMatchDto.equipoVisitanteId);
    }

    return savedMatch;
  }

  async update(id: number, updateMatchDto: UpdateMatchDto): Promise<Match> {
    const match = await this.findOne(id);
    Object.assign(match, updateMatchDto);
    return this.matchRepository.save(match);
  }

  async remove(id: number): Promise<void> {
    const match = await this.findOne(id);
    await this.matchRepository.remove(match);
  }

  async startMatch(id: number): Promise<Match> {
    const match = await this.findOne(id);
    
    if (match.estado !== MatchStatus.PROGRAMADO) {
      throw new BadRequestException('Solo se pueden iniciar partidos programados');
    }

    match.estado = MatchStatus.EN_CURSO;
    match.cuartoActual = 1;
    match.tiempoRestante = '12:00';
    
    return this.matchRepository.save(match);
  }

  async finishMatch(id: number): Promise<Match> {
    const match = await this.findOne(id);
    
    if (match.estado !== MatchStatus.EN_CURSO) {
      throw new BadRequestException('Solo se pueden finalizar partidos en curso');
    }

    match.estado = MatchStatus.FINALIZADO;
    match.tiempoRestante = '0:00';
    
    return this.matchRepository.save(match);
  }

  async updateScore(id: number, localScore: number, visitanteScore: number): Promise<Match> {
    const match = await this.findOne(id);
    match.marcadorLocal = localScore;
    match.marcadorVisitante = visitanteScore;
    return this.matchRepository.save(match);
  }

  private async getTeamName(teamId: number): Promise<string> {
    try {
      const url = `${process.env.TEAMS_SERVICE_URL}/${teamId}`;
      console.log('🏀 Obteniendo nombre del equipo desde:', url);
      const response = await firstValueFrom(this.httpService.get(url));
      console.log('📦 Respuesta completa:', JSON.stringify(response.data, null, 2));
      const nombre = response.data?.nombre || response.data.data?.nombre || `Equipo ${teamId}`;
      console.log('✅ Nombre del equipo obtenido:', nombre);
      return nombre;
    } catch (error) {
      console.error('❌ Error al obtener nombre del equipo:', error.message);
      return `Equipo ${teamId}`;
    }
  }

  private async saveRosterPlayers(matchId: number, jugadorIds: string[], equipoId: number): Promise<void> {
    for (const jugadorId of jugadorIds) {
      const stats = this.matchStatsRepository.create({
        matchId,
        jugadorId,
        jugadorNombre: 'Jugador',  // Se actualizará cuando tengamos el nombre
        equipoId,
        minutos: 0,
        puntos: 0,
        rebotes: 0,
        asistencias: 0,
        robos: 0,
        bloqueos: 0,
        faltas: 0,
        tirosCampoAnotados: 0,
        tirosCampoIntentados: 0,
        tiros3Anotados: 0,
        tiros3Intentados: 0,
        tirosLibresAnotados: 0,
        tirosLibresIntentados: 0,
      });
      await this.matchStatsRepository.save(stats);
    }
  }

  async getRosterPlayers(matchId: number): Promise<any[]> {
    const stats = await this.matchStatsRepository.find({
      where: { matchId },
    });

    // Enriquecer con información de jugadores desde Players Service
    const enrichedStats = await Promise.all(
      stats.map(async (stat) => {
        try {
          const PLAYERS_SERVICE_URL = process.env.PLAYERS_SERVICE_URL || 'http://localhost:5002/api/players';
          const response = await this.httpService.axiosRef.get(`${PLAYERS_SERVICE_URL}/${stat.jugadorId}`);
          const jugador = response.data.data || response.data;
          
          return {
            ...stat,
            jugadorNombre: jugador.nombreCompleto || jugador.nombre || 'Jugador',
            jugadorNumero: jugador.numero || jugador.numeroCamiseta || 0,
            jugadorPosicion: jugador.posicion || 'N/A',
          };
        } catch (error) {
          console.error(`Error obteniendo jugador ${stat.jugadorId}:`, error.message);
          return stat; // Devolver stat original si falla
        }
      })
    );

    return enrichedStats;
  }
}
