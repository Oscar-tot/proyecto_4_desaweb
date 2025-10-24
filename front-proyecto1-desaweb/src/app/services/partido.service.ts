import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface PartidoResultado {
    id: number;
    equipoLocalNombre: string;
    equipoVisitanteNombre: string;
    fechaPartido: string;
    marcador: string;
    estado: string;
    fechaFinalizacion?: string;
}

export interface PartidoCreateRequest {
    equipoLocalId: number;
    equipoVisitanteId: number;
    fechaPartido: string;
    puntuacionLocal?: number;
    puntuacionVisitante?: number;
    periodo?: number;
    tiempoRestante?: string;
    faltasLocal?: number;
    faltasVisitante?: number;
    tiemposMuertosLocal?: number;
    tiemposMuertosVisitante?: number;
    estado?: string;
    jugadoresLocalIds?: number[];
    jugadoresVisitanteIds?: number[];
}

export interface PartidoUpdateRequest {
    fechaPartido?: string;
    puntuacionLocal?: number;
    puntuacionVisitante?: number;
}

export interface JugadorRoster {
    jugadorId: number;
    nombreCompleto: string;
    numero: number;
    equipoNombre: string;
    esTitular: boolean;
    fechaAsignacion: string;
}

export interface PartidoConRoster {
    id: number;
    equipoLocalNombre: string;
    equipoVisitanteNombre: string;
    fechaPartido: string;
    marcador: string;
    estado: string;
    fechaFinalizacion?: string;
    roster: JugadorRoster[];
}

export interface AsignarJugadorRoster {
    jugadorId: number;
    esTitular: boolean;
}

// Interfaz legacy para compatibilidad con el componente existente
export interface Partido {
    id?: number;
    equipoLocal: string;
    equipoVisitante: string;
    puntuacionLocal: number;
    puntuacionVisitante: number;
    periodo: number;
    tiempoRestante: number;
    faltasLocal: number;
    faltasVisitante: number;
    tiemposMuertosLocal: number;
    tiemposMuertosVisitante: number;
    estado: 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO' | 'SUSPENDIDO';
    fechaCreacion?: Date;
    fechaFinalizacion?: Date;
}

export interface ResultadoPartido {
    partido: Partido;
    resultado: 'EXITO' | 'ERROR';
    mensaje?: string;
}

export interface ActualizarMarcador {
    puntuacionLocal?: number;
    puntuacionVisitante?: number;
    periodo?: number;
    tiempoRestante?: string;
    faltasLocal?: number;
    faltasVisitante?: number;
    tiemposMuertosLocal?: number;
    tiemposMuertosVisitante?: number;
    estado?: string;
}

@Injectable({
    providedIn: 'root'
})
export class PartidoService {
    // API Gateway - ruta actualizada de /partidos a /matches
    private apiUrl = `${environment.apiUrl}/matches`;

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
     * Obtener todos los partidos
     */
    getPartidos(): Observable<PartidoResultado[]> {
        return this.http.get<any>(this.apiUrl, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                console.log('📦 Respuesta cruda de getPartidos():', response);
                // El backend devuelve { success, count, data }
                const data = response.data || response;
                console.log('📊 Data extraída:', data);
                
                // Mapear los datos del backend al formato esperado por el frontend
                const partidos = Array.isArray(data) ? data.map((partido: any) => {
                    console.log('🏀 Partido individual:', partido);
                    console.log('   - marcadorLocal:', partido.marcadorLocal);
                    console.log('   - marcadorVisitante:', partido.marcadorVisitante);
                    console.log('   - puntuacionLocal:', partido.puntuacionLocal);
                    console.log('   - puntuacionVisitante:', partido.puntuacionVisitante);
                    
                    // Construir el marcador desde los campos correctos del backend
                    const puntosLocal = partido.marcadorLocal ?? partido.puntuacionLocal ?? 0;
                    const puntosVisitante = partido.marcadorVisitante ?? partido.puntuacionVisitante ?? 0;
                    
                    return {
                        id: partido.id,
                        equipoLocalNombre: partido.equipoLocalNombre,
                        equipoVisitanteNombre: partido.equipoVisitanteNombre,
                        fechaPartido: partido.fecha || partido.fechaPartido,
                        marcador: `${puntosLocal}-${puntosVisitante}`,
                        estado: partido.estado,
                        fechaFinalizacion: partido.fechaFinalizacion || (partido.estado === 'FINALIZADO' ? partido.updatedAt : undefined)
                    };
                }) : [];
                
                console.log('✅ Partidos mapeados finales:', partidos);
                return partidos;
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Obtener historial de partidos finalizados
     */
    getHistorialPartidos(): Observable<PartidoResultado[]> {
        console.log('🔍 Llamando a:', `${this.apiUrl}/historial`);
        return this.http.get<any>(`${this.apiUrl}/historial`, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                console.log('📦 Respuesta cruda de /historial:', response);
                const data = response.data || response;
                console.log('📊 Data extraída:', data);
                console.log('📏 Es array?', Array.isArray(data), 'Longitud:', Array.isArray(data) ? data.length : 'N/A');
                
                // Mapear los datos del backend al formato esperado por el frontend
                const partidos = Array.isArray(data) ? data.map((partido: any) => ({
                    id: partido.id,
                    equipoLocalNombre: partido.equipoLocalNombre,
                    equipoVisitanteNombre: partido.equipoVisitanteNombre,
                    fechaPartido: partido.fecha,
                    marcador: `${partido.marcadorLocal || 0} - ${partido.marcadorVisitante || 0}`,
                    estado: partido.estado,
                    fechaFinalizacion: partido.updatedAt // Usar updatedAt como fecha de finalización
                })) : [];
                
                console.log('Partidos mapeados:', partidos);
                return partidos;
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Obtener partido por ID
     */
    getPartido(id: number): Observable<PartidoResultado> {
        return this.http.get<any>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        }).pipe(
            map(response => response.data || response),
            catchError(this.handleError)
        );
    }

    /**
     * Obtener partido con roster
     */
    getPartidoConRoster(id: number): Observable<PartidoConRoster> {
        return this.http.get<PartidoConRoster>(`${this.apiUrl}/${id}/roster`, {
            headers: this.getHeaders()
        }).pipe(catchError(this.handleError));
    }

    /**
     * Crear nuevo partido
     */
    crearPartidoNuevo(partido: PartidoCreateRequest): Observable<PartidoResultado> {
        return this.http.post<PartidoResultado>(this.apiUrl, partido, {
            headers: this.getHeaders()
        }).pipe(catchError(this.handleError));
    }

    /**
     * Actualizar partido
     */
    actualizarPartido(id: number, partido: PartidoUpdateRequest): Observable<PartidoResultado> {
        return this.http.put<PartidoResultado>(`${this.apiUrl}/${id}`, partido, {
            headers: this.getHeaders()
        }).pipe(catchError(this.handleError));
    }

    /**
     * Eliminar partido
     */
    eliminarPartido(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        }).pipe(catchError(this.handleError));
    }

    /**
     * Asignar jugador al roster
     */
    asignarJugadorAlRoster(partidoId: number, asignacion: AsignarJugadorRoster): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${partidoId}/roster`, asignacion, {
            headers: this.getHeaders()
        }).pipe(catchError(this.handleError));
    }

    /**
     * Remover jugador del roster
     */
    removerJugadorDelRoster(partidoId: number, jugadorId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${partidoId}/roster/${jugadorId}`, {
            headers: this.getHeaders()
        }).pipe(catchError(this.handleError));
    }

    /**
     * Obtener roster de un partido
     */
    getRosterPartido(partidoId: number): Observable<JugadorRoster[]> {
        console.log('🏀 Obteniendo roster del partido:', partidoId);
        return this.http.get<any>(`${this.apiUrl}/${partidoId}/jugadores`, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                console.log('📦 Respuesta roster:', response);
                const data = response.data || response;
                
                // Mapear los datos del backend al formato esperado
                const roster = Array.isArray(data) ? data.map((stat: any) => ({
                    jugadorId: stat.jugadorId,
                    nombreCompleto: stat.jugadorNombre || 'Jugador sin nombre',
                    numero: stat.jugadorNumero || 0,
                    equipoNombre: `Equipo ${stat.equipoId}`, // Se puede mejorar obteniendo del Teams Service
                    esTitular: true,
                    fechaAsignacion: stat.createdAt,
                    // Agregar estadísticas adicionales
                    puntos: stat.puntos || 0,
                    rebotes: stat.rebotes || 0,
                    asistencias: stat.asistencias || 0
                })) : [];
                
                console.log('Roster mapeado con', roster.length, 'jugadores');
                return roster;
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Finalizar partido
     */
    finalizarPartido(partidoId: number): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/${partidoId}/finalizar`, {}, {
            headers: this.getHeaders()
        }).pipe(catchError(this.handleError));
    }

    // ============================================
    // MÉTODOS DE COMPATIBILIDAD CON COMPONENTE EXISTENTE
    // ============================================

    /**
     * Crear partido (método legacy para compatibilidad)
     * Convierte el formato antiguo al nuevo formato de API
     */
    crearPartido(partidoLegacy: any): Observable<ResultadoPartido> {
        // Para mantener compatibilidad, creamos un partido básico
        // y luego lo actualizamos con los detalles del marcador
        const partidoRequest: PartidoCreateRequest = {
            equipoLocalId: 1, // TODO: Obtener de selección de usuario
            equipoVisitanteId: 2, // TODO: Obtener de selección de usuario  
            fechaPartido: new Date().toISOString()
        };

        return this.http.post<PartidoResultado>(this.apiUrl, partidoRequest, {
            headers: this.getHeaders()
        }).pipe(
            catchError(this.handleError),
            // Convertir la respuesta al formato legacy
            map((partidoResultado: PartidoResultado) => ({
                partido: {
                    id: partidoResultado.id,
                    equipoLocal: partidoResultado.equipoLocalNombre,
                    equipoVisitante: partidoResultado.equipoVisitanteNombre,
                    puntuacionLocal: parseInt(partidoResultado.marcador.split('-')[0]),
                    puntuacionVisitante: parseInt(partidoResultado.marcador.split('-')[1]),
                    periodo: partidoLegacy.periodo || 1,
                    tiempoRestante: partidoLegacy.tiempoRestante || 600,
                    faltasLocal: partidoLegacy.faltasLocal || 0,
                    faltasVisitante: partidoLegacy.faltasVisitante || 0,
                    tiemposMuertosLocal: partidoLegacy.tiemposMuertosLocal || 7,
                    tiemposMuertosVisitante: partidoLegacy.tiemposMuertosVisitante || 7,
                    estado: partidoResultado.estado as any,
                    fechaCreacion: new Date(partidoResultado.fechaPartido),
                    fechaFinalizacion: partidoResultado.fechaFinalizacion ? new Date(partidoResultado.fechaFinalizacion) : undefined
                },
                resultado: 'EXITO' as const,
                mensaje: 'Partido creado exitosamente'
            }))
        );
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Ocurrió un error desconocido';

        if (error.error instanceof ErrorEvent) {
            // Error del lado del cliente
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Error del lado del servidor
            errorMessage = `Código de error: ${error.status}, Mensaje: ${error.message}`;
            if (error.error && error.error.message) {
                errorMessage = error.error.message;
            }
        }

        console.error('Error en la comunicación con el backend:', errorMessage);
        return throwError(() => new Error(errorMessage));
    }

    // Nuevos métodos para marcador en tiempo real
    iniciarPartido(partidoId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${partidoId}/iniciar`, {}, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError));
    }

    actualizarMarcador(partidoId: number, marcador: ActualizarMarcador): Observable<PartidoResultado> {
        return this.http.put<PartidoResultado>(`${this.apiUrl}/${partidoId}/marcador`, marcador, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError));
    }

    pausarReanudarPartido(partidoId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${partidoId}/pausar`, {}, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError));
    }
}
