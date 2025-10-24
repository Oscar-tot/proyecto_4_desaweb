import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check del servicio' })
  @ApiResponse({ status: 200, description: 'Servicio saludable' })
  async check() {
    try {
      // Verificar conexión a base de datos
      await this.dataSource.query('SELECT 1');
      
      return {
        status: 'healthy',
        service: 'auth-service',
        timestamp: new Date().toISOString(),
        database: 'connected',
        version: '1.0.0',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'auth-service',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      };
    }
  }
}
