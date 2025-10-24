import { Controller, All, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from './proxy.service';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('players')
@Controller()
@UseGuards(ThrottlerGuard)
export class PlayersProxyController {
  private readonly logger = new Logger(PlayersProxyController.name);

  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All('players*')
  @ApiOperation({ summary: 'Proxy a Players Service (Flask/Python)' })
  async proxy(@Req() req: Request, @Res() res: Response) {
    const serviceUrl = this.configService.get('PLAYERS_SERVICE_URL') || 'http://localhost:5002';
    
    // El request viene como /api/players o /api/players/123
    // Players Service también usa /api/players, así que pasamos el path tal cual
    const path = req.url;
    
    this.logger.log(`Proxying to Players Service: ${req.method} ${serviceUrl}${path}`);
    
    try {
      const result = await this.proxyService.forwardRequest(
        serviceUrl,
        path,
        req.method,
        req.body,
        req.headers,
        req.query,
      );
      
      res.json(result);
    } catch (error) {
      this.logger.error(`Error proxying to Players Service: ${error.message}`);
      res.status(error.status || 500).json(error.response || error);
    }
  }
}
