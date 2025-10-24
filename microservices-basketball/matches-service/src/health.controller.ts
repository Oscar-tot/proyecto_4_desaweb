import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Health check del servicio' })
  @ApiResponse({ status: 200, description: 'Servicio saludable' })
  @ApiResponse({ status: 503, description: 'Servicio no disponible' })
  async check() {
    try {
      // Verificar conexión a MySQL
      await this.dataSource.query('SELECT 1');

      return {
        status: 'healthy',
        service: 'matches-service',
        timestamp: new Date().toISOString(),
        database: 'connected',
        version: '1.0.0',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'matches-service',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      };
    }
  }
}
