import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Equipo {
  id: number;
  nombre: string;
  ciudad: string;
  logo?: string;
  descripcion?: string;
  fechaCreacion: string;
  isActivo?: boolean;
}

export interface EquipoCreateRequest {
  nombre: string;
  ciudad: string;
  logo?: string;
  descripcion?: string;
}

export interface EquipoUpdateRequest {
  nombre: string;
  ciudad: string;
  logo?: string;
  descripcion?: string;
  isActivo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EquipoService {
  // API Gateway - ruta actualizada de /equipos a /teams
  private apiUrl = `${environment.apiUrl}/teams`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Obtener headers con autorización
   */
  private getHeaders(): HttpHeaders {
    const authHeaders = this.authService.getAuthHeaders();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...authHeaders
    });
  }

  /**
   * Obtener todos los equipos
   */
  getEquipos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtener equipo por ID
   */
  getEquipo(id: number): Observable<Equipo> {
    return this.http.get<Equipo>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Crear nuevo equipo
   */
  createEquipo(equipo: EquipoCreateRequest): Observable<Equipo> {
    return this.http.post<Equipo>(this.apiUrl, equipo, {
      headers: this.getHeaders()
    });
  }

  /**
   * Actualizar equipo
   */
  updateEquipo(id: number, equipo: EquipoUpdateRequest): Observable<Equipo> {
    return this.http.put<Equipo>(`${this.apiUrl}/${id}`, equipo, {
      headers: this.getHeaders()
    });
  }

  /**
   * Eliminar equipo
   */
  deleteEquipo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Buscar equipos por nombre
   */
  searchEquipos(nombre: string): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.apiUrl}/buscar/${nombre}`, {
      headers: this.getHeaders()
    });
  }
}