import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RedirectService } from '../services/redirect.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private redirectService: RedirectService
  ) {}

  canActivate(): boolean {
    const user = this.authService.currentUser();
    const isAuthenticated = this.authService.isAuthenticated();
    const isTokenValid = this.authService.isTokenValid();
    
    console.log(' AdminGuard: Verificando acceso administrativo');
    console.log('Usuario actual:', user);
    console.log('Está autenticado:', isAuthenticated);
    console.log('Token válido:', isTokenValid);
    
    // Verificar que esté autenticado y el token sea válido
    if (!isAuthenticated || !isTokenValid) {
      console.log(' AdminGuard: Usuario no autenticado o token inválido');
      this.redirectService.handleLogout();
      return false;
    }
    
    // Verificar que tenga rol de administrador
    if (user && (user.role === 'Admin' || user.role === 'admin' || user.role === 'Administrator')) {
      console.log(' AdminGuard: Acceso administrativo autorizado');
      return true;
    }
    
    console.log(' AdminGuard: Acceso denegado - No es administrador');
    console.log('Rol del usuario:', user?.role);
    
    // Si es un usuario normal, redirigir a su panel
    if (user && user.role !== 'Admin' && user.role !== 'admin' && user.role !== 'Administrator') {
      this.redirectService.redirectToUserDashboard();
    } else {
      this.redirectService.redirectToUnauthorized();
    }
    
    return false;
  }
}