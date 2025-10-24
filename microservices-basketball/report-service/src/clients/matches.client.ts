import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MatchesClient {
  private readonly logger = new Logger(MatchesClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('MATCHES_SERVICE_URL');
  }

  async getAllMatches(): Promise<any[]> {
    try {
      this.logger.log(`Fetching matches from: ${this.baseUrl}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}`),
      );
      
      // Extract data from different response formats
      const data = response.data;
      this.logger.log(`Matches response type: ${typeof data}, is array: ${Array.isArray(data)}`);
      
      // If response has nested data property, extract it
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
          this.logger.log(`Returning array directly, length: ${data.length}`);
          return data;
        }
        if (data.data && Array.isArray(data.data)) {
          this.logger.log(`Returning data.data array, length: ${data.data.length}`);
          return data.data;
        }
        if (data.matches && Array.isArray(data.matches)) {
          this.logger.log(`Returning data.matches array, length: ${data.matches.length}`);
          return data.matches;
        }
      }
      
      this.logger.warn('Unexpected response format for all matches:', JSON.stringify(data).substring(0, 200));
      return [];
    } catch (error) {
      this.logger.warn('Matches service not available:', error.message);
      return [];
    }
  }

  async getMatchById(id: number): Promise<any> {
    try {
      this.logger.log(`Fetching match ${id} from: ${this.baseUrl}/${id}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/${id}`),
      );
      
      const data = response.data;
      this.logger.log(`Match response type: ${typeof data}, is object: ${typeof data === 'object'}`);
      
      // Extract data from different response formats
      if (data && typeof data === 'object') {
        // If it's a direct object, return it
        if (!Array.isArray(data)) {
          // Check if it has nested data property
          if (data.data && typeof data.data === 'object') {
            this.logger.log('Returning data.data object');
            return data.data;
          }
          this.logger.log('Returning data object directly');
          return data;
        }
      }
      
      this.logger.warn(`Unexpected match format for ID ${id}:`, JSON.stringify(data).substring(0, 200));
      return null;
    } catch (error) {
      this.logger.warn(`Match ${id} not available:`, error.message);
      return null;
    }
  }

  async getMatchesByTeam(teamId: number): Promise<any[]> {
    try {
      this.logger.log(`Fetching matches for team ${teamId}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/team/${teamId}`),
      );
      return response.data;
    } catch (error) {
      this.logger.warn(`Matches for team ${teamId} not available:`, error.message);
      return [];
    }
  }

  async getMatchRoster(matchId: number): Promise<any[]> {
    try {
      this.logger.log(`Fetching roster for match ${matchId}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/${matchId}/jugadores`),
      );
      
      const data = response.data;
      this.logger.log(`Roster response type: ${typeof data}, is array: ${Array.isArray(data)}`);
      
      // Extract data from different response formats
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
          this.logger.log(`Returning array directly, length: ${data.length}`);
          return data;
        }
        if (data.data && Array.isArray(data.data)) {
          this.logger.log(`Returning data.data array, length: ${data.data.length}`);
          return data.data;
        }
        if (data.roster && Array.isArray(data.roster)) {
          this.logger.log(`Returning data.roster array, length: ${data.roster.length}`);
          return data.roster;
        }
      }
      
      this.logger.warn(`Unexpected roster format for match ${matchId}:`, JSON.stringify(data).substring(0, 200));
      return [];
    } catch (error) {
      this.logger.warn(`Roster for match ${matchId} not available:`, error.message);
      return [];
    }
  }

  async getPlayerStats(playerId: string): Promise<any> {
    try {
      this.logger.log(`Fetching stats for player ${playerId}`);
      // Get all matches and filter stats for this player
      const matches = await this.getAllMatches();
      const playerStats = {
        partidosJugados: 0,
        totalPuntos: 0,
        totalRebotes: 0,
        totalAsistencias: 0,
        totalFaltas: 0,
        promedioPuntos: 0,
        promedioRebotes: 0,
        promedioAsistencias: 0,
      };

      // For each match, try to get stats for this player
      for (const match of matches) {
        try {
          const roster = await this.getMatchRoster(match.id);
          const playerInMatch = roster.find((stat: any) => stat.jugadorId === playerId);
          
          if (playerInMatch) {
            playerStats.partidosJugados++;
            playerStats.totalPuntos += playerInMatch.puntos || 0;
            playerStats.totalRebotes += playerInMatch.rebotes || 0;
            playerStats.totalAsistencias += playerInMatch.asistencias || 0;
            playerStats.totalFaltas += playerInMatch.faltas || 0;
          }
        } catch (error) {
          // Skip matches where we can't get roster
          continue;
        }
      }

      // Calculate averages
      if (playerStats.partidosJugados > 0) {
        playerStats.promedioPuntos = playerStats.totalPuntos / playerStats.partidosJugados;
        playerStats.promedioRebotes = playerStats.totalRebotes / playerStats.partidosJugados;
        playerStats.promedioAsistencias = playerStats.totalAsistencias / playerStats.partidosJugados;
      }

      return playerStats;
    } catch (error) {
      this.logger.warn(`Stats for player ${playerId} not available:`, error.message);
      return {
        partidosJugados: 0,
        totalPuntos: 0,
        totalRebotes: 0,
        totalAsistencias: 0,
        totalFaltas: 0,
        promedioPuntos: 0,
        promedioRebotes: 0,
        promedioAsistencias: 0,
      };
    }
  }
}
