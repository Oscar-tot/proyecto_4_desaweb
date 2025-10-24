import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RedirectService {
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Redirige al usuario a su dashboard correspondiente según su rol
   */
  redirectToUserDashboard(): void {
    const user = this.authService.currentUser();
    
    console.log('🔄 RedirectService: Redirigiendo usuario:', user);
    console.log('🔄 RedirectService: Roles del usuario:', user?.roles);
    
    if (!user) {
      console.log('RedirectService: No hay usuario, redirigiendo a login');
      this.router.navigate(['/login']);
      return;
    }
    
    // El backend devuelve roles como array de strings ['admin', 'user', etc]
    const roles = user.roles || [];
    console.log('🔍 RedirectService: Array de roles:', roles);
    
    const isAdmin = roles.some((role: string) => {
      const normalizedRole = role.toLowerCase();
      console.log(`🔍 Verificando rol: "${role}" -> normalizado: "${normalizedRole}"`);
      return normalizedRole === 'admin' || normalizedRole === 'administrator';
    });
    
    console.log('🔍 RedirectService: ¿Es administrador?', isAdmin);
    
    if (isAdmin) {
      console.log('🛡️ RedirectService: Usuario es administrador, redirigiendo a /admin');
      this.router.navigate(['/admin']);
    } else {
      console.log('👤 RedirectService: Usuario normal, redirigiendo a /panel-usuario');
      this.router.navigate(['/panel-usuario']);
    }
  }

  /**
   * Verifica si el usuario actual puede acceder a una ruta específica
   */
  canAccessRoute(route: string): boolean {
    const user = this.authService.currentUser();
    
    if (!user || !this.authService.isAuthenticated()) {
      return false;
    }
    
    const roles = user.roles || [];
    const isAdmin = roles.some((role: string) => 
      role.toLowerCase() === 'admin' || role.toLowerCase() === 'administrator'
    );
    
    switch (route) {
      case '/admin':
        return isAdmin;
      case '/panel-usuario':
        return !isAdmin;
      case '/marcador':
        return true; // Cualquier usuario autenticado puede acceder
      default:
        return false;
    }
  }

  /**
   * Redirige a la página de error de autorización
   */
  redirectToUnauthorized(): void {
    console.log('⛔ RedirectService: Redirigiendo a página no autorizada');
    this.router.navigate(['/unauthorized']);
  }

  /**
   * Redirige a login
   */
  redirectToLogin(): void {
    console.log('🔓 RedirectService: Redirigiendo a login');
    this.router.navigate(['/login']);
  }

  /**
   * Maneja la redirección después del logout
   */
  handleLogout(): void {
    console.log('👋 RedirectService: Manejando logout');
    this.authService.logout();
    this.redirectToLogin();
  }
}