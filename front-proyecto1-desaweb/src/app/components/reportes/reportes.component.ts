import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../services/reporte.service';
import { EquipoService, Equipo } from '../../services/equipo.service';
import { PartidoService, PartidoResultado } from '../../services/partido.service';
import { JugadorService, Jugador } from '../../services/jugador.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  private reporteService = inject(ReporteService);
  private equipoService = inject(EquipoService);
  private partidoService = inject(PartidoService);
  private jugadorService = inject(JugadorService);

  // Estados
  isLoading = signal(false);
  mensaje = signal('');
  error = signal('');

  // Datos para los select
  equipos = signal<Equipo[]>([]);
  partidos = signal<PartidoResultado[]>([]);
  jugadores = signal<Jugador[]>([]);

  // Selecciones
  equipoSeleccionado = signal<number | null>(null);
  partidoSeleccionado = signal<number | null>(null);
  jugadorSeleccionado = signal<string | null>(null);

  ngOnInit() {
    this.cargarEquipos();
    this.cargarPartidos();
    this.cargarJugadores();
  }

  cargarEquipos() {
    this.equipoService.getEquipos().subscribe({
      next: (equipos) => {
        this.equipos.set(equipos);
      },
      error: (error) => {
        console.error('Error cargando equipos:', error);
      }
    });
  }

  cargarPartidos() {
    this.partidoService.getPartidos().subscribe({
      next: (partidos) => {
        this.partidos.set(partidos);
      },
      error: (error) => {
        console.error('Error cargando partidos:', error);
      }
    });
  }

  cargarJugadores() {
    this.jugadorService.getJugadores().subscribe({
      next: (jugadores) => {
        this.jugadores.set(jugadores);
      },
      error: (error) => {
        console.error('Error cargando jugadores:', error);
      }
    });
  }

  // RF-REP-01: Reporte de todos los equipos
  generarReporteTodosEquipos() {
    this.isLoading.set(true);
    this.mensaje.set('');
    this.error.set('');

    this.reporteService.generarReporteEquipos().subscribe({
      next: (blob) => {
        const timestamp = new Date().getTime();
        this.reporteService.descargarPDF(blob, `equipos_registrados_${timestamp}.pdf`);
        this.mensaje.set('✅ Reporte de equipos generado exitosamente');
        this.isLoading.set(false);
        setTimeout(() => this.mensaje.set(''), 3000);
      },
      error: (error) => {
        console.error('Error generando reporte:', error);
        this.error.set('❌ Error al generar el reporte de equipos');
        this.isLoading.set(false);
      }
    });
  }

  // RF-REP-02: Reporte de jugadores por equipo
  generarReporteJugadoresEquipo() {
    const equipoId = this.equipoSeleccionado();
    
    if (!equipoId) {
      this.error.set('⚠️ Selecciona un equipo');
      return;
    }

    this.isLoading.set(true);
    this.mensaje.set('');
    this.error.set('');

    this.reporteService.generarReporteJugadoresPorEquipo(equipoId).subscribe({
      next: (blob) => {
        const timestamp = new Date().getTime();
        this.reporteService.descargarPDF(blob, `equipo_${equipoId}_jugadores_${timestamp}.pdf`);
        this.mensaje.set('✅ Reporte de jugadores generado exitosamente');
        this.isLoading.set(false);
        setTimeout(() => this.mensaje.set(''), 3000);
      },
      error: (error) => {
        console.error('Error generando reporte:', error);
        this.error.set('❌ Error al generar el reporte de jugadores');
        this.isLoading.set(false);
      }
    });
  }

  // RF-REP-03: Reporte de historial de partidos
  generarReporteHistorialPartidos() {
    this.isLoading.set(true);
    this.mensaje.set('');
    this.error.set('');

    this.reporteService.generarReporteHistorialPartidos().subscribe({
      next: (blob) => {
        const timestamp = new Date().getTime();
        this.reporteService.descargarPDF(blob, `historial_partidos_${timestamp}.pdf`);
        this.mensaje.set('✅ Reporte de historial generado exitosamente');
        this.isLoading.set(false);
        setTimeout(() => this.mensaje.set(''), 3000);
      },
      error: (error) => {
        console.error('Error generando reporte:', error);
        this.error.set('❌ Error al generar el reporte de historial');
        this.isLoading.set(false);
      }
    });
  }

  // RF-REP-04: Reporte de roster por partido
  generarReporteRosterPartido() {
    const partidoId = this.partidoSeleccionado();
    
    if (!partidoId) {
      this.error.set('⚠️ Selecciona un partido');
      return;
    }

    this.isLoading.set(true);
    this.mensaje.set('');
    this.error.set('');

    this.reporteService.generarReporteRosterPartido(partidoId).subscribe({
      next: (blob) => {
        const timestamp = new Date().getTime();
        this.reporteService.descargarPDF(blob, `partido_${partidoId}_roster_${timestamp}.pdf`);
        this.mensaje.set('✅ Reporte de roster generado exitosamente');
        this.isLoading.set(false);
        setTimeout(() => this.mensaje.set(''), 3000);
      },
      error: (error) => {
        console.error('Error generando reporte:', error);
        this.error.set('❌ Error al generar el reporte de roster');
        this.isLoading.set(false);
      }
    });
  }

  // RF-REP-05: Reporte de estadísticas por jugador
  generarReporteEstadisticasJugador() {
    const jugadorId = this.jugadorSeleccionado();
    
    if (!jugadorId) {
      this.error.set('⚠️ Selecciona un jugador');
      return;
    }

    this.isLoading.set(true);
    this.mensaje.set('');
    this.error.set('');

    this.reporteService.generarReporteEstadisticasJugador(jugadorId).subscribe({
      next: (blob) => {
        const timestamp = new Date().getTime();
        this.reporteService.descargarPDF(blob, `jugador_${jugadorId}_stats_${timestamp}.pdf`);
        this.mensaje.set('✅ Reporte de estadísticas generado exitosamente');
        this.isLoading.set(false);
        setTimeout(() => this.mensaje.set(''), 3000);
      },
      error: (error) => {
        console.error('Error generando reporte:', error);
        this.error.set('❌ Error al generar el reporte de estadísticas');
        this.isLoading.set(false);
      }
    });
  }
}
