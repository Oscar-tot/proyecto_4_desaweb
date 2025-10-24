import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserDto, CreateUserRequest, UpdateUserRequest } from '../../services/auth.service';
import { ValidationService, ValidationResult } from '../../services/validation.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  // Estados del componente
  usuarios = signal<UserDto[]>([]);
  cargandoUsuarios = signal(false);
  mostrarModal = signal(false);
  creandoUsuario = signal(false);
  mensajeError = signal('');
  mensajeExito = signal('');

  // Datos del formulario
  nuevoUsuario = signal<CreateUserRequest>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roles: ['user'] // Por defecto asignar rol 'user'
  });

  // Filtros y búsqueda
  busqueda = signal('');
  filtroRol = signal('');

  // Validaciones
  usuarioValidations = signal<{ [key: string]: ValidationResult }>({});
  
  // Servicios
  public authService = inject(AuthService);
  private validationService = inject(ValidationService);
  private alertService = inject(AlertService);

  constructor() {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  // Cargar lista de usuarios
  cargarUsuarios() {
    this.cargandoUsuarios.set(true);
    this.mensajeError.set('');
    
    this.authService.getAllUsers().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargandoUsuarios.set(false);
        console.log(' Usuarios cargados:', usuarios);
      },
      error: (error) => {
        console.error(' Error al cargar usuarios:', error);
        this.alertService.error(
          'Error al cargar usuarios',
          error.message || 'No se pudieron cargar los usuarios. Por favor, intente nuevamente.'
        );
        this.cargandoUsuarios.set(false);
      }
    });
  }

  // Abrir modal para crear usuario
  abrirModal() {
    // Verificar permisos
    const currentUser = this.authService.currentUser();
    
    if (!currentUser) {
      this.mensajeError.set('Debe iniciar sesión para crear usuarios');
      return;
    }
    
    // Verificar tanto roles array como role string
    const roles = currentUser.roles || [];
    const singleRole = currentUser.role || '';
    
    const isAdmin = roles.some((role: string) => role.toLowerCase() === 'admin') || 
                   singleRole.toLowerCase() === 'admin';
    
    if (!isAdmin) {
      this.mensajeError.set('Solo los administradores pueden crear usuarios');
      return;
    }

    // Limpiar formulario
    this.nuevoUsuario.set({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      roles: ['user']
    });

    this.mensajeError.set('');
    this.mensajeExito.set('');
    this.mostrarModal.set(true);
  }

  // Cerrar modal
  cerrarModal() {
    this.mostrarModal.set(false);
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }

  // Crear nuevo usuario
  crearUsuario() {
    console.log(' crearUsuario() iniciado');
    
    const userData = this.nuevoUsuario();
    console.log(' Datos del usuario a crear:', userData);
    
    // Limpiar mensajes
    this.mensajeError.set('');
    this.mensajeExito.set('');

    // Verificar si el formulario es válido
    if (!this.isFormValid()) {
      this.alertService.warning(
        'Formulario incompleto',
        'Por favor complete todos los campos requeridos correctamente'
      );
      console.error(' Formulario no válido');
      return;
    }

    console.log(' Formulario válido, iniciando creación...');
    this.creandoUsuario.set(true);
    this.alertService.loading('Creando usuario...');

    this.authService.createUser(userData).subscribe({
      next: (nuevoUsuario) => {
        console.log(' Usuario creado exitosamente:', nuevoUsuario);
        this.alertService.close();
        this.creandoUsuario.set(false);
        
        // Recargar lista de usuarios
        this.cargarUsuarios();
        this.cerrarModal();
        
        this.alertService.success(
          '¡Usuario creado!',
          `Usuario "${nuevoUsuario.username}" creado exitosamente`
        );
      },
      error: (error) => {
        console.error(' Error al crear usuario:', error);
        this.alertService.close();
        this.creandoUsuario.set(false);
        
        let mensaje = 'Error al crear usuario';
        if (error.message.includes('Duplicate entry') || error.message.includes('ya existe')) {
          mensaje = 'El username o email ya existe. Use valores diferentes.';
        } else if (error.message.includes('No tienes permisos')) {
          mensaje = 'No tienes permisos para crear usuarios';
        } else {
          mensaje = error.message;
        }
        
        this.alertService.error('Error al crear usuario', mensaje);
      }
    });
  }

  // Actualizar campo del formulario
  actualizarCampo(campo: keyof CreateUserRequest, valor: any) {
    const usuario = { ...this.nuevoUsuario() };
    (usuario as any)[campo] = valor;
    this.nuevoUsuario.set(usuario);
    
    // Validar en tiempo real
    const validations = this.validationService.validateUsuario(usuario);
    this.usuarioValidations.set(validations);
  }

  // Actualizar roles del usuario
  actualizarRoles(rolSeleccionado: string) {
    const usuario = { ...this.nuevoUsuario() };
    usuario.roles = [rolSeleccionado];
    this.nuevoUsuario.set(usuario);
  }

  // Computed properties para estadísticas
  get totalUsuarios() {
    return this.usuarios().length;
  }

  get usuariosAdmin() {
    return this.usuarios().filter(u => 
      u.roles && u.roles.some((role: string) => role.toLowerCase() === 'admin')
    ).length;
  }

  get usuariosActivos() {
    return this.usuarios().filter(u => u.status === 'activo').length;
  }

  // Filtrar usuarios
  get usuariosFiltrados() {
    let usuarios = this.usuarios();
    
    // Debug: Mostrar roles de todos los usuarios
    if (usuarios.length > 0) {
      console.log('🔍 Roles de usuarios en BD:', usuarios.map(u => ({
        username: u.username,
        roles: u.roles
      })));
    }
    
    // Filtro por búsqueda
    if (this.busqueda()) {
      const busqueda = this.busqueda().toLowerCase();
      usuarios = usuarios.filter(u => 
        u.username.toLowerCase().includes(busqueda) ||
        u.email.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por rol
    if (this.filtroRol()) {
      const filtroSeleccionado = this.filtroRol();
      console.log(' Filtro seleccionado:', filtroSeleccionado);
      
      // Mapear los filtros a los roles reales del backend
      let rolesABuscar: string[] = [];
      
      if (filtroSeleccionado === 'Admin') {
        rolesABuscar = ['admin', 'ADMIN', 'Admin'];
      } else if (filtroSeleccionado === 'Usuario') {
        rolesABuscar = ['user', 'USER', 'User', 'usuario', 'USUARIO', 'Usuario'];
      }
      
      console.log(' Buscando roles:', rolesABuscar);
      
      usuarios = usuarios.filter(u => {
        if (!u.roles || u.roles.length === 0) return false;
        
        const tieneRol = u.roles.some((role: string) => 
          rolesABuscar.some(rolBuscado => role.toLowerCase() === rolBuscado.toLowerCase())
        );
        
        if (tieneRol) {
          console.log(` Usuario ${u.username} tiene rol buscado:`, u.roles);
        }
        
        return tieneRol;
      });
      
      console.log(`🔍 Usuarios filtrados por rol "${filtroSeleccionado}":`, usuarios.length);
    }

    return usuarios;
  }

  // Verificar si el usuario actual puede crear usuarios
  puedeCrearUsuarios(): boolean {
    const currentUser = this.authService.currentUser();
    
    if (!currentUser) {
      return false;
    }
    
    // Verificar tanto roles array como role string
    const roles = currentUser.roles || [];
    const singleRole = currentUser.role || '';
    
    const isAdmin = roles.some((role: string) => role.toLowerCase() === 'admin') || 
                   singleRole.toLowerCase() === 'admin';
    
    return isAdmin;
  }



  // Formatear fecha
  formatearFecha(fecha: string): string {
    const fechaObj = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fechaObj.getTime();
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    
    return fechaObj.toLocaleDateString('es-ES');
  }

  // Métodos auxiliares para validaciones
  getValidationClass(field: string, validations: { [key: string]: ValidationResult }): string {
    const validation = validations[field];
    if (!validation) return '';
    
    if (!validation.isValid) return 'error';
    if (validation.isValid && validation.severity === 'success') return 'valid';
    return '';
  }

  getValidationMessage(field: string, validations: { [key: string]: ValidationResult }): string {
    const validation = validations[field];
    return validation?.message || '';
  }

  isFormValid(): boolean {
    const userData = this.nuevoUsuario();
    
    // Validación simple y directa
    const isValid = 
      userData.username.trim().length >= 3 &&
      userData.email.trim().length > 0 &&
      userData.password.trim().length >= 6 &&
      userData.firstName.trim().length > 0 &&
      userData.lastName.trim().length > 0 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email);
    
    console.log(' Validación del formulario:', {
      username: userData.username.trim().length >= 3,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email),
      password: userData.password.trim().length >= 6,
      firstName: userData.firstName.trim().length > 0,
      lastName: userData.lastName.trim().length > 0,
      isValid
    });
    
    return isValid;
  }

  // ==================== FUNCIONALIDADES DE EDICI�N ====================
  
  mostrarModalEditar = signal(false);
  editandoUsuario = signal(false);
  usuarioEditando = signal<UserDto>({
    id: 0,
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    roles: [],
    status: 'activo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isEmailVerified: false
  });

  abrirModalEditar(usuario: UserDto) {
    console.log('🔧 Abriendo modal para editar usuario:', usuario);
    console.log('📋 Roles originales del usuario:', usuario.roles);
    
    // Clonar el usuario asegurando que los roles se mantengan
    const usuarioClonado = {
      ...usuario,
      roles: usuario.roles ? [...usuario.roles] : ['user'] // Clonar el array de roles
    };
    
    console.log('📋 Usuario clonado con roles:', usuarioClonado);
    
    this.usuarioEditando.set(usuarioClonado);
    this.mostrarModalEditar.set(true);
  }

  cerrarModalEditar() {
    this.mostrarModalEditar.set(false);
    this.editandoUsuario.set(false);
  }

  actualizarCampoEditar(campo: keyof UserDto, valor: any) {
    const usuarioActual = this.usuarioEditando();
    console.log(`📝 Actualizando campo ${String(campo)} con valor:`, valor);
    console.log('📋 Roles antes de actualizar:', usuarioActual.roles);
    
    this.usuarioEditando.set({
      ...usuarioActual,
      [campo]: valor,
      roles: usuarioActual.roles // Preservar explícitamente los roles
    });
    
    console.log('📋 Roles después de actualizar:', this.usuarioEditando().roles);
  }

  actualizarRolesEditar(rol: string) {
    const usuarioActual = this.usuarioEditando();
    console.log('👑 Actualizando rol a:', rol);
    
    this.usuarioEditando.set({
      ...usuarioActual,
      roles: [rol]
    });
    
    console.log('📋 Roles actualizados:', this.usuarioEditando().roles);
  }

  actualizarUsuario() {
    const usuario = this.usuarioEditando();
    
    console.log('💾 Actualizando usuario:', usuario);
    console.log('📋 Roles del usuario:', usuario.roles);
    this.editandoUsuario.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    const updateData = {
      username: usuario.username,
      email: usuario.email,
      firstName: usuario.firstName,
      lastName: usuario.lastName,
      roles: usuario.roles && usuario.roles.length > 0 ? usuario.roles : ['user'], // Asegurar que siempre haya un rol
      status: usuario.status
    };

    console.log('📤 Datos a enviar:', updateData);
    this.alertService.loading('Actualizando usuario...');

    this.authService.updateUser(usuario.id, updateData).subscribe({
      next: (usuarioActualizado) => {
        console.log('✅ Usuario actualizado exitosamente:', usuarioActualizado);
        this.alertService.close();
        this.editandoUsuario.set(false);
        this.cerrarModalEditar();
        this.cargarUsuarios();
        
        this.alertService.success(
          '¡Usuario actualizado!',
          `Usuario ${usuarioActualizado.username} actualizado exitosamente`
        );
      },
      error: (error) => {
        console.error('❌ Error al actualizar usuario:', error);
        this.alertService.close();
        this.editandoUsuario.set(false);
        this.alertService.error(
          'Error al actualizar usuario',
          error.message || 'No se pudo actualizar el usuario. Por favor, intente nuevamente.'
        );
      }
    });
  }

  // ==================== FUNCIONALIDADES DE ELIMINACI�N ====================
  
  mostrarModalEliminar = signal(false);
  eliminandoUsuario = signal(false);
  usuarioAEliminar = signal<UserDto | null>(null);

  confirmarEliminar(usuario: UserDto) {
    console.log(' Solicitando confirmación para eliminar usuario:', usuario);
    
    this.alertService.confirmDelete(`${usuario.username}`).then((result) => {
      if (result.isConfirmed) {
        this.eliminarUsuario(usuario);
      }
    });
  }

  eliminarUsuario(usuario: UserDto) {
    console.log(' Eliminando usuario:', usuario);
    this.eliminandoUsuario.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    this.alertService.loading('Eliminando usuario...');

    this.authService.deleteUser(usuario.id).subscribe({
      next: () => {
        console.log(' Usuario eliminado exitosamente');
        this.alertService.close();
        this.eliminandoUsuario.set(false);
        this.cargarUsuarios();
        
        this.alertService.success(
          '¡Usuario eliminado!',
          `Usuario ${usuario.username} eliminado exitosamente`
        );
      },
      error: (error) => {
        console.error(' Error al eliminar usuario:', error);
        this.alertService.close();
        this.eliminandoUsuario.set(false);
        this.alertService.error(
          'Error al eliminar usuario',
          error.message || 'No se pudo eliminar el usuario. Por favor, intente nuevamente.'
        );
      }
    });
  }

  cerrarModalEliminar() {
    this.mostrarModalEliminar.set(false);
    this.usuarioAEliminar.set(null);
  }

  // ==================== FUNCIONALIDADES DE DETALLES ====================
  
  mostrarModalDetalles = signal(false);
  cargandoDetalles = signal(false);
  usuarioDetalle = signal<UserDto | null>(null);

  verDetallesUsuario(usuario: UserDto) {
    console.log(' Cargando detalles del usuario:', usuario.id);
    this.cargandoDetalles.set(true);
    this.mostrarModalDetalles.set(true);
    
    this.authService.getUserById(usuario.id).subscribe({
      next: (usuarioCompleto) => {
        console.log(' Detalles cargados:', usuarioCompleto);
        this.usuarioDetalle.set(usuarioCompleto);
        this.cargandoDetalles.set(false);
      },
      error: (error) => {
        console.error(' Error al cargar detalles:', error);
        this.cargandoDetalles.set(false);
        this.mensajeError.set('Error al cargar detalles: ' + error.message);
        this.cerrarModalDetalles();
      }
    });
  }

  cerrarModalDetalles() {
    this.mostrarModalDetalles.set(false);
    this.usuarioDetalle.set(null);
  }

  // ==================== FUNCIONALIDADES DE CAMBIO DE CONTRASE�A ====================
  
  mostrarModalPassword = signal(false);
  cambiandoPassword = signal(false);
  usuarioParaPassword = signal<UserDto | null>(null);
  nuevaPassword = signal('');
  confirmarPassword = signal('');
  mostrarNuevaPassword = signal(false);
  mostrarConfirmarPassword = signal(false);

  abrirModalCambiarPassword(usuario: UserDto) {
    console.log(' Abriendo modal para cambiar contrase�a de:', usuario.username);
    this.usuarioParaPassword.set(usuario);
    this.nuevaPassword.set('');
    this.confirmarPassword.set('');
    this.mostrarModalPassword.set(true);
  }

  cerrarModalPassword() {
    this.mostrarModalPassword.set(false);
    this.usuarioParaPassword.set(null);
    this.nuevaPassword.set('');
    this.confirmarPassword.set('');
  }

  cambiarPasswordUsuario() {
    const usuario = this.usuarioParaPassword();
    const newPassword = this.nuevaPassword();
    const confirmPassword = this.confirmarPassword();

    if (!usuario) {
      console.error(' No hay usuario para cambiar contrase�a');
      return;
    }

    if (newPassword.length < 6) {
      this.mensajeError.set('La contrase�a debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      this.mensajeError.set('Las contrase�as no coinciden');
      return;
    }

    console.log(' Cambiando contrase�a para usuario:', usuario.username);
    this.cambiandoPassword.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    // Actualizar usuario con nueva contrase�a
    const updateData = {
      password: newPassword
    };

    this.authService.updateUser(usuario.id, updateData).subscribe({
      next: () => {
        console.log(' Contrase�a cambiada exitosamente');
        this.cambiandoPassword.set(false);
        this.cerrarModalPassword();
        this.mensajeExito.set(`Contrase�a de ${usuario.username} cambiada exitosamente`);
        setTimeout(() => this.mensajeExito.set(''), 3000);
      },
      error: (error) => {
        console.error(' Error al cambiar contraseña:', error);
        this.cambiandoPassword.set(false);
        this.mensajeError.set('Error al cambiar contraseña: ' + error.message);
      }
    });
  }

  toggleNuevaPasswordVisibility() {
    this.mostrarNuevaPassword.update(value => !value);
  }

  toggleConfirmarPasswordVisibility() {
    this.mostrarConfirmarPassword.update(value => !value);
  }
}
