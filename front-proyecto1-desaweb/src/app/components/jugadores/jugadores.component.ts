import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JugadorService, Jugador, JugadorCreateRequest, JugadorUpdateRequest } from '../../services/jugador.service';
import { EquipoService, Equipo } from '../../services/equipo.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-jugadores',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './jugadores.component.html',
  styleUrls: ['./jugadores.component.css']
})
export class JugadoresComponent implements OnInit {
  private jugadorService = inject(JugadorService);
  private equipoService = inject(EquipoService);
  private fb = inject(FormBuilder);
  private alertService = inject(AlertService);

  // Estados
  jugadores: Jugador[] = [];
  equipos: Equipo[] = [];
  isLoading = false;
  error = '';
  showModal = false;
  isEditing = false;
  currentJugadorId: string | number | null = null;
  showDeleteModal = false;
  jugadorToDelete: Jugador | null = null;
  
  // Vista de jugadores activos/inactivos
  mostrarInactivos = false;

  // Filtros
  filtroEquipo = '';
  filtroNombre = '';
  filtroNumero = '';
  filtroPosicion = '';

  // Formulario
  jugadorForm: FormGroup;

  // Posiciones predefinidas
  posiciones = [
    'Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'
  ];

  constructor() {
    this.jugadorForm = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.minLength(2)]],
      numero: ['', [Validators.required, Validators.min(0), Validators.max(99)]],
      posicion: ['', Validators.required],
      estatura: ['', [Validators.required, Validators.min(1.50), Validators.max(2.50)]],
      edad: ['', [Validators.required, Validators.min(16), Validators.max(50)]],
      nacionalidad: ['', [Validators.required, Validators.minLength(2)]],
      foto: [''],
      equipoId: ['', Validators.required],
      isActivo: [true]
    });
  }

  ngOnInit() {
    this.loadJugadores();
    this.loadEquipos();
  }

  loadJugadores() {
    this.isLoading = true;
    this.error = '';
    
    this.jugadorService.getJugadores().subscribe({
      next: (jugadores) => {
        this.jugadores = jugadores;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar jugadores: ' + (error.message || 'Error desconocido');
        console.error('Error al cargar jugadores:', error);
        this.alertService.error('Error al cargar', 'No se pudieron cargar los jugadores');
        this.isLoading = false;
      }
    });
  }

  loadEquipos() {
    this.equipoService.getEquipos().subscribe({
      next: (equipos) => {
        this.equipos = equipos;
      },
      error: (error) => {
        console.error('Error al cargar equipos:', error);
      }
    });
  }

  get jugadoresFiltrados(): Jugador[] {
    return this.jugadores.filter(jugador => {
      // Filtrar por estado activo/inactivo según la vista seleccionada
      const estadoActivo = jugador.isActivo ?? jugador.activo ?? true;
      const coincideEstado = this.mostrarInactivos ? !estadoActivo : estadoActivo;
      
      const nombreEquipo = jugador.equipo?.nombre || jugador.equipoNombre || '';
      const coincideEquipo = !this.filtroEquipo || 
        nombreEquipo.toLowerCase().includes(this.filtroEquipo.toLowerCase());
      const coincideNombre = !this.filtroNombre || 
        jugador.nombreCompleto.toLowerCase().includes(this.filtroNombre.toLowerCase());
      const coincideNumero = !this.filtroNumero || 
        jugador.numero.toString().includes(this.filtroNumero);
      const coincidePosicion = !this.filtroPosicion || 
        jugador.posicion.toLowerCase().includes(this.filtroPosicion.toLowerCase());
      
      return coincideEstado && coincideEquipo && coincideNombre && coincideNumero && coincidePosicion;
    });
  }

  openCreateModal() {
    this.isEditing = false;
    this.currentJugadorId = null;
    this.jugadorForm.reset();
    this.jugadorForm.patchValue({ isActivo: true });
    this.showModal = true;
  }

  openEditModal(jugador: Jugador) {
    this.isEditing = true;
    this.currentJugadorId = jugador.id || jugador._id || null;
    const equipoIdValue = jugador.equipo?.id || jugador.equipoId;
    
    this.jugadorForm.patchValue({
      nombreCompleto: jugador.nombreCompleto,
      numero: jugador.numero,
      posicion: jugador.posicion,
      estatura: jugador.estatura,
      edad: jugador.edad || 0,
      nacionalidad: jugador.nacionalidad || '',
      foto: jugador.foto || '',
      equipoId: equipoIdValue,
      isActivo: jugador.isActivo ?? jugador.activo ?? true
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.jugadorForm.reset();
    this.error = '';
  }

  onSubmit() {
    if (this.jugadorForm.valid) {
      this.isLoading = true;
      this.error = '';
      
      const formData = this.jugadorForm.value;
      
      // Obtener el nombre del equipo seleccionado
      const equipoSeleccionado = this.equipos.find(e => e.id === parseInt(formData.equipoId));
      const equipoNombre = equipoSeleccionado?.nombre || '';
      
      if (this.isEditing && this.currentJugadorId) {
        const updateData: JugadorUpdateRequest = {
          nombreCompleto: formData.nombreCompleto,
          numero: parseInt(formData.numero),
          posicion: formData.posicion,
          estatura: parseFloat(formData.estatura),
          edad: parseInt(formData.edad),
          nacionalidad: formData.nacionalidad,
          foto: formData.foto || undefined,
          equipoId: parseInt(formData.equipoId),
          equipoNombre: equipoNombre,
          isActivo: formData.isActivo
        };
        
        this.alertService.loading('Actualizando jugador...', 'Por favor espera');
        
        this.jugadorService.updateJugador(this.currentJugadorId, updateData).subscribe({
          next: () => {
            this.alertService.close();
            this.alertService.success('¡Actualizado!', `${formData.nombreCompleto} se actualizó correctamente`);
            this.loadJugadores();
            this.closeModal();
          },
          error: (error) => {
            this.alertService.close();
            this.error = 'Error al actualizar: ' + (error.message || 'Error desconocido');
            this.alertService.error('Error al actualizar', error.message || 'No se pudo actualizar el jugador');
            console.error('Error:', error);
            this.isLoading = false;
          }
        });
      } else {
        const createData: JugadorCreateRequest = {
          nombreCompleto: formData.nombreCompleto,
          numero: parseInt(formData.numero),
          posicion: formData.posicion,
          estatura: parseFloat(formData.estatura),
          edad: parseInt(formData.edad),
          nacionalidad: formData.nacionalidad,
          foto: formData.foto || undefined,
          equipoId: parseInt(formData.equipoId),
          equipoNombre: equipoNombre
        };
        
        this.alertService.loading('Creando jugador...', 'Por favor espera');
        
        this.jugadorService.createJugador(createData).subscribe({
          next: () => {
            this.alertService.close();
            this.alertService.success('¡Jugador creado!', `${formData.nombreCompleto} se agregó correctamente`);
            this.loadJugadores();
            this.closeModal();
          },
          error: (error) => {
            this.alertService.close();
            this.error = 'Error al crear: ' + (error.message || 'Error desconocido');
            this.alertService.error('Error al crear', error.message || 'No se pudo crear el jugador');
            console.error('Error:', error);
            this.isLoading = false;
          }
        });
      }
    } else {
      this.alertService.warning('Formulario incompleto', 'Por favor completa todos los campos requeridos');
    }
  }

  openDeleteModal(jugador: Jugador) {
    console.log('Eliminar jugador:', jugador.nombreCompleto, '| ID:', jugador._id || jugador.id);
    
    this.alertService.confirmDelete(jugador.nombreCompleto).then((result) => {
      if (result.isConfirmed) {
        this.confirmDelete(jugador);
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.jugadorToDelete = null;
  }

  confirmDelete(jugador: Jugador) {
    const jugadorId = jugador._id || jugador.id;
    
    console.log('Eliminando jugador ID:', jugadorId);
    
    if (!jugadorId) {
      this.alertService.error('Error', 'ID del jugador no encontrado');
      return;
    }
    
    this.isLoading = true;
    this.error = '';
    
    this.alertService.loading('Eliminando jugador...', 'Por favor espera');
    
    this.jugadorService.deleteJugador(jugadorId).subscribe({
      next: () => {
        console.log('Eliminado exitosamente');
        this.alertService.close();
        this.alertService.success('¡Eliminado!', `${jugador.nombreCompleto} fue eliminado correctamente`);
        this.loadJugadores();
        this.closeDeleteModal();
      },
      error: (error) => {
        this.alertService.close();
        this.error = 'Error al eliminar: ' + (error.message || 'Error desconocido');
        this.alertService.error('Error al eliminar', error.message || 'No se pudo eliminar el jugador');
        console.error('Error:', error);
        this.isLoading = false;
      }
    });
  }

  getEquipoNombre(equipoId: number): string {
    const equipo = this.equipos.find(e => e.id === equipoId);
    return equipo ? equipo.nombre : 'Equipo no encontrado';
  }

  limpiarFiltros() {
    this.filtroEquipo = '';
    this.filtroNombre = '';
    this.filtroNumero = '';
    this.filtroPosicion = '';
  }
  
  // Método para alternar entre vista activos/inactivos
  toggleVistaInactivos() {
    this.mostrarInactivos = !this.mostrarInactivos;
    this.limpiarFiltros(); // Limpiar filtros al cambiar de vista
  }
  
  // Método para reactivar un jugador
  reactivarJugador(jugador: Jugador) {
    const jugadorId = jugador._id || jugador.id;
    
    if (!jugadorId) {
      this.alertService.error('Error', 'ID del jugador no encontrado');
      return;
    }
    
    this.alertService.confirm(
      '¿Reactivar jugador?',
      `¿Estás seguro de reactivar a ${jugador.nombreCompleto}?`,
      'Sí, reactivar',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.alertService.loading('Reactivando jugador...', 'Por favor espera');
        
        const updateData: JugadorUpdateRequest = {
          nombreCompleto: jugador.nombreCompleto,
          numero: jugador.numero,
          posicion: jugador.posicion,
          estatura: jugador.estatura,
          edad: jugador.edad || 0,
          nacionalidad: jugador.nacionalidad || '',
          foto: jugador.foto || undefined,
          equipoId: jugador.equipo?.id || jugador.equipoId || 0,
          equipoNombre: jugador.equipo?.nombre || jugador.equipoNombre || '',
          isActivo: true
        };
        
        this.jugadorService.updateJugador(jugadorId, updateData).subscribe({
          next: () => {
            this.alertService.close();
            this.alertService.success('¡Reactivado!', `${jugador.nombreCompleto} ha sido reactivado correctamente`);
            this.loadJugadores();
          },
          error: (error) => {
            this.alertService.close();
            this.alertService.error('Error al reactivar', error.message || 'No se pudo reactivar el jugador');
            console.error('Error:', error);
            this.isLoading = false;
          }
        });
      }
    });
  }

  // Método para obtener URL de imagen (sin servicio, devuelve la URL directamente)
  getImageUrl(url: string): string {
    return url || '';
  }

  // Método helper para obtener ID del jugador (maneja tanto _id como id)
  getJugadorId(jugador: Jugador): string | number {
    return jugador._id || jugador.id || '';
  }

  // Track by function para el @for
  trackByJugador(index: number, jugador: Jugador): string | number {
    return jugador._id || jugador.id || index;
  }
}