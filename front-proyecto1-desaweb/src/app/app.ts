import { Component, signal, OnDestroy, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PartidoService, Partido } from './services/partido.service';
import { EquipoService, Equipo } from './services/equipo.service';
import { AuthService, UserDto, CreateUserRequest } from './services/auth.service';
import { ValidationService, ValidationResult } from './services/validation.service';
import { AlertService } from './services/alert.service';
import { JugadoresComponent } from './components/jugadores/jugadores.component';
import { PartidosComponent } from './components/partidos/partidos.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { PanelUsuarioComponent } from './components/panel-usuario/panel-usuario.component';
import { LoginComponent } from './components/login.component';
import { ReportesComponent } from './components/reportes/reportes.component';

@Component({
  selector: 'app-marcador',
  standalone: true,
  imports: [CommonModule, FormsModule, JugadoresComponent, PartidosComponent, UsuariosComponent, PanelUsuarioComponent, LoginComponent, ReportesComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly titulo = signal('Marcador de Baloncesto');

  // Puntuaciones
  puntuacionLocal = signal(0);
  puntuacionVisitante = signal(0);

  // Nombres de equipos
  equipoLocal = signal('Local');
  equipoVisitante = signal('Visitante');

  // Período (Cuarto)
  periodo = signal(1);
  maximosPeriodos = 4;

  // Tiempo (en segundos)
  tiempo = signal(600); // 10 minutos
  estaCorriendo = signal(false);
  private intervaloId: any;

  // Faltas
  faltasLocal = signal(0);
  faltasVisitante = signal(0);
  maximasFaltas = 5;

  // Tiempos muertos
  tiemposMuertosLocal = signal(7);
  tiemposMuertosVisitante = signal(7);

  // Estado del partido
  private partidoId: number | null = null;
  partidoIniciado = signal(false);
  guardando = signal(false);
  mensajeEstado = signal('');
  estadoPartido = signal('PROGRAMADO'); // Signal para el estado del partido

  // Equipos disponibles
  equiposDisponibles = signal<Equipo[]>([]);
  equipoLocalSeleccionado = signal<Equipo | null>(null);
  equipoVisitanteSeleccionado = signal<Equipo | null>(null);

  // Usuarios
  totalUsuarios = signal(0);

  // Dashboard de administrador (vista principal)
  seccionActiva = signal('dashboard'); // 'dashboard', 'marcador', 'equipos', 'jugadores', 'usuarios', etc.
  fechaActual = new Date();
  mostrarModalCrearEquipo = signal(false);
  mostrarModalEditarEquipo = signal(false);
  mostrarModalCrearJugador = signal(false);

  // Referencias a componentes hijos
  @ViewChild(JugadoresComponent) jugadoresComponent!: JugadoresComponent;

  
  // Método para formatear fecha de creación
  formatFechaCreacion(fechaCreacion: string): string {
    const fecha = new Date(fechaCreacion);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (dias === 0) {
      return 'Hoy';
    } else if (dias === 1) {
      return 'Ayer';
    } else if (dias < 7) {
      return `Hace ${dias} días`;
    } else {
      return fecha.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    }
  }
  
  // Formularios de administrador
  nuevoEquipo = signal({ nombre: '', ciudad: '', logo: '', descripcion: '' });
  equipoEditando = signal<Equipo | null>(null);
  nuevoJugador = signal({ nombre: '', numero: 0, posicion: '', equipoId: 0 });
  
  // Validaciones en tiempo real
  equipoValidations = signal<{ [key: string]: ValidationResult }>({});
  jugadorValidations = signal<{ [key: string]: ValidationResult }>({});
  usuarioValidations = signal<{ [key: string]: ValidationResult }>({});
  
  // Gestión de equipos
  busquedaEquipo = signal('');
  equiposFiltrados = signal<Equipo[]>([]);
  cargandoEquipos = signal(false);
  
  // Métodos para actualizar formularios con validación en tiempo real
  actualizarNuevoEquipo(campo: string, valor: string) {
    const equipo = { ...this.nuevoEquipo() };
    (equipo as any)[campo] = valor;
    this.nuevoEquipo.set(equipo);
    
    // Validar en tiempo real
    const validations = this.validationService.validateEquipo(equipo);
    this.equipoValidations.set(validations);
  }
  
  actualizarNuevoJugador(campo: string, valor: any) {
    const jugador = { ...this.nuevoJugador() };
    (jugador as any)[campo] = valor;
    this.nuevoJugador.set(jugador);
    
    // Validar en tiempo real
    const validations = this.validationService.validateJugador(jugador);
    this.jugadorValidations.set(validations);
  }

  constructor(
    private partidoService: PartidoService,
    private equipoService: EquipoService,
    public authService: AuthService,
    private validationService: ValidationService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarEquipos();
    this.cargarTotalUsuarios();
    
    // Cargar partido si viene desde gestión de partidos
    this.route.queryParams.subscribe(params => {
      if (params['partidoId']) {
        this.cargarPartidoExistente(parseInt(params['partidoId']));
      }
      
      // Cambiar sección si se especifica
      if (params['section']) {
        this.seccionActiva.set(params['section']);
      }
    });
  }

  ngOnDestroy() {
    this.detenerTemporizador();
  }
  guardarEstadoPartido(estadoPersonalizado?: 'EN_CURSO' | 'FINALIZADO', tiempoComoString: boolean = false) {
    // Mostrar estado de guardado
    this.guardando.set(true);
    this.mensajeEstado.set('Guardando partido...');

    if (this.partidoId) {
      // Si ya existe un partido, actualizar el marcador
      const marcadorData = {
        puntuacionLocal: this.puntuacionLocal(),
        puntuacionVisitante: this.puntuacionVisitante(),
        periodo: this.periodo(),
        tiempoRestante: this.formatearTiempo(this.tiempo()),
        faltasLocal: this.faltasLocal(),
        faltasVisitante: this.faltasVisitante(),
        tiemposMuertosLocal: this.tiemposMuertosLocal(),
        tiemposMuertosVisitante: this.tiemposMuertosVisitante(),
        estado: estadoPersonalizado || 'EN_JUEGO'
      };

      console.log('Actualizando marcador del partido:', this.partidoId, marcadorData);

      this.partidoService.actualizarMarcador(this.partidoId, marcadorData).subscribe({
        next: (resultado) => {
          this.mensajeEstado.set('Marcador actualizado exitosamente');
          this.guardando.set(false);
          console.log('Marcador actualizado:', resultado);
          
          // Forzar detección de cambios después de actualizar
          this.cdr.detectChanges();
          
          // Limpiar mensaje después de 2 segundos
          setTimeout(() => {
            this.mensajeEstado.set('');
          }, 2000);
        },
        error: (error) => {
          console.error('Error al actualizar marcador:', error);
          this.mensajeEstado.set('Error al actualizar marcador: ' + (error.message || 'Error desconocido'));
          this.guardando.set(false);
          
          // Limpiar mensaje de error después de 5 segundos
          setTimeout(() => {
            this.mensajeEstado.set('');
          }, 5000);
        }
      });
    } else {
      // Si no existe un partido, crear uno nuevo (lógica original)
      const equipoLocal = this.equipoLocalSeleccionado();
      const equipoVisitante = this.equipoVisitanteSeleccionado();
      
      if (!equipoLocal || !equipoVisitante) {
        console.error('No se pueden obtener los IDs de los equipos');
        this.mensajeEstado.set('Error: No se han seleccionado equipos válidos');
        this.guardando.set(false);
        return;
      }
      
      const partidaCreateDto = {
        equipoLocalId: equipoLocal.id,
        equipoVisitanteId: equipoVisitante.id,
        puntuacionLocal: this.puntuacionLocal(),
        puntuacionVisitante: this.puntuacionVisitante(),
        periodo: this.periodo(),
        tiempoRestante: this.formatearTiempo(this.tiempo()),
        faltasLocal: this.faltasLocal(),
        faltasVisitante: this.faltasVisitante(),
        tiemposMuertosLocal: this.tiemposMuertosLocal(),
        tiemposMuertosVisitante: this.tiemposMuertosVisitante(),
        estado: estadoPersonalizado || 'PROGRAMADO',
        fechaPartido: new Date().toISOString(),
        jugadoresLocalIds: [],
        jugadoresVisitanteIds: []
      };

      console.log('Creando partido con datos:', partidaCreateDto);
      
      this.partidoService.crearPartidoNuevo(partidaCreateDto).subscribe({
        next: (resultado) => {
          console.log('Partido creado exitosamente:', resultado);
          this.partidoId = resultado.id;
          this.partidoIniciado.set(true);
          this.mensajeEstado.set('Partido creado exitosamente');
          this.guardando.set(false);
        },
        error: (error) => {
          console.error('Error al guardar el partido:', error);
          this.mensajeEstado.set('Error al guardar el partido');
          this.guardando.set(false);
        }
      });
    }
  }

  // Métodos para actualizar puntuaciones
  agregarPuntos(equipo: 'local' | 'visitante', puntos: number) {
    console.log(`Agregando ${puntos} puntos al equipo ${equipo}`);
    
    if (equipo === 'local') {
      const nuevaPuntuacion = this.puntuacionLocal() + puntos;
      this.puntuacionLocal.set(nuevaPuntuacion);
      console.log(`Nueva puntuación local: ${nuevaPuntuacion}`);
    } else {
      const nuevaPuntuacion = this.puntuacionVisitante() + puntos;
      this.puntuacionVisitante.set(nuevaPuntuacion);
      console.log(`Nueva puntuación visitante: ${nuevaPuntuacion}`);
    }
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
    
    // Guardar automáticamente si hay un partido iniciado
    if (this.partidoId) {
      this.guardarEstadoPartido();
    }
  }

  // Métodos para el marcador de baloncesto
  iniciarPartido() {
    console.log('=== INICIANDO PARTIDO ===');
    console.log('Equipos disponibles:', this.equiposDisponibles());
    
    const equipoLocal = this.equipoLocalSeleccionado();
    const equipoVisitante = this.equipoVisitanteSeleccionado();
    
    console.log('Equipo local seleccionado:', equipoLocal);
    console.log('Equipo visitante seleccionado:', equipoVisitante);
    
    // Validaciones detalladas
    if (!equipoLocal) {
      const mensaje = 'Por favor selecciona un equipo local';
      console.error(mensaje);
      alert(mensaje);
      this.mensajeEstado.set(mensaje);
      return;
    }
    
    if (!equipoVisitante) {
      const mensaje = 'Por favor selecciona un equipo visitante';
      console.error(mensaje);
      alert(mensaje);
      this.mensajeEstado.set(mensaje);
      return;
    }
    
    if (equipoLocal.id === equipoVisitante.id) {
      const mensaje = 'Los equipos deben ser diferentes';
      console.error(mensaje);
      alert(mensaje);
      this.mensajeEstado.set(mensaje);
      return;
    }
    
    try {
      // Configurar el partido
      console.log('Configurando partido...');
      console.log('Nombres antes de asignar:', { local: equipoLocal.nombre, visitante: equipoVisitante.nombre });
      
      this.equipoLocal.set(equipoLocal.nombre);
      this.equipoVisitante.set(equipoVisitante.nombre);
      
      console.log('Nombres después de asignar:', { 
        local: this.equipoLocal(), 
        visitante: this.equipoVisitante() 
      });
      
      console.log('Estableciendo partidoIniciado a true...');
      this.partidoIniciado.set(true);
      console.log('partidoIniciado ahora es:', this.partidoIniciado());
      
      this.reiniciarMarcador();
      
      const mensajeExito = `¡Partido iniciado exitosamente! ${equipoLocal.nombre} vs ${equipoVisitante.nombre}`;
      console.log(mensajeExito);
      this.mensajeEstado.set(mensajeExito);
      
      // También mostrar alerta de éxito
      alert(mensajeExito);
      
      // Verificar estado después de la alert
      console.log('Estado después de alert:', {
        partidoIniciado: this.partidoIniciado(),
        equipoLocal: this.equipoLocal(),
        equipoVisitante: this.equipoVisitante()
      });
      
    } catch (error) {
      console.error('Error al iniciar partido:', error);
      const mensajeError = 'Error al iniciar el partido. Intenta nuevamente.';
      this.mensajeEstado.set(mensajeError);
      alert(mensajeError);
    }
  }

  terminarPartido() {
    this.alertService.confirm(
      '¿Terminar el partido?',
      'Esta acción finalizará el partido permanentemente. Los resultados se guardarán y no se podrán modificar.',
      'Sí, terminar partido',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        console.log('Usuario confirmó terminar partido');
        this.detenerTemporizador();
        this.finalizarPartido();
        this.alertService.success('¡Partido finalizado!', 'El partido se ha guardado correctamente');
      }
    });
  }

  // Gestión de faltas
  sumarFalta(equipo: 'local' | 'visitante') {
    if (equipo === 'local') {
      this.faltasLocal.update(faltas => Math.min(this.maximasFaltas, faltas + 1));
    } else {
      this.faltasVisitante.update(faltas => Math.min(this.maximasFaltas, faltas + 1));
    }
  }

  // Gestión de períodos
  anteriorPeriodo() {
    if (this.periodo() > 1) {
      this.periodo.update(p => p - 1);
      this.reiniciarTemporizador();
    }
  }

  // Alias para compatibilidad con el HTML
  sumarPuntos = (equipo: 'local' | 'visitante', puntos: number) => {
    console.log(`CLICK DETECTADO: sumarPuntos(${equipo}, ${puntos})`);
    this.agregarPuntos(equipo, puntos);
  }
  
  iniciarTiempo = this.iniciarTemporizador;
  pausarTiempo = this.pausarTemporizador;
  reiniciarTiempo = this.reiniciarTemporizador;

  restarPuntos = (equipo: 'local' | 'visitante', puntos: number) => {
    console.log(`CLICK DETECTADO: restarPuntos(${equipo}, ${puntos})`);
    console.log(`Restando ${puntos} puntos del equipo ${equipo}`);
    
    if (equipo === 'local') {
      const nuevaPuntuacion = Math.max(0, this.puntuacionLocal() - puntos);
      this.puntuacionLocal.set(nuevaPuntuacion);
      console.log(`Nueva puntuación local: ${nuevaPuntuacion}`);
    } else {
      const nuevaPuntuacion = Math.max(0, this.puntuacionVisitante() - puntos);
      this.puntuacionVisitante.set(nuevaPuntuacion);
      console.log(`Nueva puntuación visitante: ${nuevaPuntuacion}`);
    }
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
    
    // Guardar automáticamente si hay un partido iniciado
    if (this.partidoId) {
      this.guardarEstadoPartido();
    }
  }

  // Controles del temporizador
  iniciarTemporizador() {
    if (!this.estaCorriendo() && this.tiempo() > 0) {
      this.estaCorriendo.set(true);
      this.intervaloId = setInterval(() => {
        this.tiempo.update(t => {
          if (t <= 1) {
            this.detenerTemporizador();
            this.siguientePeriodo();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
  }

  pausarTemporizador() {
    this.detenerTemporizador();
    // Guardar estado cuando se pausa (estado EN_CURSO, tiempo como número)
    this.guardarEstadoPartido('EN_CURSO', false);
  }

  reiniciarTemporizador() {
    this.detenerTemporizador();
    this.tiempo.set(600);
    // No guardar automáticamente, solo cuando se presione pausa o reiniciar partido
  }

  private detenerTemporizador() {
    if (this.intervaloId) {
      clearInterval(this.intervaloId);
      this.intervaloId = null;
    }
    this.estaCorriendo.set(false);
  }

  // Controles de período
  siguientePeriodo() {
    if (this.periodo() < this.maximosPeriodos) {
      this.periodo.update(p => p + 1);
      this.reiniciarTemporizador();
      // No necesitamos guardar aquí porque reiniciarTemporizador() ya lo hace
    }
  }

  periodoAnterior() {
    if (this.periodo() > 1) {
      this.periodo.update(p => p - 1);
      this.reiniciarTemporizador();
      // No necesitamos guardar aquí porque reiniciarTemporizador() ya lo hace
    }
  }

  // Faltas
  agregarFalta(equipo: 'local' | 'visitante') {
    console.log(`Agregando falta al equipo ${equipo}`);
    
    if (equipo === 'local' && this.faltasLocal() < this.maximasFaltas) {
      const nuevasFaltas = this.faltasLocal() + 1;
      this.faltasLocal.set(nuevasFaltas);
      console.log(`Nuevas faltas local: ${nuevasFaltas}`);
    } else if (equipo === 'visitante' && this.faltasVisitante() < this.maximasFaltas) {
      const nuevasFaltas = this.faltasVisitante() + 1;
      this.faltasVisitante.set(nuevasFaltas);
      console.log(`Nuevas faltas visitante: ${nuevasFaltas}`);
    }
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
    
    // No guardar automáticamente, solo cuando se presione pausa o reiniciar
  }

  restarFalta(equipo: 'local' | 'visitante') {
    console.log(`Restando falta del equipo ${equipo}`);
    
    if (equipo === 'local' && this.faltasLocal() > 0) {
      const nuevasFaltas = this.faltasLocal() - 1;
      this.faltasLocal.set(nuevasFaltas);
      console.log(`Nuevas faltas local: ${nuevasFaltas}`);
    } else if (equipo === 'visitante' && this.faltasVisitante() > 0) {
      const nuevasFaltas = this.faltasVisitante() - 1;
      this.faltasVisitante.set(nuevasFaltas);
      console.log(`Nuevas faltas visitante: ${nuevasFaltas}`);
    }
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
    
    // No guardar automáticamente, solo cuando se presione pausa o reiniciar
  }

  // Tiempos muertos
  usarTiempoMuerto(equipo: 'local' | 'visitante') {
    console.log(`Usando tiempo muerto del equipo ${equipo}`);
    
    if (equipo === 'local' && this.tiemposMuertosLocal() > 0) {
      const nuevosTiemposMuertos = this.tiemposMuertosLocal() - 1;
      this.tiemposMuertosLocal.set(nuevosTiemposMuertos);
      console.log(`Nuevos tiempos muertos local: ${nuevosTiemposMuertos}`);
    } else if (equipo === 'visitante' && this.tiemposMuertosVisitante() > 0) {
      const nuevosTiemposMuertos = this.tiemposMuertosVisitante() - 1;
      this.tiemposMuertosVisitante.set(nuevosTiemposMuertos);
      console.log(`Nuevos tiempos muertos visitante: ${nuevosTiemposMuertos}`);
    }
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
    
    // No guardar automáticamente, solo cuando se presione pausa o reiniciar
  }

  // Reiniciar solo los valores del marcador (sin finalizar el partido)
  reiniciarMarcador() {
    console.log('Reiniciando valores del marcador...');
    this.puntuacionLocal.set(0);
    this.puntuacionVisitante.set(0);
    this.periodo.set(1);
    this.tiempo.set(600); // 10 minutos
    this.faltasLocal.set(0);
    this.faltasVisitante.set(0);
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
    this.tiemposMuertosLocal.set(7);
    this.tiemposMuertosVisitante.set(7);
    this.detenerTemporizador();
    console.log('Valores del marcador reiniciados');
  }

  // Finalizar partido completamente (guardar y resetear todo)
  finalizarPartido() {
    if (!this.partidoIniciado()) {
      console.log('No hay partido activo para finalizar');
      return;
    }

    if (!this.partidoId) {
      console.log('No hay ID de partido para finalizar');
      return;
    }

    // Prevenir múltiples finalizaciones
    if (this.estadoPartido() === 'FINALIZADO') {
      console.log('El partido ya está finalizado');
      return;
    }

    // Prevenir doble click
    if (this.guardando()) {
      console.log('Ya se está procesando la finalización');
      return;
    }

    // Mostrar estado de guardado
    this.guardando.set(true);
    this.mensajeEstado.set('Finalizando partido...');

    // Primero actualizar el marcador final, luego finalizar
    const marcadorFinal = {
      puntuacionLocal: this.puntuacionLocal(),
      puntuacionVisitante: this.puntuacionVisitante(),
      periodo: this.periodo(),
      tiempoRestante: this.formatearTiempo(this.tiempo()),
      faltasLocal: this.faltasLocal(),
      faltasVisitante: this.faltasVisitante(),
      tiemposMuertosLocal: this.tiemposMuertosLocal(),
      tiemposMuertosVisitante: this.tiemposMuertosVisitante(),
      estado: 'FINALIZADO'
    };

    console.log('Finalizando partido:', this.partidoId, marcadorFinal);

    // Solo actualizar el marcador con estado FINALIZADO (una sola llamada)
    this.partidoService.actualizarMarcador(this.partidoId, marcadorFinal).subscribe({
      next: (resultado) => {
        console.log('Marcador final actualizado y partido finalizado:', resultado);
        
        // El partido ya está finalizado con la actualización del marcador
        this.mensajeEstado.set('Partido finalizado exitosamente');
        this.guardando.set(false);
        this.estadoPartido.set('FINALIZADO');

        // Volver al dashboard después de finalizar
        setTimeout(() => {
          this.seccionActiva.set('dashboard');
          this.resetearInformacion();
        }, 2000);
      },
      error: (error) => {
        console.error('Error al actualizar marcador final:', error);
        this.mensajeEstado.set('Error al actualizar marcador final');
        this.guardando.set(false);
        this.resetearInformacion();
      }
    });
  }

  // Método auxiliar para resetear toda la información y salir del modo partido
  private resetearInformacion() {
    console.log('Reseteando toda la información del partido...');
    this.puntuacionLocal.set(0);
    this.puntuacionVisitante.set(0);
    this.periodo.set(1);
    this.tiempo.set(600);
    this.faltasLocal.set(0);
    this.faltasVisitante.set(0);
    this.tiemposMuertosLocal.set(7);
    this.tiemposMuertosVisitante.set(7);
    this.detenerTemporizador();
    this.partidoId = null;
    this.partidoIniciado.set(false);
    this.estadoPartido.set('PROGRAMADO'); // Resetear el estado del partido
    this.equipoLocal.set('Local');
    this.equipoVisitante.set('Visitante');
    this.equipoLocalSeleccionado.set(null);
    this.equipoVisitanteSeleccionado.set(null);
    console.log('Información del partido completamente reseteada');
  }

  // Formatear tiempo como MM:SS
  formatearTiempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
  }

  // Cargar equipos desde la API
  cargarEquipos() {
    console.log('Iniciando carga de equipos...');
    this.cargandoEquipos.set(true);
    this.equipoService.getEquipos().subscribe({
      next: (equipos) => {
        this.equiposDisponibles.set(equipos);
        this.equiposFiltrados.set(equipos);
        console.log('Equipos cargados exitosamente:', equipos);
        console.log('Cantidad de equipos:', equipos.length);
        if (equipos.length === 0) {
          this.mensajeEstado.set('No hay equipos disponibles. Crea equipos primero.');
        }
        this.cargandoEquipos.set(false);
      },
      error: (error) => {
        console.error('Error completo al cargar equipos:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        if (error.status === 401) {
          this.mensajeEstado.set('Error de autenticación. Vuelve a iniciar sesión.');
        } else {
          this.mensajeEstado.set(`Error al cargar equipos: ${error.message || 'Error desconocido'}`);
        }
        this.cargandoEquipos.set(false);
      }
    });
  }

  cargarTotalUsuarios() {
    this.authService.getAllUsers().subscribe({
      next: (usuarios) => {
        this.totalUsuarios.set(usuarios.length);
        console.log('Total de usuarios cargados:', usuarios.length);
      },
      error: (error) => {
        console.error('Error al cargar total de usuarios:', error);
        this.totalUsuarios.set(0);
      }
    });
  }

  // Seleccionar equipo local
  seleccionarEquipoLocal(equipo: Equipo) {
    this.equipoLocalSeleccionado.set(equipo);
    this.equipoLocal.set(equipo.nombre);
  }

  // Seleccionar equipo visitante
  seleccionarEquipoVisitante(equipo: Equipo) {
    this.equipoVisitanteSeleccionado.set(equipo);
    this.equipoVisitante.set(equipo.nombre);
  }

  // Métodos para el cambio de equipos desde el HTML
  onEquipoLocalChange(equipoId: string) {
    console.log('=== SELECCIÓN EQUIPO LOCAL ===');
    console.log('Equipo ID recibido:', equipoId);
    console.log('Equipos disponibles:', this.equiposDisponibles());
    
    if (equipoId) {
      const equipo = this.equiposDisponibles().find(e => e.id === +equipoId);
      console.log('Equipo encontrado:', equipo);
      
      if (equipo) {
        this.seleccionarEquipoLocal(equipo);
        console.log('Equipo local seleccionado exitosamente:', equipo);
        this.mensajeEstado.set(`Equipo local: ${equipo.nombre}`);
      } else {
        console.error('No se encontró el equipo con ID:', equipoId);
        this.mensajeEstado.set('Error: No se pudo seleccionar el equipo local');
      }
    } else {
      console.log('Deseleccionando equipo local');
      this.equipoLocalSeleccionado.set(null);
      this.equipoLocal.set('Local');
    }
  }

  onEquipoVisitanteChange(equipoId: string) {
    console.log('=== SELECCIÓN EQUIPO VISITANTE ===');
    console.log('Equipo ID recibido:', equipoId);
    console.log('Equipos disponibles:', this.equiposDisponibles());
    
    if (equipoId) {
      const equipo = this.equiposDisponibles().find(e => e.id === +equipoId);
      console.log('Equipo encontrado:', equipo);
      
      if (equipo) {
        this.seleccionarEquipoVisitante(equipo);
        console.log('Equipo visitante seleccionado exitosamente:', equipo);
        this.mensajeEstado.set(`Equipo visitante: ${equipo.nombre}`);
      } else {
        console.error('No se encontró el equipo con ID:', equipoId);
        this.mensajeEstado.set('Error: No se pudo seleccionar el equipo visitante');
      }
    } else {
      console.log('Deseleccionando equipo visitante');
      this.equipoVisitanteSeleccionado.set(null);
      this.equipoVisitante.set('Visitante');
    }
  }

  // Cerrar sesión
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Obtener nombre del período
  obtenerNombrePeriodo(): string {
    const numeroPeriodo = this.periodo();
    if (numeroPeriodo <= 4) {
      return `${numeroPeriodo}º Cuarto`;
    } else {
      return `Prórroga ${numeroPeriodo - 4}`;
    }
  }

  // Verificar si el usuario es administrador
  esAdministrador(): boolean {
    const usuario = this.authService.currentUser();
    return usuario?.role === 'Admin' || usuario?.role === 'admin' || usuario?.role === 'Administrator';
  }

  // Verificar si el usuario es un usuario normal (no admin)
  esUsuarioNormal(): boolean {
    const usuario = this.authService.currentUser();
    return usuario !== null && !this.esAdministrador();
  }

  // Verificar si debe mostrar el panel de usuario
  mostrarPanelUsuario(): boolean {
    return this.esUsuarioNormal();
  }

  // Verificar si hay usuario autenticado
  hayUsuarioAutenticado(): boolean {
    return this.authService.currentUser() !== null;
  }

  // Navegación entre secciones del dashboard
  navegarA(seccion: string) {
    if (this.esAdministrador() || seccion === 'marcador') {
      this.seccionActiva.set(seccion);
    }
  }

  // Ir al marcador de baloncesto
  irAMarcador() {
    this.seccionActiva.set('marcador');
  }

  // Ir al dashboard principal
  irADashboard() {
    this.seccionActiva.set('dashboard');
  }

  // ===== MÉTODOS DE ADMINISTRACIÓN =====

  // Gestión de Equipos
  abrirModalCrearEquipo() {
    console.log('🎯 Navegando a equipos para crear nuevo equipo');
    
    // Navegar a la sección de equipos
    this.navegarA('equipos');
    
    // Esperar un poco para que se cargue la sección y luego abrir el modal
    setTimeout(() => {
      console.log('Abriendo modal de crear equipo');
      this.mostrarModalCrearEquipo.set(true);
      this.nuevoEquipo.set({ nombre: '', ciudad: '', logo: '', descripcion: '' });
    }, 200);
    
    console.log('Navegado a sección equipos');
  }

  cerrarModalCrearEquipo() {
    this.mostrarModalCrearEquipo.set(false);
  }

  crearEquipo() {
    const equipo = this.nuevoEquipo();
    if (equipo.nombre && equipo.ciudad) {
      // Crear objeto para enviar al backend
      const equipoData = {
        nombre: equipo.nombre,
        ciudad: equipo.ciudad,
        logo: equipo.logo || undefined,
        descripcion: equipo.descripcion || undefined
      };

      console.log('Creando equipo:', equipoData);
      
      // Mostrar loading
      this.alertService.loading('Creando equipo...', 'Por favor espera un momento');
      
      // Llamar al servicio para crear el equipo
      this.equipoService.createEquipo(equipoData).subscribe({
        next: (response: Equipo) => {
          console.log('Equipo creado exitosamente:', response);
          this.alertService.close(); // Cerrar loading
          this.alertService.success(
            '¡Equipo creado!',
            `${equipo.nombre} de ${equipo.ciudad} se agregó exitosamente`
          );
          this.cerrarModalCrearEquipo();
          this.cargarEquipos(); // Recargar la lista
        },
        error: (error: any) => {
          console.error('Error al crear equipo:', error);
          this.alertService.close(); // Cerrar loading
          this.alertService.error(
            'Error al crear equipo',
            error.error?.message || 'No se pudo crear el equipo. Intenta nuevamente.'
          );
        }
      });
    } else {
      this.alertService.warning(
        'Campos incompletos',
        'Por favor completa el nombre y la ciudad del equipo'
      );
    }
  }

  // Búsqueda y filtrado de equipos
  buscarEquipos() {
    const termino = this.busquedaEquipo().toLowerCase().trim();
    if (termino === '') {
      this.equiposFiltrados.set(this.equiposDisponibles());
    } else {
      const equiposFiltrados = this.equiposDisponibles().filter(equipo => 
        equipo.nombre.toLowerCase().includes(termino) ||
        equipo.ciudad.toLowerCase().includes(termino)
      );
      this.equiposFiltrados.set(equiposFiltrados);
    }
  }

  // Editar equipo
  abrirModalEditarEquipo(equipo: Equipo) {
    this.equipoEditando.set({ ...equipo });
    this.mostrarModalEditarEquipo.set(true);
  }

  cerrarModalEditarEquipo() {
    this.mostrarModalEditarEquipo.set(false);
    this.equipoEditando.set(null);
  }

  actualizarEquipoEditando(campo: string, valor: string) {
    const equipo = this.equipoEditando();
    if (equipo) {
      const equipoActualizado = { ...equipo };
      (equipoActualizado as any)[campo] = valor;
      this.equipoEditando.set(equipoActualizado);
    }
  }

  guardarCambiosEquipo() {
    const equipo = this.equipoEditando();
    if (!equipo || !equipo.nombre || !equipo.ciudad) {
      this.alertService.warning(
        'Campos incompletos',
        'Por favor completa el nombre y la ciudad del equipo'
      );
      return;
    }

    const equipoData = {
      nombre: equipo.nombre,
      ciudad: equipo.ciudad,
      logo: equipo.logo || undefined,
      descripcion: equipo.descripcion || undefined,
      isActivo: equipo.isActivo ?? true
    };

    this.alertService.loading('Actualizando equipo...', 'Por favor espera');

    this.equipoService.updateEquipo(equipo.id, equipoData).subscribe({
      next: (response) => {
        console.log('Equipo actualizado exitosamente:', response);
        this.alertService.close();
        this.alertService.success(
          '¡Cambios guardados!',
          `${equipo.nombre} fue actualizado exitosamente`
        );
        this.cerrarModalEditarEquipo();
        this.cargarEquipos();
      },
      error: (error) => {
        console.error('Error al actualizar equipo:', error);
        this.alertService.close();
        this.alertService.error(
          'Error al actualizar',
          error.error?.message || 'No se pudieron guardar los cambios. Intenta nuevamente.'
        );
      }
    });
  }

  // Eliminar equipo
  confirmarEliminarEquipo(equipo: Equipo) {
    this.alertService.confirmDelete(`${equipo.nombre} (${equipo.ciudad})`).then((result) => {
      if (result.isConfirmed) {
        this.alertService.loading('Eliminando equipo...', 'Por favor espera');
        
        this.equipoService.deleteEquipo(equipo.id).subscribe({
          next: () => {
            this.alertService.close();
            this.alertService.success(
              '¡Equipo eliminado!',
              `${equipo.nombre} fue eliminado exitosamente`
            );
            this.cargarEquipos();
          },
          error: (error) => {
            console.error('Error al eliminar equipo:', error);
            this.alertService.close();
            this.alertService.error(
              'No se pudo eliminar',
              error.error?.message || 'El equipo puede tener jugadores o partidos asociados'
            );
          }
        });
      }
    });
  }

  verEstadisticasEquipos() {
    alert('📊 Función "Ver Estadísticas" - En desarrollo\n\nAquí verás:\n• Partidos jugados por equipo\n• Victorias y derrotas\n• Puntos promedio\n• Rendimiento de jugadores');
  }

  // Gestión de Jugadores - Acción Rápida
  abrirModalCrearJugador() {
    console.log('🎯 Navegando a jugadores para crear nuevo jugador');
    
    if (this.equiposDisponibles().length === 0) {
      alert('⚠️ Primero debes crear al menos un equipo antes de agregar jugadores.\n\nVe a la sección "Equipos" o usa el botón "Crear Equipo" para comenzar.');
      return;
    }
    
    // Navegar a la sección de jugadores
    this.navegarA('jugadores');
    
    // Esperar un poco para que se cargue la sección y luego abrir el modal
    setTimeout(() => {
      if (this.jugadoresComponent) {
        console.log('Abriendo modal desde componente jugadores');
        this.jugadoresComponent.openCreateModal();
      } else {
        console.log('Componente jugadores no encontrado, intentando método alternativo');
        // Método alternativo si ViewChild no funciona
        const crearButton = document.querySelector('app-jugadores .btn-create') as HTMLElement;
        if (crearButton) {
          crearButton.click();
        }
      }
    }, 200);
    
    console.log('Navegado a sección jugadores');
  }

  cerrarModalCrearJugador() {
    this.mostrarModalCrearJugador.set(false);
  }

  crearJugador() {
    const jugador = this.nuevoJugador();
    if (jugador.nombre && jugador.numero && jugador.posicion && jugador.equipoId) {
      console.log('Creando jugador:', jugador);
      alert(`Jugador "${jugador.nombre}" #${jugador.numero} agregado exitosamente!`);
      this.cerrarModalCrearJugador();
    } else {
      alert('Por favor completa todos los campos');
    }
  }

  editarJugadores() {
    alert('👤 Función "Editar Jugadores" - En desarrollo\n\nAquí podrás:\n• Ver lista de todos los jugadores\n• Editar información personal\n• Cambiar números de camiseta\n• Modificar posiciones');
  }

  gestionarTransferencias() {
    alert('Función "Transferencias" - En desarrollo\n\nAquí podrás:\n• Mover jugadores entre equipos\n• Ver historial de transferencias\n• Aprobar cambios de equipo');
  }

  gestionarPermisos() {
    alert('Función "Permisos" - En desarrollo\n\nAquí podrás:\n• Ver roles de usuarios\n• Cambiar permisos\n• Activar/desactivar cuentas');
  }

  // Configuraciones
  configurarReglas() {
    alert('🎮 Función "Reglas del Juego" - En desarrollo\n\nAquí podrás:\n• Configurar duración de cuartos\n• Establecer número de faltas máximas\n• Ajustar reglas de tiempo muerto');
  }

  configurarTiempos() {
    alert('🕐 Función "Configurar Tiempos" - En desarrollo\n\nAquí podrás:\n• Duración de cada cuarto\n• Tiempo de descanso\n• Configuración de prórrogas');
  }

  personalizarInterfaz() {
    alert('🎨 Función "Personalización" - En desarrollo\n\nAquí podrás:\n• Cambiar colores del marcador\n• Personalizar logos\n• Configurar sonidos');
  }

  // Reportes y Estadísticas
  verEstadisticasGenerales() {
    alert('📊 Función "Estadísticas Generales" - En desarrollo\n\nAquí verás:\n• Resumen de todos los partidos\n• Estadísticas de equipos\n• Rendimiento general del sistema');
  }

  verHistorialPartidos() {
    alert('🏆 Función "Historial de Partidos" - En desarrollo\n\nAquí verás:\n• Lista de todos los partidos jugados\n• Resultados detallados\n• Estadísticas por partido');
  }

  exportarDatos() {
    alert('💾 Función "Exportar Datos" - En desarrollo\n\nAquí podrás:\n• Exportar estadísticas a Excel\n• Generar reportes PDF\n• Crear copias de seguridad');
  }

  // Herramientas del Sistema
  hacerBackup() {
    alert('Función "Backup Base de Datos" - En desarrollo\n\nEsta función creará una copia de seguridad completa de:\n• Equipos y jugadores\n• Historial de partidos\n• Configuraciones del sistema');
  }

  reiniciarSistema() {
    if (confirm('¿Estás seguro de que quieres reiniciar el sistema?\n\nEsto cerrará todas las sesiones activas.')) {
      alert('Sistema reiniciado correctamente');
    }
  }

  verLogsSistema() {
    alert('Función "Logs del Sistema" - En desarrollo\n\nAquí verás:\n• Registro de actividad\n• Errores del sistema\n• Historial de accesos');
  }



  // Cargar un partido existente desde la gestión de partidos
  cargarPartidoExistente(partidoId: number) {
    console.log('Cargando partido existente:', partidoId);
    this.partidoId = partidoId;
    this.mensajeEstado.set(`Cargando partido #${partidoId}...`);
    
    // Cargar datos del partido desde el backend
    this.partidoService.getPartido(partidoId).subscribe({
      next: (partido: any) => {
        console.log('Datos del partido cargados:', partido);
        
        // Configurar equipos
        this.equipoLocal.set(partido.equipoLocalNombre || 'Local');
        this.equipoVisitante.set(partido.equipoVisitanteNombre || 'Visitante');
        
        // Configurar marcador si ya existe
        if (partido.marcador) {
          const [puntosLocal, puntosVisitante] = partido.marcador.split('-').map((p: string) => parseInt(p.trim()) || 0);
          this.puntuacionLocal.set(puntosLocal);
          this.puntuacionVisitante.set(puntosVisitante);
          console.log(`Marcador cargado: Local ${puntosLocal} - Visitante ${puntosVisitante}`);
        } else {
          // Si no hay marcador, usar los valores del partido
          this.puntuacionLocal.set(partido.puntuacionLocal || 0);
          this.puntuacionVisitante.set(partido.puntuacionVisitante || 0);
          console.log(`Puntuaciones cargadas: Local ${partido.puntuacionLocal || 0} - Visitante ${partido.puntuacionVisitante || 0}`);
        }
        
        // Cargar otros datos del partido
        this.periodo.set(partido.periodo || 1);
        this.faltasLocal.set(partido.faltasLocal || 0);
        this.faltasVisitante.set(partido.faltasVisitante || 0);
        this.tiemposMuertosLocal.set(partido.tiemposMuertosLocal || 7);
        this.tiemposMuertosVisitante.set(partido.tiemposMuertosVisitante || 7);
        
        // Cargar el estado del partido
        this.estadoPartido.set(partido.estado || 'PROGRAMADO');
        console.log('Estado del partido cargado:', partido.estado);
        
        // Establecer que el partido está iniciado
        this.partidoIniciado.set(true);
        
        // Navegar automáticamente a la sección del marcador
        this.seccionActiva.set('marcador');
        
        // Forzar detección de cambios
        this.cdr.detectChanges();
        
        // Limpiar mensaje de estado (sin mostrar mensaje de éxito innecesario)
        this.mensajeEstado.set('');
      },
      error: (error: any) => {
        console.error('Error al cargar partido:', error);
        this.mensajeEstado.set(`Error al cargar partido #${partidoId}`);
        
        // Aun así establecer que hay un partido para mostrar el marcador
        this.partidoIniciado.set(true);
        this.seccionActiva.set('marcador');
      }
    });
  }

  // Métodos auxiliares para validación
  getValidationClass(field: string, validations: { [key: string]: ValidationResult }): string {
    const validation = validations[field];
    if (!validation) return '';
    
    if (!validation.isValid) return 'validation-error';
    if (validation.severity === 'warning') return 'validation-warning';
    if (validation.severity === 'success') return 'validation-success';
    
    return '';
  }

  getValidationMessage(field: string, validations: { [key: string]: ValidationResult }): string {
    const validation = validations[field];
    return validation ? validation.message : '';
  }

  isFormValid(formType: string): boolean {
    switch (formType) {
      case 'equipo':
        return this.validationService.isFormValid(this.equipoValidations());
      case 'jugador':
        return this.validationService.isFormValid(this.jugadorValidations());
      case 'usuario':
        return this.validationService.isFormValid(this.usuarioValidations());
      default:
        return false;
    }
  }
}
