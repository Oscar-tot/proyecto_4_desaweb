import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="oauth-callback-container">
      <div class="loading-spinner">
        <i class="material-icons rotating">refresh</i>
        <p>Completando inicio de sesión...</p>
      </div>
    </div>
  `,
  styles: [`
    .oauth-callback-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #4ea8a8 0%, #366391 50%, #1a1a2e 100%);
    }

    .loading-spinner {
      text-align: center;
      color: white;
    }

    .loading-spinner i {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .loading-spinner p {
      font-size: 1.2rem;
      font-weight: 500;
    }

    .rotating {
      animation: rotate 1s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class OauthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log('🔍 OAuth Callback Component Initialized');
    console.log('📍 Current URL:', window.location.href);
    
    // Obtener tokens de los query params
    this.route.queryParams.subscribe(params => {
      console.log('📦 Query Params:', params);
      
      const token = params['token'];
      const refreshToken = params['refreshToken'];

      console.log('🎫 Token:', token ? 'Presente' : 'NO presente');
      console.log('🔄 Refresh Token:', refreshToken ? 'Presente' : 'NO presente');

      if (token && refreshToken) {
        console.log('✅ Guardando tokens...');
        
        // Guardar tokens en sessionStorage
        sessionStorage.setItem('basketball_token', token);
        sessionStorage.setItem('basketball_refresh_token', refreshToken);
        
        // También en localStorage como respaldo
        localStorage.setItem('basketball_token', token);
        localStorage.setItem('basketball_refresh_token', refreshToken);

        // Decodificar el token para obtener información del usuario
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('👤 Payload decodificado:', payload);
          
          const usuario = {
            id: payload.sub,
            username: payload.username,
            email: payload.email,
            roles: payload.roles || []
          };
          
          console.log('👤 Usuario:', usuario);
          
          sessionStorage.setItem('basketball_usuario', JSON.stringify(usuario));
          localStorage.setItem('basketball_usuario', JSON.stringify(usuario));

          // Actualizar estado del servicio de autenticación
          this.authService.isAuthenticated.set(true);
          this.authService.currentUser.set(usuario);

          console.log('🎯 Roles del usuario:', usuario.roles);
          
          // Redirigir al dashboard apropiado según el rol
          setTimeout(() => {
            if (usuario.roles.includes('admin')) {
              console.log('➡️ Redirigiendo a /jugadores (admin)');
              this.router.navigate(['/jugadores']);
            } else {
              console.log('➡️ Redirigiendo a /panel-usuario');
              this.router.navigate(['/panel-usuario']);
            }
          }, 1000);
        } catch (error) {
          console.error('❌ Error procesando token OAuth:', error);
          this.router.navigate(['/login']);
        }
      } else {
        // No hay tokens, redirigir al login
        console.error('❌ No se recibieron tokens de OAuth');
        this.router.navigate(['/login']);
      }
    });
  }
}
