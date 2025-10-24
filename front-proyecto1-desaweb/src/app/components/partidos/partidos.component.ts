import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PartidoService, PartidoResultado, PartidoCreateRequest, JugadorRoster, AsignarJugadorRoster } from '../../services/partido.service';
import { EquipoService, Equipo } from '../../services/equipo.service';
import { JugadorService, Jugador } from '../../services/jugador.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-partidos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './partidos.component.html',
  styleUrls: ['./partidos.component.css']
})
export class PartidosComponent implements OnInit {
  private partidoService = inject(PartidoService);
  private equipoService = inject(EquipoService);
  private jugadorService = inject(JugadorService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private alertService = inject(AlertService);

  // Estados
  partidos: PartidoResultado[] = [];
  historialPartidos: PartidoResultado[] = [];
  equipos: Equipo[] = [];
  jugadoresDisponibles: Jugador[] = [];
  isLoading = false;
  error = '';
  
  // Estados de modales
  showCreateModal = false;
  showHistorialModal = false;
  showRosterModal = false;
  
  // Estado actual
  vistaActiva: 'partidos' | 'historial' = 'partidos';
  partidoSeleccionado: PartidoResultado | null = null;
  roster: JugadorRoster[] = [];

  // Formularios
  partidoForm: FormGroup;
  filtroEquipo = '';
  filtroEstado = '';

  // Estados para roster
  jugadoresLocalSeleccionados: number[] = [];
  jugadoresVisitanteSeleccionados: number[] = [];
  equipoLocalId: number = 0;
  equipoVisitanteId: number = 0;

  constructor() {
    this.partidoForm = this.fb.group({
      equipoLocalId: ['', Validators.required],
      equipoVisitanteId: ['', Validators.required],
      fechaPartido: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadPartidos();
    this.loadEquipos();
    this.loadJugadores();
  }

  loadPartidos() {
    console.log('⚽ Cargando partidos...');
    this.isLoading = true;
    this.error = '';
    
    this.partidoService.getPartidos().subscribe({
      next: (partidos) => {
        console.log('✅ Partidos recibidos:', partidos);
        this.partidos = partidos;
        console.log('✅ Partidos asignados, cantidad:', this.partidos.length);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar partidos:', error);
        this.error = 'Error al cargar partidos: ' + (error.message || 'Error desconocido');
        this.isLoading = false;
      }
    });
  }

  loadHistorial() {
    console.log('📜 Cargando historial de partidos...');
    this.isLoading = true;
    this.partidoService.getHistorialPartidos().subscribe({
      next: (historial) => {
        console.log('✅ Historial recibido:', historial);
        console.log('📊 Cantidad de partidos en historial:', historial.length);
        this.historialPartidos = historial;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar historial:', error);
        this.error = 'Error al cargar historial: ' + (error.message || 'Error desconocido');
        this.isLoading = false;
      }
    });
  }

  loadEquipos() {
    console.log('🏀 Cargando equipos...');
    this.equipoService.getEquipos().subscribe({
      next: (equipos) => {
        console.log('✅ Equipos recibidos:', equipos);
        this.equipos = equipos;
        console.log('✅ Equipos asignados, cantidad:', this.equipos.length);
      },
      error: (error) => {
        console.error('❌ Error al cargar equipos:', error);
      }
    });
  }

  loadJugadores() {
    this.jugadorService.getJugadores().subscribe({
      next: (jugadores) => {
        this.jugadoresDisponibles = jugadores;
        console.log('Jugadores cargados:', jugadores.length, jugadores);
        console.log('EquipoIds de los jugadores:', jugadores.map(j => ({ 
          nombre: j.nombreCompleto, 
          equipoId: j.equipo?.id || 0, 
          equipoNombre: j.equipo?.nombre || 'Sin equipo' 
        })));
      },
      error: (error) => {
        console.error('Error al cargar jugadores:', error);
      }
    });
  }

  get partidosFiltrados(): PartidoResultado[] {
    return this.partidos.filter(partido => {
      const coincideEquipo = !this.filtroEquipo || 
        partido.equipoLocalNombre.toLowerCase().includes(this.filtroEquipo.toLowerCase()) ||
        partido.equipoVisitanteNombre.toLowerCase().includes(this.filtroEquipo.toLowerCase());
      const coincideEstado = !this.filtroEstado || 
        partido.estado.toLowerCase().includes(this.filtroEstado.toLowerCase());
      
      return coincideEquipo && coincideEstado;
    });
  }

  cambiarVista(vista: 'partidos' | 'historial') {
    this.vistaActiva = vista;
    if (vista === 'historial' && this.historialPartidos.length === 0) {
      this.loadHistorial();
    }
  }

  openCreateModal() {
    this.partidoForm.reset();
    this.jugadoresLocalSeleccionados = [];
    this.jugadoresVisitanteSeleccionados = [];
    this.equipoLocalId = 0;
    this.equipoVisitanteId = 0;
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.partidoForm.reset();
    this.error = '';
  }

  onEquipoLocalChange(equipoId: number) {
    console.log('Equipo local seleccionado:', equipoId);
    this.equipoLocalId = Number(equipoId) || 0;
    this.jugadoresLocalSeleccionados = [];
    console.log('Jugadores del equipo local:', this.getJugadoresByEquipo(this.equipoLocalId));
  }

  onEquipoVisitanteChange(equipoId: number) {
    console.log('Equipo visitante seleccionado:', equipoId);
    this.equipoVisitanteId = Number(equipoId) || 0;
    this.jugadoresVisitanteSeleccionados = [];
    console.log('Jugadores del equipo visitante:', this.getJugadoresByEquipo(this.equipoVisitanteId));
  }

  getJugadoresByEquipo(equipoId: number): Jugador[] {
    const jugadores = this.jugadoresDisponibles.filter(j => j.equipo?.id === equipoId);
    console.log(`Jugadores del equipo ${equipoId}:`, jugadores);
    return jugadores;
  }

  toggleJugadorLocal(jugadorId: number) {
    const index = this.jugadoresLocalSeleccionados.indexOf(jugadorId);
    if (index > -1) {
      this.jugadoresLocalSeleccionados.splice(index, 1);
    } else {
      this.jugadoresLocalSeleccionados.push(jugadorId);
    }
  }

  toggleJugadorVisitante(jugadorId: number) {
    const index = this.jugadoresVisitanteSeleccionados.indexOf(jugadorId);
    if (index > -1) {
      this.jugadoresVisitanteSeleccionados.splice(index, 1);
    } else {
      this.jugadoresVisitanteSeleccionados.push(jugadorId);
    }
  }

  onSubmit() {
    if (this.partidoForm.valid && this.equipoLocalId !== this.equipoVisitanteId) {
      this.isLoading = true;
      this.error = '';
      
      const formData = this.partidoForm.value;
      const createData: PartidoCreateRequest = {
        equipoLocalId: parseInt(formData.equipoLocalId),
        equipoVisitanteId: parseInt(formData.equipoVisitanteId),
        fechaPartido: this.formatearFechaLocal(formData.fechaPartido),
        puntuacionLocal: 0,
        puntuacionVisitante: 0,
        periodo: 1,
        tiempoRestante: "12:00",
        faltasLocal: 0,
        faltasVisitante: 0,
        tiemposMuertosLocal: 7,
        tiemposMuertosVisitante: 7,
        estado: "programado",  // Los partidos se crean en estado programado
        jugadoresLocalIds: this.jugadoresLocalSeleccionados,
        jugadoresVisitanteIds: this.jugadoresVisitanteSeleccionados
      };

      this.alertService.loading('Creando partido...');
      this.partidoService.crearPartidoNuevo(createData).subscribe({
        next: (partido) => {
          this.alertService.close();
          // Partido creado exitosamente con jugadores incluidos
          this.loadPartidos();
          this.closeCreateModal();
          this.isLoading = false;
          
          const equipoLocal = this.equipos.find(e => e.id === createData.equipoLocalId);
          const equipoVisitante = this.equipos.find(e => e.id === createData.equipoVisitanteId);
          
          this.alertService.success(
            '¡Partido creado!',
            `${equipoLocal?.nombre || 'Equipo Local'} vs ${equipoVisitante?.nombre || 'Equipo Visitante'}`
          );
        },
        error: (error: any) => {
          this.alertService.close();
          this.alertService.error(
            'Error al crear partido',
            error.message || 'No se pudo crear el partido. Por favor, intente nuevamente.'
          );
          this.isLoading = false;
        }
      });
    } else if (this.equipoLocalId === this.equipoVisitanteId) {
      this.alertService.warning(
        'Equipos inválidos',
        'Los equipos local y visitante deben ser diferentes'
      );
    } else {
      this.alertService.warning(
        'Formulario incompleto',
        'Por favor, complete todos los campos requeridos'
      );
    }
  }

  verRoster(partido: PartidoResultado) {
    this.partidoSeleccionado = partido;
    this.isLoading = true;
    
    this.partidoService.getRosterPartido(partido.id).subscribe({
      next: (roster) => {
        this.roster = roster;
        this.showRosterModal = true;
        this.isLoading = false;
      },
      error: (error) => {
        this.alertService.error(
          'Error al cargar roster',
          error.message || 'No se pudo cargar el roster del partido.'
        );
        this.isLoading = false;
      }
    });
  }

  closeRosterModal() {
    this.showRosterModal = false;
    this.partidoSeleccionado = null;
    this.roster = [];
  }

  finalizarPartido(partido: PartidoResultado) {
    this.alertService.confirm(
      '¿Finalizar partido?',
      `¿Está seguro de finalizar el partido ${partido.equipoLocalNombre} vs ${partido.equipoVisitanteNombre}? Esta acción no se puede deshacer.`
    ).then((result) => {
      if (result.isConfirmed) {
        this.alertService.loading('Finalizando partido...');
        this.partidoService.finalizarPartido(partido.id).subscribe({
          next: () => {
            this.alertService.close();
            this.loadPartidos();
            this.alertService.success(
              '¡Partido finalizado!',
              `El partido ${partido.equipoLocalNombre} vs ${partido.equipoVisitanteNombre} ha sido finalizado`
            );
          },
          error: (error) => {
            this.alertService.close();
            this.alertService.error(
              'Error al finalizar partido',
              error.message || 'No se pudo finalizar el partido. Por favor, intente nuevamente.'
            );
          }
        });
      }
    });
  }

  eliminarPartido(partido: PartidoResultado) {
    this.alertService.confirmDelete(
      `${partido.equipoLocalNombre} vs ${partido.equipoVisitanteNombre}`
    ).then((result) => {
      if (result.isConfirmed) {
        this.alertService.loading('Eliminando partido...');
        this.partidoService.eliminarPartido(partido.id).subscribe({
          next: () => {
            this.alertService.close();
            this.loadPartidos();
            this.alertService.success(
              '¡Partido eliminado!',
              'El partido ha sido eliminado exitosamente'
            );
          },
          error: (error: any) => {
            this.alertService.close();
            this.alertService.error(
              'Error al eliminar partido',
              error.message || 'No se pudo eliminar el partido. Por favor, intente nuevamente.'
            );
          }
        });
      }
    });
  }

  limpiarFiltros() {
    this.filtroEquipo = '';
    this.filtroEstado = '';
  }

  getEquipoNombre(equipoId: number): string {
    const equipo = this.equipos.find(e => e.id === equipoId);
    return equipo ? equipo.nombre : 'Equipo no encontrado';
  }

  getJugadorNombre(jugadorId: number): string {
    const jugador = this.jugadoresDisponibles.find(j => j.id === jugadorId);
    return jugador ? jugador.nombreCompleto : 'Jugador no encontrado';
  }

  private asignarJugadoresAlPartido(partidoId: number) {
    const todasLasAsignaciones: Promise<void>[] = [];

    // Asignar jugadores locales
    this.jugadoresLocalSeleccionados.forEach(jugadorId => {
      const asignacion: AsignarJugadorRoster = {
        jugadorId: jugadorId,
        esTitular: true
      };
      todasLasAsignaciones.push(
        firstValueFrom(this.partidoService.asignarJugadorAlRoster(partidoId, asignacion))
      );
    });

    // Asignar jugadores visitantes
    this.jugadoresVisitanteSeleccionados.forEach(jugadorId => {
      const asignacion: AsignarJugadorRoster = {
        jugadorId: jugadorId,
        esTitular: true
      };
      todasLasAsignaciones.push(
        firstValueFrom(this.partidoService.asignarJugadorAlRoster(partidoId, asignacion))
      );
    });

    // Esperar que todas las asignaciones se completen
    Promise.all(todasLasAsignaciones).then(() => {
      this.loadPartidos();
      this.closeCreateModal();
      this.isLoading = false;
    }).catch(error => {
      this.error = 'Error al asignar jugadores: ' + (error.message || 'Error desconocido');
      this.isLoading = false;
    });
  }

  // Método mejorado para iniciar partido desde gestión
  iniciarPartido(partidoId: number) {
    this.isLoading = true;
    this.error = '';

    console.log('Iniciando partido desde gestión:', partidoId);

    this.partidoService.iniciarPartido(partidoId).subscribe({
      next: () => {
        console.log('Partido iniciado exitosamente, redirigiendo al marcador...');
        
        // Mostrar mensaje de éxito
        this.alertService.success(
          '¡Partido iniciado!',
          'El partido se ha iniciado correctamente. Redirigiendo al marcador...'
        );
        
        // Recargar partidos para mostrar el cambio de estado
        this.loadPartidos();
        
        // Redirigir al componente principal con sección marcador y partido cargado
        setTimeout(() => {
          this.abrirMarcador(partidoId);
        }, 1500); // Dar tiempo para ver el mensaje
        
        this.isLoading = false;
      },
      error: (error) => {
        this.alertService.error(
          'Error al iniciar partido',
          error.message || 'No se pudo iniciar el partido. Por favor, intente nuevamente.'
        );
        console.error('Error:', error);
        this.isLoading = false;
      }
    });
  }

  abrirMarcador(partidoId: number) {
    console.log('Navegando al marcador para partido:', partidoId);
    // Navegar al componente marcador con query parameters
    this.router.navigate(['/marcador'], { queryParams: { partidoId: partidoId, section: 'marcador' } });
  }

  /**
   * Formatear fecha manteniendo la hora local (sin conversión a UTC)
   */
  private formatearFechaLocal(fechaInput: string): string {
    const fecha = new Date(fechaInput);
    
    // Obtener componentes de fecha en hora local
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0');
    
    // Formatear como ISO pero sin la conversión UTC
    return `${año}-${mes}-${dia}T${horas}:${minutos}:${segundos}`;
  }
}