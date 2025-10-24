import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ReporteService {
    private apiUrl = `${environment.apiUrl}/reports`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    /**
     * RF-REP-01: Generar reporte de todos los equipos registrados
     */
    generarReporteEquipos(): Observable<Blob> {
        console.log('📊 Generando reporte de todos los equipos');
        return this.http.post(`${this.apiUrl}/all-teams`, {}, {
            headers: this.getHeaders(),
            responseType: 'blob'
        });
    }

    /**
     * RF-REP-02: Generar reporte de jugadores por equipo
     */
    generarReporteJugadoresPorEquipo(equipoId: number): Observable<Blob> {
        console.log('📊 Generando reporte de jugadores para equipo:', equipoId);
        return this.http.post(`${this.apiUrl}/team/${equipoId}/players`, {}, {
            headers: this.getHeaders(),
            responseType: 'blob'
        });
    }

    /**
     * RF-REP-03: Generar reporte de historial de partidos
     */
    generarReporteHistorialPartidos(): Observable<Blob> {
        console.log('📊 Generando reporte de historial de partidos');
        return this.http.post(`${this.apiUrl}/matches/history`, {}, {
            headers: this.getHeaders(),
            responseType: 'blob'
        });
    }

    /**
     * RF-REP-04: Generar reporte de roster por partido
     */
    generarReporteRosterPartido(partidoId: number): Observable<Blob> {
        console.log('📊 Generando reporte de roster para partido:', partidoId);
        return this.http.post(`${this.apiUrl}/match/${partidoId}/roster`, {}, {
            headers: this.getHeaders(),
            responseType: 'blob'
        });
    }

    /**
     * RF-REP-05: Generar reporte de estadísticas por jugador
     */
    generarReporteEstadisticasJugador(jugadorId: string): Observable<Blob> {
        console.log('📊 Generando reporte de estadísticas para jugador:', jugadorId);
        return this.http.post(`${this.apiUrl}/player/${jugadorId}/stats`, {}, {
            headers: this.getHeaders(),
            responseType: 'blob'
        });
    }

    /**
     * Descargar archivo PDF
     */
    descargarPDF(blob: Blob, nombreArchivo: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo;
        link.click();
        window.URL.revokeObjectURL(url);
        console.log('PDF descargado:', nombreArchivo);
    }
}
