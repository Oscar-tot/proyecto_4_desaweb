import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  username: string; // Cambiado de email a username para coincidir con el backend
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
    roles: string[]; // Array de roles ['admin', 'user', etc]
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface Usuario {
  id?: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  roles: string[]; // Array de roles ['admin', 'user', etc]
  role?: string; // Mantener retrocompatibilidad
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  roles: string[]; // Array de roles ['admin', 'user', etc]
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles?: string[]; // Array de roles ['admin', 'user', etc]
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  roles?: string[];
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private usersApiUrl = `${environment.apiUrl}/users`; // URL para gestión de usuarios
  private tokenKey = 'basketball_token';
  private usuarioKey = 'basketball_usuario';
  
  // Señales reactivas
  isAuthenticated = signal(false);
  currentUser = signal<Usuario | null>(null);
  
  // Subject para observable
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  public authStatus$ = this.authStatusSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  /**
   * Migrar datos de localStorage a sessionStorage
   * Esto permite múltiples sesiones independientes por pestaña
   */
  private migrateToSessionStorage(): void {
    const localToken = localStorage.getItem(this.tokenKey);
    const localUser = localStorage.getItem(this.usuarioKey);
    
    if (localToken && !sessionStorage.getItem(this.tokenKey)) {
      sessionStorage.setItem(this.tokenKey, localToken);
    }
    
    if (localUser && !sessionStorage.getItem(this.usuarioKey)) {
      sessionStorage.setItem(this.usuarioKey, localUser);
    }
  }

  /**
   * Verificar si el usuario está autenticado al inicializar el servicio
   */
  private checkAuthStatus() {
    // Migrar datos existentes de localStorage a sessionStorage
    this.migrateToSessionStorage();
    
    const token = this.getToken();
    const usuario = this.getStoredUser();
    
    if (token && usuario && this.isTokenValid()) {
      // Si encontramos datos válidos, asegurar que estén en sessionStorage
      if (!sessionStorage.getItem(this.tokenKey)) {
        sessionStorage.setItem(this.tokenKey, token);
      }
      if (!sessionStorage.getItem(this.usuarioKey)) {
        sessionStorage.setItem(this.usuarioKey, JSON.stringify(usuario));
      }
      
      this.isAuthenticated.set(true);
      this.currentUser.set(usuario);
      this.authStatusSubject.next(true);
    } else {
      // Si no hay datos válidos, limpiar todo
      this.logout();
    }
  }

  /**
   * Realizar login
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    console.log('Intentando login con:', credentials);
    console.log('Datos JSON:', JSON.stringify(credentials));
    console.log('URL:', `${this.apiUrl}/login`);

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials, { headers })
      .pipe(
        tap(response => {
          console.log('Login exitoso:', response);
          // Guardar token y usuario en sessionStorage para sesiones independientes por pestaña
          sessionStorage.setItem(this.tokenKey, response.accessToken);
          
          // Crear objeto usuario desde la respuesta del backend
          const usuario: Usuario = {
            id: response.user.id,
            username: response.user.username,
            email: response.user.email,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            status: response.user.status,
            roles: response.user.roles || [],
            role: response.user.roles[0] // Primer rol como retrocompatibilidad
          };
          
          sessionStorage.setItem(this.usuarioKey, JSON.stringify(usuario));
          
          // También guardamos en localStorage como respaldo (opcional)
          localStorage.setItem(this.tokenKey, response.accessToken);
          localStorage.setItem(this.usuarioKey, JSON.stringify(usuario));
          
          // Actualizar señales
          this.isAuthenticated.set(true);
          this.currentUser.set(usuario);
          this.authStatusSubject.next(true);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error en login:', error);
          console.error('Status:', error.status);
          console.error('Error body:', error.error);
          
          // Crear un objeto de error que preserve el status HTTP
          const errorObj: any = new Error(error.error?.message || 'Error de conexión');
          errorObj.status = error.status; // Preservar el código de estado HTTP
          errorObj.originalError = error;
          
          return throwError(() => errorObj);
        })
      );
  }

  /**
   * Realizar logout (local y servidor)
   */
  logout(): void {
    console.log('🚪 AuthService: Iniciando logout...');
    
    // Intentar logout en servidor si hay refresh token
    const refreshToken = sessionStorage.getItem('refresh_token') || localStorage.getItem('refresh_token');
    if (refreshToken) {
      this.logoutFromServer(refreshToken).subscribe({
        next: () => console.log(' Logout en servidor completado'),
        error: (err) => console.warn(' Error en logout servidor (continuando):', err)
      });
    }
    
    // Limpiar almacenamiento (siempre ejecutar, incluso si falla el servidor)
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.usuarioKey);
    sessionStorage.removeItem('refresh_token');
    localStorage.removeItem(this.tokenKey); 
    localStorage.removeItem(this.usuarioKey);
    localStorage.removeItem('refresh_token');
    
    // Actualizar estado
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.authStatusSubject.next(false);
    
    console.log(' AuthService: Logout completado, redirigiendo...');
    
    // Redirigir al login
    this.router.navigate(['/login']);
  }

  /**
   * Obtener token JWT
   */
  getToken(): string | null {
    // Priorizar sessionStorage, fallback a localStorage para compatibilidad
    return sessionStorage.getItem(this.tokenKey) || localStorage.getItem(this.tokenKey);
  }

  /**
   * Obtener usuario almacenado
   */
  private getStoredUser(): Usuario | null {
    try {
      // Priorizar sessionStorage, fallback a localStorage para compatibilidad
      const userStr = sessionStorage.getItem(this.usuarioKey) || localStorage.getItem(this.usuarioKey);
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error al parsear usuario desde storage:', error);
      // Limpiar datos corruptos de ambos storages
      sessionStorage.removeItem(this.usuarioKey);
      localStorage.removeItem(this.usuarioKey);
      return null;
    }
  }

  /**
   * Verificar si el token es válido (básico)
   */
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Decodificar JWT básico (sin verificar firma)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      const isValid = payload.exp > now;
      
      // Si el token expiró, hacer logout automático
      if (!isValid) {
        this.logout();
      }
      
      return isValid;
    } catch {
      // Si hay error al decodificar, limpiar tokens corruptos
      this.logout();
      return false;
    }
  }

  /**
   * Limpiar sesiones expiradas (método auxiliar)
   */
  cleanExpiredSessions(): void {
    if (!this.isTokenValid()) {
      this.logout();
    }
  }

  /**
   * Obtener headers de autorización
   */
  getAuthHeaders(): { [key: string]: string } {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Obtener todos los usuarios
   */
  getAllUsers(): Observable<UserDto[]> {
    console.log(' AuthService.getAllUsers() iniciado');
    const headers = this.getAuthHeaders();
    console.log('Headers:', headers);
    console.log(' URL completa:', this.usersApiUrl);
    
    return this.http.get<UserDto[]>(this.usersApiUrl, { headers })
      .pipe(
        tap(usuarios => {
          console.log(' Respuesta del servidor recibida:', usuarios);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(' Error HTTP completo:', error);
          console.error(' Status:', error.status);
          console.error(' Status Text:', error.statusText);
          console.error(' Error body:', error.error);
          console.error(' URL solicitada:', error.url);
          
          let errorMessage = 'Error al obtener usuarios';
          if (error.status === 401) {
            errorMessage = 'No autorizado - Token inválido o expirado';
            this.logout(); // Logout si no está autorizado
          } else if (error.status === 500) {
            errorMessage = 'Error del servidor';
          } else if (error.status === 0) {
            errorMessage = 'No se puede conectar al servidor';
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Crear un nuevo usuario (solo para admins)
   */
  createUser(userData: CreateUserRequest): Observable<UserDto> {
    console.log(' AuthService.createUser() iniciado', userData);
    const headers = this.getAuthHeaders();
    console.log(' Headers:', headers);
    
    return this.http.post<UserDto>(this.usersApiUrl, userData, { headers })
      .pipe(
        tap(usuario => {
          console.log(' Usuario creado exitosamente:', usuario);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(' Error al crear usuario:', error);
          console.error(' Status:', error.status);
          console.error(' Error body:', error.error);
          
          let errorMessage = 'Error al crear usuario';
          if (error.status === 400) {
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else {
              errorMessage = 'Datos de usuario inválidos';
            }
          } else if (error.status === 401) {
            errorMessage = 'No tienes permisos para crear usuarios';
            this.logout();
          } else if (error.status === 500) {
            errorMessage = 'Error del servidor';
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Obtener un usuario por ID
   */
  getUserById(id: number): Observable<UserDto> {
    console.log(' AuthService.getUserById() - ID:', id);
    const headers = this.getAuthHeaders();
    
    return this.http.get<UserDto>(`${this.usersApiUrl}/${id}`, { headers })
      .pipe(
        tap(usuario => {
          console.log(' Usuario obtenido:', usuario);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(' Error al obtener usuario:', error);
          
          let errorMessage = 'Error al obtener usuario';
          if (error.status === 404) {
            errorMessage = 'Usuario no encontrado';
          } else if (error.status === 401) {
            errorMessage = 'No autorizado';
            this.logout();
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Actualizar un usuario (solo para admins)
   */
  updateUser(id: number, userData: UpdateUserRequest): Observable<UserDto> {
    console.log(' AuthService.updateUser() - ID:', id, 'Data:', userData);
    const headers = this.getAuthHeaders();
    
    return this.http.patch<UserDto>(`${this.usersApiUrl}/${id}`, userData, { headers })
      .pipe(
        tap(usuario => {
          console.log(' Usuario actualizado exitosamente:', usuario);
          
          // Si es el usuario actual, actualizar la sesión
          const currentUser = this.currentUser();
          if (currentUser && currentUser.id === id) {
            const updatedUser: Usuario = {
              ...currentUser,
              username: usuario.username,
              email: usuario.email,
              firstName: usuario.firstName,
              lastName: usuario.lastName,
              status: usuario.status,
              roles: usuario.roles,
              role: usuario.roles[0]
            };
            this.currentUser.set(updatedUser);
            sessionStorage.setItem(this.usuarioKey, JSON.stringify(updatedUser));
            localStorage.setItem(this.usuarioKey, JSON.stringify(updatedUser));
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(' Error al actualizar usuario:', error);
          
          let errorMessage = 'Error al actualizar usuario';
          if (error.status === 400) {
            errorMessage = error.error?.message || 'Datos inválidos';
          } else if (error.status === 401) {
            errorMessage = 'No autorizado';
            this.logout();
          } else if (error.status === 403) {
            errorMessage = 'No tienes permisos para actualizar usuarios';
          } else if (error.status === 404) {
            errorMessage = 'Usuario no encontrado';
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Eliminar un usuario (solo para admins)
   */
  deleteUser(id: number): Observable<any> {
    console.log(' AuthService.deleteUser() - ID:', id);
    const headers = this.getAuthHeaders();
    
    return this.http.delete(`${this.usersApiUrl}/${id}`, { headers })
      .pipe(
        tap(() => {
          console.log(' Usuario eliminado exitosamente');
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(' Error al eliminar usuario:', error);
          
          let errorMessage = 'Error al eliminar usuario';
          if (error.status === 401) {
            errorMessage = 'No autorizado';
            this.logout();
          } else if (error.status === 403) {
            errorMessage = 'No tienes permisos para eliminar usuarios';
          } else if (error.status === 404) {
            errorMessage = 'Usuario no encontrado';
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Obtener perfil del usuario actual
   */
  getMyProfile(): Observable<Usuario> {
    console.log(' AuthService.getMyProfile()');
    const headers = this.getAuthHeaders();
    
    return this.http.get<any>(`${this.apiUrl}/me`, { headers })
      .pipe(
        map(response => {
          const usuario: Usuario = {
            id: response.id,
            username: response.username,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName,
            status: response.status,
            roles: response.roles || [],
            role: response.roles ? response.roles[0] : undefined
          };
          return usuario;
        }),
        tap(usuario => {
          console.log(' Perfil obtenido:', usuario);
          // Actualizar usuario actual
          this.currentUser.set(usuario);
          sessionStorage.setItem(this.usuarioKey, JSON.stringify(usuario));
          localStorage.setItem(this.usuarioKey, JSON.stringify(usuario));
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(' Error al obtener perfil:', error);
          
          if (error.status === 401) {
            this.logout();
          }
          return throwError(() => new Error('Error al obtener perfil'));
        })
      );
  }

  /**
   * Cambiar contraseña del usuario actual
   */
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    console.log(' AuthService.changePassword()');
    const headers = this.getAuthHeaders();
    const body: ChangePasswordRequest = { oldPassword, newPassword };
    
    return this.http.post(`${this.apiUrl}/change-password`, body, { headers })
      .pipe(
        tap(() => {
          console.log(' Contraseña cambiada exitosamente');
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(' Error al cambiar contraseña:', error);
          
          let errorMessage = 'Error al cambiar contraseña';
          if (error.status === 401) {
            if (error.error?.message?.includes('incorrect')) {
              errorMessage = 'La contraseña actual es incorrecta';
            } else {
              errorMessage = 'No autorizado';
              this.logout();
            }
          } else if (error.status === 400) {
            errorMessage = error.error?.message || 'Contraseña inválida';
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Refrescar el access token usando el refresh token
   */
  refreshAccessToken(refreshToken: string): Observable<RefreshTokenResponse> {
    console.log(' AuthService.refreshAccessToken()');
    const body: RefreshTokenRequest = { refreshToken };
    
    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/refresh`, body)
      .pipe(
        tap(response => {
          console.log(' Token refrescado exitosamente');
          
          // Guardar nuevo token
          sessionStorage.setItem(this.tokenKey, response.accessToken);
          localStorage.setItem(this.tokenKey, response.accessToken);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(' Error al refrescar token:', error);
          
          // Si el refresh token es inválido, cerrar sesión
          if (error.status === 401) {
            this.logout();
          }
          return throwError(() => new Error('Error al refrescar token'));
        })
      );
  }

  /**
   * Cerrar sesión (logout) - invalida el refresh token en el servidor
   */
  logoutFromServer(refreshToken?: string): Observable<any> {
    console.log(' AuthService.logoutFromServer()');
    const headers = this.getAuthHeaders();
    const body = refreshToken ? { refreshToken } : {};
    
    return this.http.post(`${this.apiUrl}/logout`, body, { headers })
      .pipe(
        tap(() => {
          console.log(' Logout en servidor exitoso');
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(' Error al hacer logout en servidor:', error);
          // No lanzar error, el logout local siempre debe ejecutarse
          return throwError(() => new Error('Error al cerrar sesión en servidor'));
        })
      );
  }
}