import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../services/auth.service';
import { RedirectService } from '../services/redirect.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-background-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
      
      <div class="login-card">
        <div class="login-header">
          <div class="logo-container">
            <i class="material-icons logo-icon">sports_basketball</i>
          </div>
          <h1>Marcador de Baloncesto</h1>
          <p>Inicia sesión para acceder al sistema</p>
        </div>

        <form (ngSubmit)="onLogin()" class="login-form">
          <div class="form-group">
            <label for="username">
              <i class="material-icons">person</i>
              Usuario:
            </label>
            <input 
              type="text" 
              id="username" 
              [(ngModel)]="credentials.username" 
              name="username"
              placeholder="Ingresa tu usuario"
              required 
              [disabled]="isLoading()"
            >
          </div>

          <div class="form-group">
            <label for="password">
              <i class="material-icons">lock</i>
              Contraseña:
            </label>
            <div class="password-input-wrapper">
              <input 
                [type]="mostrarPassword() ? 'text' : 'password'"
                id="password" 
                [(ngModel)]="credentials.password" 
                name="password"
                placeholder="Ingresa tu contraseña"
                required 
                [disabled]="isLoading()"
              >
              <button 
                type="button" 
                class="toggle-password-btn"
                (click)="togglePasswordVisibility()"
                [disabled]="isLoading()"
                title="{{ mostrarPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña' }}"
              >
                <i class="material-icons">{{ mostrarPassword() ? 'visibility_off' : 'visibility' }}</i>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            class="login-button"
            [disabled]="isLoading() || !credentials.username || !credentials.password"
          >
            <i class="material-icons" *ngIf="!isLoading()">login</i>
            <i class="material-icons rotating" *ngIf="isLoading()">refresh</i>
            <span *ngIf="!isLoading()">Ingresar</span>
            <span *ngIf="isLoading()">Ingresando...</span>
          </button>

          <div class="message error-message" *ngIf="errorMessage()">
            <i class="material-icons">error</i>
            {{ errorMessage() }}
          </div>

          <div class="message success-message" *ngIf="successMessage()">
            <i class="material-icons">check_circle</i>
            {{ successMessage() }}
          </div>
        </form>

        <div class="login-footer">
          <p>¿Necesitas ayuda? Contacta al administrador</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #4ea8a8 0%, #366391 50%, #1a1a2e 100%);
      padding: 0;
      margin: 0;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      overflow: hidden;
    }

    .login-background-shapes {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    .shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: float 6s ease-in-out infinite;
    }

    .shape-1 {
      width: 300px;
      height: 300px;
      top: -150px;
      left: -150px;
      animation-delay: 0s;
    }

    .shape-2 {
      width: 200px;
      height: 200px;
      bottom: -100px;
      right: -100px;
      animation-delay: 2s;
    }

    .shape-3 {
      width: 150px;
      height: 150px;
      top: 50%;
      right: -75px;
      animation-delay: 4s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(10deg); }
    }

    .login-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 3rem 2.5rem;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
      max-width: 450px;
      width: 90%;
      margin: 1rem;
      position: relative;
      z-index: 2;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .logo-container {
      margin-bottom: 1rem;
    }

    .logo-icon {
      font-size: 4rem;
      color: #3498db;
      background: linear-gradient(135deg, #3498db, #27ae60);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 2px 10px rgba(52, 152, 219, 0.3);
    }

    .login-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #2c3e50, #3498db);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .login-header p {
      color: #7f8c8d;
      margin: 0;
      font-size: 1.1rem;
      font-weight: 400;
    }

    .form-group {
      margin-bottom: 1.8rem;
      position: relative;
    }

    .form-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.8rem;
      color: #2c3e50;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .form-group label i {
      font-size: 1.2rem;
      color: #3498db;
    }

    .form-group input {
      width: 100%;
      padding: 1rem 1.2rem;
      border: 2px solid #ecf0f1;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s ease;
      box-sizing: border-box;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(5px);
    }

    .form-group input:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
      background: rgba(255, 255, 255, 1);
      transform: translateY(-2px);
    }

    .form-group input:disabled {
      background-color: #f8f9fa;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .form-group input::placeholder {
      color: #95a5a6;
      font-style: italic;
    }

    /* Wrapper para input de contraseña con botón */
    .password-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-input-wrapper input {
      padding-right: 3.5rem; /* Espacio para el botón del ojo */
    }

    /* Botón para mostrar/ocultar contraseña */
    .toggle-password-btn {
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: all 0.3s ease;
      color: #7f8c8d;
    }

    .toggle-password-btn:hover:not(:disabled) {
      background: rgba(52, 152, 219, 0.1);
      color: #3498db;
    }

    .toggle-password-btn:active:not(:disabled) {
      transform: translateY(-50%) scale(0.95);
    }

    .toggle-password-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .toggle-password-btn i {
      font-size: 1.3rem;
      pointer-events: none;
    }

    .login-button {
      width: 100%;
      background: linear-gradient(135deg, #3498db 0%, #27ae60 100%);
      color: white;
      border: none;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
      margin-bottom: 1rem;
    }

    .login-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
      background: linear-gradient(135deg, #2980b9 0%, #219a52 100%);
    }

    .login-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
    }

    .login-button i {
      font-size: 1.2rem;
    }

    .rotating {
      animation: rotate 1s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .message {
      padding: 1rem 1.2rem;
      border-radius: 10px;
      margin-top: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .error-message {
      background: linear-gradient(135deg, #fee 0%, #fecaca 100%);
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    .success-message {
      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .login-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #ecf0f1;
    }

    .login-footer p {
      color: #95a5a6;
      font-size: 0.9rem;
      margin: 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .login-card {
        padding: 2rem 1.5rem;
        margin: 1rem;
        width: 95%;
        max-width: 400px;
      }
      
      .logo-icon {
        font-size: 3rem;
      }
      
      .login-header h1 {
        font-size: 2rem;
      }
      
      .login-header p {
        font-size: 1rem;
      }
      
      .form-group input {
        padding: 0.9rem 1rem;
        font-size: 0.95rem;
      }
      
      .login-button {
        padding: 0.9rem 1.2rem;
        font-size: 1rem;
      }

      .shape-1 {
        width: 200px;
        height: 200px;
        top: -100px;
        left: -100px;
      }

      .shape-2 {
        width: 150px;
        height: 150px;
        bottom: -75px;
        right: -75px;
      }

      .shape-3 {
        width: 100px;
        height: 100px;
        right: -50px;
      }
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 1.5rem 1rem;
        margin: 0.5rem;
        width: 98%;
        border-radius: 16px;
      }
      
      .logo-icon {
        font-size: 2.5rem;
      }
      
      .login-header h1 {
        font-size: 1.8rem;
      }
      
      .login-header p {
        font-size: 0.95rem;
      }
      
      .form-group {
        margin-bottom: 1.5rem;
      }
      
      .form-group input {
        padding: 0.8rem;
        font-size: 0.9rem;
      }
      
      .login-button {
        padding: 0.8rem 1rem;
        font-size: 0.95rem;
      }

      .login-footer {
        margin-top: 1.5rem;
        padding-top: 1rem;
      }

      .login-footer p {
        font-size: 0.8rem;
      }

      .shape {
        display: none;
      }
    }
  `]
})
export class LoginComponent {
  credentials: LoginRequest = {
    username: '',
    password: ''
  };

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  mostrarPassword = signal(false); // Signal para controlar visibilidad de contraseña

  constructor(
    private authService: AuthService,
    private router: Router,
    private redirectService: RedirectService,
    private alertService: AlertService
  ) {}

  // Alternar visibilidad de contraseña
  togglePasswordVisibility() {
    this.mostrarPassword.set(!this.mostrarPassword());
  }

  onLogin() {
    if (!this.credentials.username || !this.credentials.password) {
      this.alertService.warning('Campos incompletos', 'Por favor completa todos los campos');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log(' Login exitoso, analizando rol del usuario:', response);
        
        // Desactivar el loading ANTES de mostrar la alerta
        this.isLoading.set(false);
        
        //  Alerta de éxito con mensaje pequeño y centrado
        this.alertService.success('Inicio de sesión exitoso', '¡Bienvenido!');
        
        setTimeout(() => {
          // Usar el servicio de redirección para manejar el routing por roles
          this.redirectService.redirectToUserDashboard();
        }, 1500);
      },
      error: (error) => {
        console.error(' Error en login:', error);
        
        // Diferenciar entre tipos de error
        if (error.status === 401 || error.status === 400) {
          //  Credenciales incorrectas
          this.alertService.error('Datos incorrectos', 'Usuario o contraseña incorrectos');
        } else if (error.status === 0 || !navigator.onLine) {
          //  Error de conexión (sin red)
          this.alertService.error('Error de conexión', 'No se pudo conectar al servidor. Verifica tu conexión a internet.');
        } else {
          //  Otro tipo de error
          this.alertService.error('Error', error.message || 'Ha ocurrido un error inesperado');
        }
        
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
}