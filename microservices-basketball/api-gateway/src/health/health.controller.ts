import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@ApiTags('gateway')
@Controller('health')
export class HealthController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check del API Gateway' })
  @ApiResponse({ status: 200, description: 'Gateway saludable' })
  getHealth() {
    return {
      status: 'healthy',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  @Get('services')
  @ApiOperation({ summary: 'Estado de todos los microservicios' })
  @ApiResponse({ status: 200, description: 'Estado de servicios' })
  async getServicesHealth() {
    const services = [
      { name: 'teams', url: this.configService.get('TEAMS_SERVICE_URL'), endpoint: '/health' },
      { name: 'players', url: this.configService.get('PLAYERS_SERVICE_URL'), endpoint: '/health' },
      { name: 'matches', url: this.configService.get('MATCHES_SERVICE_URL'), endpoint: '/api/health' },
      { name: 'reports', url: this.configService.get('REPORTS_SERVICE_URL'), endpoint: '/api/health' },
      { name: 'auth', url: this.configService.get('AUTH_SERVICE_URL'), endpoint: '/api/health' },
    ];

    const results = await Promise.allSettled(
      services.map(async (service) => {
        try {
          const response = await firstValueFrom(
            this.httpService.get(`${service.url}${service.endpoint}`, {
              timeout: 3000,
            }),
          );
          return {
            name: service.name,
            status: 'healthy',
            url: service.url,
            responseTime: response.headers['x-response-time'] || 'N/A',
          };
        } catch (error) {
          return {
            name: service.name,
            status: 'unhealthy',
            url: service.url,
            error: error.message,
          };
        }
      }),
    );

    const servicesStatus = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        name: services[index].name,
        status: 'unhealthy',
        url: services[index].url,
        error: 'Request failed',
      };
    });

    const allHealthy = servicesStatus.every((s) => s.status === 'healthy');

    return {
      gateway: 'healthy',
      timestamp: new Date().toISOString(),
      services: servicesStatus,
      overallStatus: allHealthy ? 'all_services_healthy' : 'some_services_down',
    };
  }
}
