import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  // Endpoints que requieren rol de administrador
  private adminEndpoints = [
    '/api/users',
    '/api/equipos',
    '/api/jugadores',
    '/api/scoreboard'
  ];
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    console.log('🔍 AuthInterceptor: Interceptando request a:', req.url);
    
    // Obtener el token de autenticación
    const authToken = this.authService.getToken();
    const currentUser = this.authService.currentUser();
    
    // Clonar la request y añadir el header de autorización si existe el token
    let authReq = req;
    if (authToken) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authToken}`)
      });
    }

    // Verificar si el endpoint requiere rol de administrador
    const requiresAdmin = this.adminEndpoints.some(endpoint => req.url.includes(endpoint));
    
    if (requiresAdmin) {
      console.log('🛡️ AuthInterceptor: Endpoint requiere rol de administrador');
      console.log('👤 Usuario actual:', currentUser);
      
      if (!currentUser) {
        console.log('⛔ AuthInterceptor: No hay usuario logueado');
        const forbiddenError = new HttpErrorResponse({
          error: { message: 'Acceso denegado. Debe iniciar sesión.' },
          status: 403,
          statusText: 'Forbidden'
        });
        return throwError(() => forbiddenError);
      }
      
      // Verificar roles del usuario (ahora es un array)
      const roles = currentUser.roles || [];
      const isAdmin = roles.some((role: string) => 
        role.toLowerCase() === 'admin' || role.toLowerCase() === 'administrator'
      );
      
      if (!isAdmin) {
        console.log('⛔ AuthInterceptor: Acceso denegado - Usuario no es administrador');
        console.log('🔍 Roles del usuario:', roles);
        
        const forbiddenError = new HttpErrorResponse({
          error: { message: 'Acceso denegado. Se requiere rol de administrador.' },
          status: 403,
          statusText: 'Forbidden'
        });
        
        return throwError(() => forbiddenError);
      }
      
      console.log('AuthInterceptor: Acceso administrativo autorizado');
    }

    // Continuar con la request y manejar errores de autenticación
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('AuthInterceptor: Error en request:', error.status, error.message);
        
        if (error.status === 401) {
          // Token expirado o inválido
          console.log('🔓 AuthInterceptor: Token inválido - Cerrando sesión');
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          // Acceso prohibido por falta de permisos
          console.log('⛔ AuthInterceptor: Acceso prohibido - Redirigiendo a página no autorizada');
          this.router.navigate(['/unauthorized']);
        }
        
        return throwError(() => error);
      })
    );
  }
}