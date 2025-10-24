import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PlayersClient {
  private readonly logger = new Logger(PlayersClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('PLAYERS_SERVICE_URL');
  }

  async getAllPlayers(): Promise<any[]> {
    try {
      this.logger.log(`Fetching players from: ${this.baseUrl}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}`),
      );
      return response.data;
    } catch (error) {
      this.logger.warn('Players service not available:', error.message);
      return [];
    }
  }

  async getPlayerById(id: number | string): Promise<any> {
    try {
      this.logger.log(`Fetching player ${id} from: ${this.baseUrl}/${id}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/${id}`),
      );
      // Extract data from response format { success, data }
      return response.data.data || response.data;
    } catch (error) {
      this.logger.warn(`Player ${id} not available:`, error.message);
      return null;
    }
  }

  async getPlayersByTeam(teamId: number): Promise<any[]> {
    try {
      this.logger.log(`Fetching players for team ${teamId}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/team/${teamId}`),
      );
      
      // Extract data from different response formats
      const data = response.data;
      this.logger.log(`Players response type: ${typeof data}, is array: ${Array.isArray(data)}`);
      
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
        if (data.players && Array.isArray(data.players)) {
          this.logger.log(`Returning data.players array, length: ${data.players.length}`);
          return data.players;
        }
      }
      
      this.logger.warn(`Unexpected response format for team ${teamId} players:`, JSON.stringify(data).substring(0, 200));
      return [];
    } catch (error) {
      this.logger.warn(`Players for team ${teamId} not available:`, error.message);
      return [];
    }
  }
}
