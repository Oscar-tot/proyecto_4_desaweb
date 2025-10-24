import { Controller, All, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from './proxy.service';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('auth')
@Controller()
@UseGuards(ThrottlerGuard)
export class AuthProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All('auth/*')
  @ApiOperation({ summary: 'Proxy a Auth Service - Authentication' })
  async proxyAuth(@Req() req: Request, @Res() res: Response) {
    const serviceUrl = this.configService.get('AUTH_SERVICE_URL');
    
    // Debug: Verificar que la variable de entorno se carga correctamente
    if (!serviceUrl) {
      console.error(' ERROR: AUTH_SERVICE_URL no está configurada!');
      console.error(' Variables disponibles:', {
        AUTH_SERVICE_URL: this.configService.get('AUTH_SERVICE_URL'),
        PORT: this.configService.get('PORT'),
        NODE_ENV: this.configService.get('NODE_ENV'),
      });
      return res.status(500).json({
        error: 'Configuración incorrecta del API Gateway',
        message: 'AUTH_SERVICE_URL no está definida'
      });
    }
    
    const path = req.path.replace('/api', '');
    
    console.log('   API Gateway - Auth Proxy:');
    console.log('   Request path:', req.path);
    console.log('   Path procesado:', path);
    console.log('   Service URL:', serviceUrl);
    console.log('   URL final:', `${serviceUrl}/api${path}`);
    console.log('   Method:', req.method);
    
    try {
      const result = await this.proxyService.forwardRequest(
        serviceUrl,
        `/api${path}`,
        req.method,
        req.body,
        req.headers,
        req.query,
      );
      
      res.json(result);
    } catch (error) {
      console.error(' Error en proxy:', error);
      res.status(error.status || 500).json(error.response || error);
    }
  }

  @All('users*')
  @ApiOperation({ summary: 'Proxy a Auth Service - Users Management' })
  async proxyUsers(@Req() req: Request, @Res() res: Response) {
    const serviceUrl = this.configService.get('AUTH_SERVICE_URL');
    
    // Debug: Verificar que la variable de entorno se carga correctamente
    if (!serviceUrl) {
      console.error(' ERROR: AUTH_SERVICE_URL no está configurada!');
      return res.status(500).json({
        error: 'Configuración incorrecta del API Gateway',
        message: 'AUTH_SERVICE_URL no está definida'
      });
    }
    
    // Validar que el token esté presente para rutas protegidas (excepto OPTIONS)
    const requiresAuth = req.method !== 'OPTIONS';
    if (requiresAuth && !req.headers.authorization) {
      console.warn(' Request sin token de autorización');
      console.warn(' Path:', req.path);
      console.warn(' Method:', req.method);
      return res.status(401).json({
        statusCode: 401,
        message: 'Authorization header is required',
        path: req.path,
        timestamp: new Date().toISOString(),
      });
    }
    
    const path = req.path.replace('/api', ''); // Remover el /api del inicio ya que el servicio ya lo tiene
    
    console.log(' API Gateway - Users Proxy:');
    console.log('   Request path:', req.path);
    console.log('   Path procesado:', path);
    console.log('   Service URL:', serviceUrl);
    console.log('   URL final:', `${serviceUrl}/api${path}`);
    console.log('   Method:', req.method);
    console.log('   Authorization:', req.headers.authorization ? 'Presente ✅' : 'NO presente ❌');
    
    try {
      const result = await this.proxyService.forwardRequest(
        serviceUrl,
        `/api${path}`,
        req.method,
        req.body,
        req.headers,
        req.query,
      );
      
      res.json(result);
    } catch (error) {
      console.error(' Error en proxy users:', error.message);
      res.status(error.status || 500).json(error.response || error);
    }
  }
}
