import { Controller, All, Req, Res, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from './proxy.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import axios from 'axios';

@ApiTags('auth')
@Controller()
@UseGuards(ThrottlerGuard)
export class AuthProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  // ============================================
  // RUTAS OAUTH - Proxy con seguimiento de redirecciones
  // ============================================
  
  @Get('auth/google')
  @ApiOperation({ summary: 'Iniciar autenticación con Google' })
  async googleAuth(@Req() req: Request, @Res() res: Response) {
    await this.handleOAuthRedirect(req, res, '/api/auth/google');
  }

  @Get('auth/google/callback')
  @ApiOperation({ summary: 'Callback de Google OAuth' })
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    await this.handleOAuthCallback(req, res, '/api/auth/google/callback');
  }

  @Get('auth/facebook')
  @ApiOperation({ summary: 'Iniciar autenticación con Facebook' })
  async facebookAuth(@Req() req: Request, @Res() res: Response) {
    await this.handleOAuthRedirect(req, res, '/api/auth/facebook');
  }

  @Get('auth/facebook/callback')
  @ApiOperation({ summary: 'Callback de Facebook OAuth' })
  async facebookCallback(@Req() req: Request, @Res() res: Response) {
    await this.handleOAuthCallback(req, res, '/api/auth/facebook/callback');
  }

  @Get('auth/github')
  @ApiOperation({ summary: 'Iniciar autenticación con GitHub' })
  async githubAuth(@Req() req: Request, @Res() res: Response) {
    await this.handleOAuthRedirect(req, res, '/api/auth/github');
  }

  @Get('auth/github/callback')
  @ApiOperation({ summary: 'Callback de GitHub OAuth' })
  async githubCallback(@Req() req: Request, @Res() res: Response) {
    await this.handleOAuthCallback(req, res, '/api/auth/github/callback');
  }

  // ============================================
  // Métodos auxiliares para OAuth
  // ============================================

  private async handleOAuthRedirect(req: Request, res: Response, path: string) {
    const serviceUrl = this.configService.get('AUTH_SERVICE_URL');
    const fullUrl = `${serviceUrl}${path}`;
    
    console.log('🔄 OAuth Inicio:', fullUrl);
    
    try {
      // Hacer request al auth-service SIN seguir redirecciones
      const response = await axios.get(fullUrl, {
        maxRedirects: 0, // No seguir redirecciones automáticamente
        validateStatus: (status) => status >= 200 && status < 400, // Aceptar 3xx
      });

      // Si el auth-service devuelve una redirección, reenviarla al navegador
      if (response.status >= 300 && response.status < 400) {
        const redirectUrl = response.headers.location;
        console.log('  ↪️ Redirigiendo a:', redirectUrl);
        return res.redirect(redirectUrl);
      }

      // Si es una respuesta normal, enviarla
      return res.status(response.status).send(response.data);
    } catch (error) {
      if (error.response && error.response.status >= 300 && error.response.status < 400) {
        // Axios lanza error en redirecciones si maxRedirects: 0
        const redirectUrl = error.response.headers.location;
        console.log('  ↪️ Redirigiendo a:', redirectUrl);
        return res.redirect(redirectUrl);
      }
      console.error('❌ Error en OAuth redirect:', error.message);
      return res.status(500).json({ error: 'OAuth initialization failed' });
    }
  }

  private async handleOAuthCallback(req: Request, res: Response, path: string) {
    const serviceUrl = this.configService.get('AUTH_SERVICE_URL');
    const queryString = new URLSearchParams(req.query as any).toString();
    const fullUrl = `${serviceUrl}${path}?${queryString}`;
    
    console.log('🔙 OAuth Callback:', fullUrl);
    
    try {
      // Hacer request al auth-service SIN seguir redirecciones
      const response = await axios.get(fullUrl, {
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
      });

      // Si el auth-service devuelve una redirección al frontend, reenviarla
      if (response.status >= 300 && response.status < 400) {
        const redirectUrl = response.headers.location;
        console.log('  ✅ Redirigiendo al frontend:', redirectUrl);
        return res.redirect(redirectUrl);
      }

      return res.status(response.status).send(response.data);
    } catch (error) {
      if (error.response && error.response.status >= 300 && error.response.status < 400) {
        const redirectUrl = error.response.headers.location;
        console.log('  ✅ Redirigiendo al frontend:', redirectUrl);
        return res.redirect(redirectUrl);
      }
      console.error('❌ Error en OAuth callback:', error.message);
      return res.status(500).json({ error: 'OAuth callback failed' });
    }
  }

  // ============================================
  // RUTAS NORMALES - Proxy JSON
  // ============================================

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
