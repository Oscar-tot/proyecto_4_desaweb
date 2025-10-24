import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TeamsClient {
  private readonly logger = new Logger(TeamsClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('TEAMS_SERVICE_URL');
  }

  async getAllTeams(): Promise<any[]> {
    try {
      this.logger.log(`Fetching teams from: ${this.baseUrl}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}`),
      );
      
      const data = response.data;
      this.logger.log(`Teams response type: ${typeof data}, is array: ${Array.isArray(data)}`);
      
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
        if (data.teams && Array.isArray(data.teams)) {
          this.logger.log(`Returning data.teams array, length: ${data.teams.length}`);
          return data.teams;
        }
      }
      
      this.logger.warn('Unexpected response format for teams:', JSON.stringify(data).substring(0, 200));
      return [];
    } catch (error) {
      this.logger.error('Error fetching teams:', error.message);
      throw error;
    }
  }

  async getTeamById(id: number): Promise<any> {
    try {
      this.logger.log(`Fetching team ${id} from: ${this.baseUrl}/${id}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/${id}`),
      );
      
      const data = response.data;
      this.logger.log(`Team response type: ${typeof data}, is object: ${typeof data === 'object'}`);
      
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
      
      this.logger.warn(`Unexpected team format for ID ${id}:`, JSON.stringify(data).substring(0, 200));
      return null;
    } catch (error) {
      this.logger.error(`Error fetching team ${id}:`, error.message);
      throw error;
    }
  }
}
