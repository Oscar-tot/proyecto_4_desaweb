import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PanelUsuarioComponent } from './panel-usuario/panel-usuario.component';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, PanelUsuarioComponent],
  template: `
    <div class="user-dashboard">
      <div class="header">
        <div class="header-content">
          <h1>
            <i class="material-icons">sports_basketball</i>
            Panel de Usuario
          </h1>
          
          <div class="user-info">
            <span class="username">{{ authService.currentUser()?.username }}</span>
            <span class="user-role">Usuario</span>
            <button class="btn-logout" (click)="logout()">
              <i class="material-icons">logout</i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
      
      <div class="content">
        <app-panel-usuario></app-panel-usuario>
      </div>
    </div>
  `,
  styles: [`
    .user-dashboard {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .header {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding: 1rem 0;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    h1 {
      color: white;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: 600;
    }

    h1 i {
      font-size: 2rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: white;
    }

    .username {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .user-role {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.9rem;
      backdrop-filter: blur(5px);
    }

    .btn-logout {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(231, 76, 60, 0.8);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      backdrop-filter: blur(5px);
    }

    .btn-logout:hover {
      background: rgba(231, 76, 60, 1);
      transform: translateY(-2px);
    }

    .content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
      
      .user-info {
        flex-wrap: wrap;
        justify-content: center;
      }
      
      .content {
        padding: 1rem;
      }
    }
  `]
})
export class UserDashboardComponent implements OnInit {
  
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar que el usuario no sea admin
    const user = this.authService.currentUser();
    if (user?.role === 'Admin' || user?.role === 'admin' || user?.role === 'Administrator') {
      this.router.navigate(['/admin']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}