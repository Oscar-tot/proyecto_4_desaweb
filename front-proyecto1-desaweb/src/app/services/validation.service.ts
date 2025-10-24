import { Injectable } from '@angular/core';

export interface ValidationResult {
  isValid: boolean;
  message: string;
  severity: 'error' | 'warning' | 'success';
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => ValidationResult;
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  /**
   * Validar un campo en tiempo real
   */
  validateField(value: any, validations: FieldValidation): ValidationResult {
    // Validación de campo requerido
    if (validations.required && (!value || value.toString().trim() === '')) {
      return {
        isValid: false,
        message: 'Este campo es obligatorio',
        severity: 'error'
      };
    }

    // Si el campo está vacío y no es requerido, es válido
    if (!value || value.toString().trim() === '') {
      return {
        isValid: true,
        message: '',
        severity: 'success'
      };
    }

    const stringValue = value.toString().trim();

    // Validación de longitud mínima
    if (validations.minLength && stringValue.length < validations.minLength) {
      return {
        isValid: false,
        message: `Mínimo ${validations.minLength} caracteres`,
        severity: 'error'
      };
    }

    // Validación de longitud máxima  
    if (validations.maxLength && stringValue.length > validations.maxLength) {
      return {
        isValid: false,
        message: `Máximo ${validations.maxLength} caracteres`,
        severity: 'error'
      };
    }

    // Validación de patrón
    if (validations.pattern && !validations.pattern.test(stringValue)) {
      return {
        isValid: false,
        message: 'Formato inválido',
        severity: 'error'
      };
    }

    // Validación personalizada
    if (validations.customValidator) {
      return validations.customValidator(value);
    }

    return {
      isValid: true,
      message: 'Campo válido',
      severity: 'success'
    };
  }

  /**
   * Validaciones específicas para equipos
   */
  validateEquipo(equipo: any): { [key: string]: ValidationResult } {
    return {
      nombre: this.validateField(equipo.nombre, {
        required: true,
        minLength: 2,
        maxLength: 50,
        customValidator: (value) => this.validateTeamName(value)
      }),
      ciudad: this.validateField(equipo.ciudad, {
        required: true,
        minLength: 2,
        maxLength: 30,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
      }),
      descripcion: this.validateField(equipo.descripcion, {
        maxLength: 200
      })
    };
  }

  /**
   * Validaciones específicas para jugadores
   */
  validateJugador(jugador: any): { [key: string]: ValidationResult } {
    return {
      nombre: this.validateField(jugador.nombre, {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
      }),
      numero: this.validateField(jugador.numero, {
        required: true,
        customValidator: (value) => this.validatePlayerNumber(value)
      }),
      posicion: this.validateField(jugador.posicion, {
        required: true,
        customValidator: (value) => this.validatePosition(value)
      }),
      equipoId: this.validateField(jugador.equipoId, {
        required: true,
        customValidator: (value) => this.validateTeamId(value)
      })
    };
  }

  /**
   * Validaciones específicas para usuarios
   */
  validateUsuario(usuario: any): { [key: string]: ValidationResult } {
    return {
      username: this.validateField(usuario.username, {
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_]+$/
      }),
      email: this.validateField(usuario.email, {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      }),
      password: this.validateField(usuario.password, {
        required: true,
        minLength: 6,
        customValidator: (value) => this.validatePassword(value)
      }),
      role: this.validateField(usuario.role, {
        required: true,
        customValidator: (value) => this.validateRole(value)
      })
    };
  }

  /**
   * Validaciones personalizadas
   */
  private validateTeamName(name: string): ValidationResult {
    if (!name) {
      return { isValid: false, message: 'Nombre requerido', severity: 'error' };
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/.test(name)) {
      return { 
        isValid: false, 
        message: 'Solo letras, números y espacios', 
        severity: 'error' 
      };
    }

    if (name.length < 2) {
      return { 
        isValid: false, 
        message: 'Mínimo 2 caracteres', 
        severity: 'error' 
      };
    }

    return { 
      isValid: true, 
      message: 'Nombre válido', 
      severity: 'success' 
    };
  }

  private validatePlayerNumber(numero: number): ValidationResult {
    if (numero === null || numero === undefined || isNaN(numero)) {
      return { 
        isValid: false, 
        message: 'Número requerido', 
        severity: 'error' 
      };
    }

    const num = Number(numero);
    if (isNaN(num) || num < 0 || num > 99) {
      return { 
        isValid: false, 
        message: 'Número entre 0 y 99', 
        severity: 'error' 
      };
    }

    if (!Number.isInteger(num)) {
      return { 
        isValid: false, 
        message: 'Debe ser un número entero', 
        severity: 'error' 
      };
    }

    return { 
      isValid: true, 
      message: 'Número válido', 
      severity: 'success' 
    };
  }

  private validatePosition(posicion: string): ValidationResult {
    const validPositions = ['Base', 'Escolta', 'Alero', 'Ala-Pivot', 'Pivot'];
    
    if (!posicion) {
      return { 
        isValid: false, 
        message: 'Selecciona una posición', 
        severity: 'error' 
      };
    }

    if (!validPositions.includes(posicion)) {
      return { 
        isValid: false, 
        message: 'Posición no válida', 
        severity: 'error' 
      };
    }

    return { 
      isValid: true, 
      message: 'Posición válida', 
      severity: 'success' 
    };
  }

  private validateTeamId(equipoId: number): ValidationResult {
    if (!equipoId || equipoId <= 0) {
      return { 
        isValid: false, 
        message: 'Selecciona un equipo', 
        severity: 'error' 
      };
    }

    return { 
      isValid: true, 
      message: 'Equipo seleccionado', 
      severity: 'success' 
    };
  }

  private validatePassword(password: string): ValidationResult {
    if (!password) {
      return { 
        isValid: false, 
        message: 'Contraseña requerida', 
        severity: 'error' 
      };
    }

    if (password.length < 6) {
      return { 
        isValid: false, 
        message: 'Mínimo 6 caracteres', 
        severity: 'error' 
      };
    }

    // Verificar que tenga al menos una letra y un número
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return { 
        isValid: false, 
        message: 'Debe contener letras y números', 
        severity: 'warning' 
      };
    }

    return { 
      isValid: true, 
      message: 'Contraseña segura', 
      severity: 'success' 
    };
  }

  private validateRole(role: string): ValidationResult {
    const validRoles = ['Admin', 'Usuario'];
    
    if (!role) {
      return { 
        isValid: false, 
        message: 'Selecciona un rol', 
        severity: 'error' 
      };
    }

    if (!validRoles.includes(role)) {
      return { 
        isValid: false, 
        message: 'Rol no válido', 
        severity: 'error' 
      };
    }

    return { 
      isValid: true, 
      message: 'Rol válido', 
      severity: 'success' 
    };
  }

  /**
   * Verificar si un objeto completo es válido
   */
  isFormValid(validations: { [key: string]: ValidationResult }): boolean {
    return Object.values(validations).every(validation => validation.isValid);
  }

  /**
   * Obtener el primer error encontrado
   */
  getFirstError(validations: { [key: string]: ValidationResult }): string | null {
    for (const validation of Object.values(validations)) {
      if (!validation.isValid) {
        return validation.message;
      }
    }
    return null;
  }
}