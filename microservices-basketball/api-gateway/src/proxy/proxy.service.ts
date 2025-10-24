import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class ProxyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async forwardRequest(
    serviceUrl: string,
    path: string,
    method: string,
    body?: any,
    headers?: any,
    queryParams?: any,
  ) {
    // Generar ID único para tracking
    const requestId = Math.random().toString(36).substring(7);
    const startTime = Date.now();
    
    try {
      const fullUrl = `${serviceUrl}${path}`;
      console.log(`Request ID: ${requestId}`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log('ProxyService.forwardRequest:');
      console.log('  Full URL:', fullUrl);
      console.log('  Method:', method);
      console.log('  Body:', JSON.stringify(body));
      console.log('  Authorization:', headers?.authorization ? 'Presente' : 'NO presente');
      
      const config: AxiosRequestConfig = {
        method: method as any,
        url: fullUrl,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Forwarded-By': 'API-Gateway',
          'X-Request-ID': requestId,
          // Pasar el token de autorización si existe
          ...(headers?.authorization && { 'Authorization': headers.authorization }),
        },
        params: queryParams,
        timeout: 10000, // 10 segundos
      };

      if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        config.data = body;
      }

      console.log('  Enviando request...');
      
      const response = await firstValueFrom(this.httpService.request(config));
      const responseTime = Date.now() - startTime;
      
      console.log(`  [${requestId}] Respuesta recibida: ${response.status}`);
      console.log(`  [${requestId}] Response time: ${responseTime}ms`);
      return response.data;
    } catch (error) {
      const errorTime = Date.now() - startTime;
      console.error(`  [${requestId}] Error después de ${errorTime}ms`);
      console.error('  Error code:', error.code);
      console.error('  Error message:', error.message);
      
      if (error.response) {
        // El servicio responde con un error (400, 401, 403, 404, 500, etc.)
        console.error('   Response error:', {
          status: error.response.status,
          data: error.response.data,
        });
        throw new HttpException(
          {
            ...error.response.data,
            source: 'downstream-service',
            requestId: requestId,
            timestamp: new Date().toISOString(),
          },
          error.response.status,
        );
      } else if (error.code === 'ECONNREFUSED') {
        // Servicio no está corriendo
        console.error('   Connection refused - Service is down');
        throw new HttpException(
          {
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            message: 'Service is not available',
            service: serviceUrl,
            error: 'Connection refused',
            suggestion: 'Please ensure the service is running',
            requestId: requestId,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else if (error.code === 'ETIMEDOUT') {
        // Timeout
        console.error('  Request timeout');
        throw new HttpException(
          {
            statusCode: HttpStatus.GATEWAY_TIMEOUT,
            message: 'Service timeout',
            service: serviceUrl,
            error: 'Request timeout',
            requestId: requestId,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.GATEWAY_TIMEOUT,
        );
      } else if (error.request) {
        // No hubo respuesta del servicio
        console.error('  No response from service');
        throw new HttpException(
          {
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            message: 'Service unavailable',
            service: serviceUrl,
            error: 'No response from service',
            requestId: requestId,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        // Error en la configuración de la request
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Gateway error',
            error: error.message,
            requestId: requestId,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
