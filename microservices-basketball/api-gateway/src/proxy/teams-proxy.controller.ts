import { Controller, All, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from './proxy.service';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('teams')
@Controller()
@UseGuards(ThrottlerGuard)
export class TeamsProxyController {
  private readonly logger = new Logger(TeamsProxyController.name);

  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All('teams*')
  @ApiOperation({ summary: 'Proxy a Teams Service (.NET)' })
  async proxy(@Req() req: Request, @Res() res: Response) {
    const serviceUrl = this.configService.get('TEAMS_SERVICE_URL') || 'http://localhost:5001';
    
    // Construir el path: el request viene como /api/teams o /api/teams/1
    // Necesitamos enviarlo a Teams Service como /api/teams o /api/teams/1
    const path = req.url.replace('/api/', '/api/');
    
    this.logger.log(`Proxying to Teams Service: ${req.method} ${serviceUrl}${path}`);
    this.logger.log(`Original req.url: ${req.url}`);
    
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
      this.logger.error(`Error proxying to Teams Service: ${error.message}`);
      res.status(error.status || 500).json(error.response || error);
    }
  }
}
