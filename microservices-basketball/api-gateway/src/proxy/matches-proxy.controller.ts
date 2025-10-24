import { Controller, All, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from './proxy.service';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('matches')
@Controller()
@UseGuards(ThrottlerGuard)
export class MatchesProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All('matches*')
  @ApiOperation({ summary: 'Proxy a Matches Service (NestJS)' })
  async proxy(@Req() req: Request, @Res() res: Response) {
    const serviceUrl = this.configService.get('MATCHES_SERVICE_URL');
    const path = req.url;
    
    console.log('Proxying to Matches Service:', req.method, serviceUrl + path);
    
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
      console.error('Error proxying to Matches Service:', error.message);
      res.status(error.status || 500).json(error.response || error);
    }
  }
}
