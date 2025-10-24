import { Component, signal, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PartidoService, PartidoResultado } from '../../services/partido.service';

@Component({
  selector: 'app-panel-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-usuario.component.html',
  styleUrls: ['./panel-usuario.component.css']
})
export class PanelUsuarioComponent implements OnInit {
  public authService = inject(AuthService);
  private partidoService = inject(PartidoService);
  private cdr = inject(ChangeDetectorRef);

  // Señales para el estado del componente
  partidoActual = signal<PartidoResultado | null>(null);
  partidos = signal<PartidoResultado[]>([]);
  cargandoDatos = signal(false);
  seccionActiva = signal('marcador');

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  async cargarDatosIniciales() {
    this.cargandoDatos.set(true);
    try {
      await this.cargarPartidoActual();
      await this.cargarPartidos();
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      this.cargandoDatos.set(false);
    }
  }

  async cargarPartidoActual() {
    try {
      const partidos = await this.partidoService.getPartidos().toPromise() as PartidoResultado[];
      const partidoEnCurso = partidos?.find(p => p.estado === 'EN_CURSO') || partidos?.[0] || null;
      this.partidoActual.set(partidoEnCurso);
    } catch (error) {
      console.error('Error cargando partido actual:', error);
      this.partidoActual.set(null);
    }
  }



  async cargarPartidos() {
    try {
      const partidos = await this.partidoService.getPartidos().toPromise() as PartidoResultado[];
      this.partidos.set(partidos || []);
    } catch (error) {
      console.error('Error cargando partidos:', error);
      this.partidos.set([]);
    }
  }

  cambiarSeccion(seccion: string) {
    this.seccionActiva.set(seccion);
    
    if (seccion === 'marcador') {
      this.cargarPartidoActual();
    } else if (seccion === 'partidos') {
      this.cargarPartidos();
    }
  }

  logout() {
    console.log('🔄 PanelUsuarioComponent: Iniciando logout desde panel de usuario...');
    this.authService.logout();
  }

  // Métodos auxiliares
  obtenerEstadoPartido(estado: string): string {
    switch (estado) {
      case 'EN_JUEGO': return 'En vivo';
      case 'EN_CURSO': return 'BREAK';
      case 'FINALIZADO': return 'Finalizado';
      case 'PROGRAMADO': return 'Programado';
      default: return estado;
    }
  }

  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'EN_CURSO': return 'estado-en-curso';
      case 'FINALIZADO': return 'estado-finalizado';
      case 'PROGRAMADO': return 'estado-programado';
      default: return '';
    }
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  }
}