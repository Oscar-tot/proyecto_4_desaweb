import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportHistory } from '../entities/report-history.entity';
import { CachedTeam } from '../entities/cached-team.entity';
import { CachedPlayer } from '../entities/cached-player.entity';
import { CachedMatch } from '../entities/cached-match.entity';
import { PdfService } from '../pdf/pdf.service';
import { TeamsClient } from '../clients/teams.client';
import { PlayersClient } from '../clients/players.client';
import { MatchesClient } from '../clients/matches.client';
import * as fs from 'fs';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(ReportHistory)
    private readonly reportHistoryRepo: Repository<ReportHistory>,
    @InjectRepository(CachedTeam)
    private readonly cachedTeamRepo: Repository<CachedTeam>,
    @InjectRepository(CachedPlayer)
    private readonly cachedPlayerRepo: Repository<CachedPlayer>,
    @InjectRepository(CachedMatch)
    private readonly cachedMatchRepo: Repository<CachedMatch>,
    private readonly pdfService: PdfService,
    private readonly teamsClient: TeamsClient,
    private readonly playersClient: PlayersClient,
    private readonly matchesClient: MatchesClient,
  ) {}

  async generateTeamReport(teamId: number): Promise<string> {
    this.logger.log(`Generating report for team ${teamId}`);

    // Fetch team data from teams-service
    const team = await this.teamsClient.getTeamById(teamId);
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Cache team data
    await this.cacheTeamData(team);

    // Generate PDF
    const filePath = await this.pdfService.generateTeamReport(team);

    // Save to history
    await this.saveToHistory({
      reportType: 'team',
      entityId: teamId,
      entityName: team.nombre,
      filePath,
    });

    return filePath;
  }

  async generatePlayerReport(playerId: number): Promise<string> {
    this.logger.log(`Generating report for player ${playerId}`);

    // Fetch player data
    const player = await this.playersClient.getPlayerById(playerId);
    if (!player) {
      throw new NotFoundException(`Player with ID ${playerId} not found`);
    }

    // Cache player data
    await this.cachePlayerData(player);

    // Generate PDF
    const filePath = await this.pdfService.generatePlayerReport(player);

    // Save to history
    await this.saveToHistory({
      reportType: 'player',
      entityId: playerId,
      entityName: `${player.nombre} ${player.apellidos}`,
      filePath,
    });

    return filePath;
  }

  async generateMatchReport(matchId: number): Promise<string> {
    this.logger.log(`Generating report for match ${matchId}`);

    // Fetch match data
    const match = await this.matchesClient.getMatchById(matchId);
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    // Cache match data
    await this.cacheMatchData(match);

    // Generate PDF
    const filePath = await this.pdfService.generateMatchReport(match);

    // Save to history
    await this.saveToHistory({
      reportType: 'match',
      entityId: matchId,
      entityName: `${match.equipoLocalNombre} vs ${match.equipoVisitanteNombre}`,
      filePath,
    });

    return filePath;
  }

  async generateStatisticsReport(): Promise<string> {
    this.logger.log('Generating statistics report');

    // Gather data from all services
    const teams = await this.teamsClient.getAllTeams();
    const players = await this.playersClient.getAllPlayers();
    const matches = await this.matchesClient.getAllMatches();

    // Prepare statistics
    const stats = {
      totalTeams: teams.length,
      totalPlayers: players.length,
      totalMatches: matches.length,
      topTeams: teams
        .sort((a, b) => (b.partidosGanados || 0) - (a.partidosGanados || 0))
        .slice(0, 5),
      topPlayers: players
        .sort((a, b) => (b.promedioAnotaciones || 0) - (a.promedioAnotaciones || 0))
        .slice(0, 5),
    };

    // Generate PDF
    const filePath = await this.pdfService.generateStatisticsReport(stats);

    // Save to history
    await this.saveToHistory({
      reportType: 'statistics',
      entityId: null,
      entityName: 'Estadísticas Generales',
      filePath,
    });

    return filePath;
  }

  // RF-REP-01: Reporte de todos los equipos registrados
  async generateAllTeamsReport(): Promise<string> {
    this.logger.log('Generating all teams report');

    // Fetch all teams
    const teams = await this.teamsClient.getAllTeams();

    // Fetch all matches to calculate statistics
    const allMatches = await this.matchesClient.getAllMatches();

    // Enrich teams with match statistics
    const teamsWithStats = teams.map((team) => {
      // Filter matches where this team participated
      const teamMatches = allMatches.filter((match: any) => 
        match.equipoLocalId === team.id || match.equipoVisitanteId === team.id
      );

      // Calculate statistics
      const partidosJugados = teamMatches.length;
      
      let partidosGanados = 0;
      let partidosPerdidos = 0;
      let partidosEmpatados = 0;

      teamMatches.forEach((match: any) => {
        // Only count finished matches
        if (match.estado?.toLowerCase() === 'finalizado') {
          const isLocal = match.equipoLocalId === team.id;
          const marcadorEquipo = isLocal ? match.marcadorLocal : match.marcadorVisitante;
          const marcadorRival = isLocal ? match.marcadorVisitante : match.marcadorLocal;

          if (marcadorEquipo > marcadorRival) {
            partidosGanados++;
          } else if (marcadorEquipo < marcadorRival) {
            partidosPerdidos++;
          } else {
            partidosEmpatados++;
          }
        }
      });

      return {
        ...team,
        partidosJugados,
        partidosGanados,
        partidosPerdidos,
        partidosEmpatados,
      };
    });

    // Generate PDF
    const filePath = await this.pdfService.generateAllTeamsReport(teamsWithStats);

    // Save to history
    await this.saveToHistory({
      reportType: 'all-teams',
      entityId: null,
      entityName: 'Todos los Equipos Registrados',
      filePath,
    });

    return filePath;
  }

  // RF-REP-02: Reporte de jugadores por equipo
  async generateTeamPlayersReport(teamId: number): Promise<string> {
    this.logger.log(`Generating players report for team ${teamId}`);

    // Fetch team data
    const team = await this.teamsClient.getTeamById(teamId);
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Fetch players of the team
    const players = await this.playersClient.getPlayersByTeam(teamId);

    // Generate PDF
    const filePath = await this.pdfService.generateTeamPlayersReport(team, players);

    // Save to history
    await this.saveToHistory({
      reportType: 'team-players',
      entityId: teamId,
      entityName: `Jugadores de ${team.nombre}`,
      filePath,
    });

    return filePath;
  }

  // RF-REP-03: Reporte de historial de partidos
  async generateMatchHistoryReport(): Promise<string> {
    this.logger.log('Generating match history report');

    // Fetch all matches
    const matches = await this.matchesClient.getAllMatches();
    
    // Filter finished matches
    const finishedMatches = matches.filter((m: any) => m.estado === 'finalizado');

    // Generate PDF
    const filePath = await this.pdfService.generateMatchHistoryReport(finishedMatches);

    // Save to history
    await this.saveToHistory({
      reportType: 'match-history',
      entityId: null,
      entityName: 'Historial de Partidos',
      filePath,
    });

    return filePath;
  }

  // RF-REP-04: Reporte de roster por partido
  async generateMatchRosterReport(matchId: number): Promise<string> {
    this.logger.log(`Generating roster report for match ${matchId}`);

    // Fetch match data
    const match = await this.matchesClient.getMatchById(matchId);
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    // Enrich match with team names
    let equipoLocalNombre = 'Equipo Local';
    let equipoVisitanteNombre = 'Equipo Visitante';

    try {
      if (match.equipoLocalId) {
        const equipoLocal = await this.teamsClient.getTeamById(match.equipoLocalId);
        equipoLocalNombre = equipoLocal?.nombre || equipoLocalNombre;
      }
      if (match.equipoVisitanteId) {
        const equipoVisitante = await this.teamsClient.getTeamById(match.equipoVisitanteId);
        equipoVisitanteNombre = equipoVisitante?.nombre || equipoVisitanteNombre;
      }
    } catch (error) {
      this.logger.warn('Could not fetch team names:', error.message);
    }

    const enrichedMatch = {
      ...match,
      equipoLocalNombre,
      equipoVisitanteNombre,
    };

    // Fetch roster data
    const roster = await this.matchesClient.getMatchRoster(matchId);

    // Generate PDF
    const filePath = await this.pdfService.generateMatchRosterReport(enrichedMatch, roster);

    // Save to history
    await this.saveToHistory({
      reportType: 'match-roster',
      entityId: matchId,
      entityName: `Roster: ${match.equipoLocalNombre} vs ${match.equipoVisitanteNombre}`,
      filePath,
    });

    return filePath;
  }

  // RF-REP-05: Reporte de estadísticas por jugador
  async generatePlayerStatsReport(playerId: string): Promise<string> {
    this.logger.log(`Generating stats report for player ${playerId}`);

    // Fetch player data
    const player = await this.playersClient.getPlayerById(playerId);
    if (!player) {
      throw new NotFoundException(`Player with ID ${playerId} not found`);
    }

    // Fetch player statistics from matches
    const stats = await this.matchesClient.getPlayerStats(playerId);

    // Generate PDF
    const filePath = await this.pdfService.generatePlayerStatsReport(player, stats);

    // Save to history
    await this.saveToHistory({
      reportType: 'player-stats',
      entityId: null, // playerId is string (MongoDB)
      entityName: `Estadísticas de ${player.nombreCompleto || player.nombre}`,
      filePath,
    });

    return filePath;
  }

  async getReportHistory(): Promise<ReportHistory[]> {
    return this.reportHistoryRepo.find({
      order: { generatedAt: 'DESC' },
      take: 50,
    });
  }

  async getReportById(id: number): Promise<ReportHistory> {
    const report = await this.reportHistoryRepo.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  private async saveToHistory(data: {
    reportType: string;
    entityId: number;
    entityName: string;
    filePath: string;
  }): Promise<void> {
    const stats = fs.statSync(data.filePath);
    const fileName = data.filePath.split(/[\\/]/).pop();

    const history = this.reportHistoryRepo.create({
      reportType: data.reportType,
      entityId: data.entityId,
      entityName: data.entityName,
      fileName,
      filePath: data.filePath,
      fileSize: stats.size,
      metadata: JSON.stringify({ generatedBy: 'system' }),
    });

    await this.reportHistoryRepo.save(history);
    this.logger.log(`Report saved to history: ${fileName}`);
  }

  private async cacheTeamData(team: any): Promise<void> {
    const cached = this.cachedTeamRepo.create({
      id: team.id,
      nombre: team.nombre,
      ciudad: team.ciudad,
      entrenador: team.entrenador,
      logo: team.logo,
      partidosJugados: team.partidosJugados || 0,
      partidosGanados: team.partidosGanados || 0,
      partidosPerdidos: team.partidosPerdidos || 0,
    });

    await this.cachedTeamRepo.save(cached);
  }

  private async cachePlayerData(player: any): Promise<void> {
    const cached = this.cachedPlayerRepo.create({
      id: player.id,
      nombre: player.nombre,
      apellidos: player.apellidos,
      posicion: player.posicion,
      numeroCamiseta: player.numeroCamiseta,
      equipoId: player.equipoId,
      equipoNombre: player.equipoNombre,
      promedioAnotaciones: player.promedioAnotaciones || 0,
      promedioRebotes: player.promedioRebotes || 0,
      promedioAsistencias: player.promedioAsistencias || 0,
    });

    await this.cachedPlayerRepo.save(cached);
  }

  private async cacheMatchData(match: any): Promise<void> {
    const cached = this.cachedMatchRepo.create({
      id: match.id,
      equipoLocalId: match.equipoLocalId,
      equipoLocalNombre: match.equipoLocalNombre,
      equipoVisitanteId: match.equipoVisitanteId,
      equipoVisitanteNombre: match.equipoVisitanteNombre,
      marcadorLocal: match.marcadorLocal || 0,
      marcadorVisitante: match.marcadorVisitante || 0,
      fecha: match.fecha,
      ubicacion: match.ubicacion,
      estado: match.estado,
    });

    await this.cachedMatchRepo.save(cached);
  }
}
