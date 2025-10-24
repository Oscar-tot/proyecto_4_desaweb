import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RedirectService } from '../services/redirect.service';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private redirectService: RedirectService
  ) {}

  canActivate(): boolean {
    const user = this.authService.currentUser();
    const isAuthenticated = this.authService.isAuthenticated();
    const isTokenValid = this.authService.isTokenValid();
    
    console.log('👤 UserGuard: Verificando acceso de usuario');
    console.log('Usuario actual:', user);
    console.log('Está autenticado:', isAuthenticated);
    console.log('Token válido:', isTokenValid);
    
    // Verificar que esté autenticado y el token sea válido
    if (!isAuthenticated || !isTokenValid) {
      console.log('UserGuard: Usuario no autenticado o token inválido');
      this.redirectService.handleLogout();
      return false;
    }
    
    // Verificar que tenga rol de usuario normal (no admin)
    if (user && user.role !== 'Admin' && user.role !== 'admin' && user.role !== 'Administrator') {
      console.log('UserGuard: Acceso de usuario normal autorizado');
      return true;
    }
    
    console.log('⛔ UserGuard: Acceso denegado - Es administrador');
    console.log('Rol del usuario:', user?.role);
    
    // Los administradores deben ir a su panel administrativo
    this.redirectService.redirectToUserDashboard();
    return false;
  }
}