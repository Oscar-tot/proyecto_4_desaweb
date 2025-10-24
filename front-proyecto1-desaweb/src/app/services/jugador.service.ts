import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Equipo } from './equipo.service';
import { environment } from '../../environments/environment';

export interface Jugador {
  _id?: string;  // MongoDB ID
  id?: number;   // Para compatibilidad
  nombreCompleto: string;
  nombre?: string;
  apellidos?: string;
  numero: number;
  numeroCamiseta?: number;
  posicion: string;
  estatura: number;
  altura?: number;
  edad?: number;
  nacionalidad?: string;
  foto?: string;
  equipoId: number;
  equipoNombre?: string;
  equipo?: Equipo;  // Opcional, para cuando venga poblado
  fechaCreacion?: string;
  createdAt?: string;
  isActivo?: boolean;
  activo?: boolean;
}

// Helper computed properties for backward compatibility
export interface JugadorWithComputed extends Jugador {
  equipoId: number;
  equipoNombre: string;
}

export interface JugadorCreateRequest {
  nombreCompleto: string;
  numero: number;
  posicion: string;
  estatura: number;
  edad: number;
  nacionalidad: string;
  foto?: string;
  equipoId: number;
  equipoNombre?: string;
}

export interface JugadorUpdateRequest {
  nombreCompleto: string;
  numero: number;
  posicion: string;
  estatura: number;
  edad: number;
  nacionalidad: string;
  foto?: string;
  equipoId: number;
  equipoNombre?: string;
  isActivo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class JugadorService {
  // API Gateway - ruta actualizada de /jugadores a /players
  private apiUrl = `${environment.apiUrl}/players`;

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
   * Normalizar jugador (convertir formato Python a formato Angular)
   */
  private normalizarJugador(jugador: any): Jugador {
    // Construir objeto equipo siempre
    const equipoObj: Equipo = {
      id: jugador.equipoId || 0,
      nombre: jugador.equipoNombre || 'Sin equipo',
      ciudad: '',
      logo: '',
      descripcion: '',
      fechaCreacion: '',
      isActivo: true
    };

    return {
      _id: jugador._id,  // Preservar _id de MongoDB
      id: jugador._id || jugador.id,  // Alias para compatibilidad
      nombreCompleto: jugador.nombreCompleto || `${jugador.nombre || ''} ${jugador.apellidos || ''}`.trim(),
      nombre: jugador.nombre,
      apellidos: jugador.apellidos,
      numero: jugador.numero || jugador.numeroCamiseta || 0,
      numeroCamiseta: jugador.numeroCamiseta || jugador.numero || 0,
      posicion: jugador.posicion || '',
      estatura: jugador.estatura || jugador.altura || 0,
      altura: jugador.altura || jugador.estatura || 0,
      edad: jugador.edad,
      nacionalidad: jugador.nacionalidad,
      foto: jugador.foto,
      equipoId: jugador.equipoId || 0,
      equipoNombre: jugador.equipoNombre || 'Sin equipo',
      equipo: equipoObj,  // SIEMPRE incluir objeto equipo
      isActivo: jugador.isActivo !== undefined ? jugador.isActivo : jugador.activo,
      activo: jugador.activo !== undefined ? jugador.activo : jugador.isActivo,
      fechaCreacion: jugador.fechaCreacion || jugador.createdAt,
      createdAt: jugador.createdAt || jugador.fechaCreacion
    };
  }

  /**
   * Obtener todos los jugadores
   */
  getJugadores(): Observable<Jugador[]> {
    return this.http.get<any>(this.apiUrl, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        const data = response.data || response;
        
        if (!Array.isArray(data)) {
          console.error('La respuesta del API no es un array:', data);
          return [];
        }
        
        return data.map(j => this.normalizarJugador(j));
      })
    );
  }

  /**
   * Obtener jugador por ID
   */
  getJugador(id: number | string): Observable<Jugador> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => this.normalizarJugador(response.data || response))
    );
  }

  /**
   * Obtener jugadores por equipo
   */
  getJugadoresByEquipo(equipoId: number): Observable<Jugador[]> {
    return this.http.get<any>(`${this.apiUrl}/equipo/${equipoId}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        const data = response.data || response;
        return Array.isArray(data) ? data.map(j => this.normalizarJugador(j)) : [];
      })
    );
  }

  /**
   * Crear nuevo jugador
   */
  createJugador(jugador: JugadorCreateRequest): Observable<Jugador> {
    return this.http.post<any>(this.apiUrl, jugador, {
      headers: this.getHeaders()
    }).pipe(
      map(response => this.normalizarJugador(response.data || response))
    );
  }

  /**
   * Actualizar jugador
   */
  updateJugador(id: number | string, jugador: JugadorUpdateRequest): Observable<Jugador> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, jugador, {
      headers: this.getHeaders()
    }).pipe(
      map(response => this.normalizarJugador(response.data || response))
    );
  }

  /**
   * Eliminar jugador
   */
  deleteJugador(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}