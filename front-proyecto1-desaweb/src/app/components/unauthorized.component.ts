import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-card">
        <div class="icon-container">
          <i class="material-icons">block</i>
        </div>
        
        <h1>Acceso No Autorizado</h1>
        <p class="message">
          No tienes permisos para acceder a esta página.
        </p>
        
        <div class="user-info">
          <p><strong>Usuario:</strong> {{ authService.currentUser()?.username || 'Desconocido' }}</p>
          <p><strong>Rol:</strong> {{ authService.currentUser()?.role || 'Sin rol' }}</p>
        </div>
        
        <div class="actions">
          <button class="btn-primary" (click)="goToCorrectDashboard()">
            <i class="material-icons">dashboard</i>
            Ir a Mi Panel
          </button>
          
          <button class="btn-secondary" (click)="logout()">
            <i class="material-icons">logout</i>
            Cerrar Sesión
          </button>
        </div>
        
        <div class="help-text">
          <p>Si crees que esto es un error, contacta al administrador del sistema.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .unauthorized-card {
      background: white;
      border-radius: 12px;
      padding: 2.5rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      text-align: center;
      max-width: 500px;
      width: 90%;
      margin: 20px;
    }

    .icon-container {
      margin-bottom: 1.5rem;
    }

    .icon-container i {
      font-size: 4rem;
      color: #e74c3c;
    }

    h1 {
      color: #2c3e50;
      margin-bottom: 1rem;
      font-size: 1.8rem;
      font-weight: 600;
    }

    .message {
      color: #7f8c8d;
      margin-bottom: 2rem;
      font-size: 1.1rem;
      line-height: 1.5;
    }

    .user-info {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 2rem;
      border-left: 4px solid #3498db;
    }

    .user-info p {
      margin: 0.5rem 0;
      color: #2c3e50;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }

    .btn-primary, .btn-secondary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover {
      background: #2980b9;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
    }

    .btn-secondary:hover {
      background: #7f8c8d;
      transform: translateY(-2px);
    }

    .help-text {
      color: #95a5a6;
      font-size: 0.9rem;
      font-style: italic;
    }

    @media (max-width: 480px) {
      .unauthorized-card {
        padding: 1.5rem;
      }
      
      .actions {
        flex-direction: column;
      }
      
      .btn-primary, .btn-secondary {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class UnauthorizedComponent {
  
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  goToCorrectDashboard() {
    const user = this.authService.currentUser();
    
    if (user?.role === 'Admin' || user?.role === 'admin' || user?.role === 'Administrator') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/panel-usuario']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}