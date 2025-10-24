import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@ApiTags('reports')
@Controller()
export class ReportsProxyController {
  private readonly logger = new Logger(ReportsProxyController.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @All('reports*')
  @ApiOperation({ summary: 'Proxy a Reports Service (NestJS + PDFKit)' })
  async proxyToReportsService(@Req() req: Request, @Res() res: Response) {
    const serviceUrl = this.configService.get('REPORTS_SERVICE_URL') || 'http://localhost:5003';
    const fullUrl = `${serviceUrl}${req.url}`;
    
    this.logger.log(`📊 Proxying to Reports Service: ${req.method} ${fullUrl}`);
    
    try {
      // Para los reportes PDF, necesitamos manejar respuestas binarias
      const response = await firstValueFrom(
        this.httpService.request({
          method: req.method as any,
          url: fullUrl,
          headers: {
            'Authorization': req.headers.authorization,
          },
          data: req.body,
          params: req.query,
          responseType: 'arraybuffer', // Importante: recibir como buffer binario
        })
      );

      // Reenviar los headers del PDF
      if (response.headers['content-type']) {
        res.set('Content-Type', response.headers['content-type']);
      }
      if (response.headers['content-disposition']) {
        res.set('Content-Disposition', response.headers['content-disposition']);
      }
      if (response.headers['content-length']) {
        res.set('Content-Length', response.headers['content-length']);
      }

      // Enviar el buffer binario directamente
      res.send(Buffer.from(response.data));
    } catch (error) {
      this.logger.error(`Error proxying to Reports Service: ${error.message}`);
      res.status(error.response?.status || 500).json({
        error: 'Error generando el reporte',
        message: error.message,
      });
    }
  }
}

