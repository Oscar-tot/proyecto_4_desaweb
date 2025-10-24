import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertOptions } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  // ========================================
  //CONFIGURACIÓN BASE SIMPLE
  // ========================================
  
  private readonly baseConfig: any = {
    background: '#ffffff',
    backdrop: 'rgba(0, 0, 0, 0.4)',
    width: 'auto',
    padding: '2rem',
    heightAuto: true,
    allowOutsideClick: true,
    allowEscapeKey: true,
    position: 'center',
    grow: false
  };

  // ========================================
  // 🎯 CONFIGURACIÓN SIMPLE POR TIPO
  // ========================================
  
  private readonly alertTypes = {
    success: {
      icon: 'success' as SweetAlertIcon,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'OK',
      timer: 2000,
      iconColor: '#10b981'
    },
    error: {
      icon: 'error' as SweetAlertIcon,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'OK',
      iconColor: '#ef4444'
    },
    warning: {
      icon: 'warning' as SweetAlertIcon,
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'OK',
      iconColor: '#f59e0b'
    },
    info: {
      icon: 'info' as SweetAlertIcon,
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'OK',
      timer: 2000,
      iconColor: '#3b82f6'
    },
    question: {
      icon: 'question' as SweetAlertIcon,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Sí',
      cancelButtonColor: '#6b7280',
      iconColor: '#3b82f6'
    }
  };

  // ========================================
  //  MÉTODO PRIVADO SIMPLE
  // ========================================
  
  private createAlert(type: keyof typeof this.alertTypes, title: string, message?: string, additionalOptions?: any) {
    const typeConfig = this.alertTypes[type];
    
    return Swal.fire({
      ...this.baseConfig,
      icon: typeConfig.icon,
      iconColor: typeConfig.iconColor,
      title: title,
      text: message,
      confirmButtonText: typeConfig.confirmButtonText,
      confirmButtonColor: typeConfig.confirmButtonColor,
      timer: (typeConfig as any).timer,
      showConfirmButton: true,
      customClass: {
        popup: 'swal-compact',
        title: 'swal-title-compact',
        htmlContainer: 'swal-text-compact',
        confirmButton: 'swal-btn-confirm',
        cancelButton: 'swal-btn-cancel'
      },
      ...additionalOptions
    });
  }

  // ========================================
  //  ALERTAS PÚBLICAS SIMPLES
  // ========================================

  /**
   *  Alerta de éxito
   * @param title Título de la alerta
   * @param message Mensaje descriptivo (opcional)
   */
  success(title: string, message?: string) {
    return this.createAlert('success', title, message);
  }

  /**
   *  Alerta de error
   * @param title Título de la alerta
   * @param message Mensaje descriptivo (opcional)
   */
  error(title: string, message?: string) {
    return this.createAlert('error', title, message);
  }

  /**
   *  Alerta de advertencia
   * @param title Título de la alerta
   * @param message Mensaje descriptivo (opcional)
   */
  warning(title: string, message?: string) {
    return this.createAlert('warning', title, message);
  }

  /**
   * ℹ Alerta de información
   * @param title Título de la alerta
   * @param message Mensaje descriptivo (opcional)
   */
  info(title: string, message?: string) {
    return this.createAlert('info', title, message);
  }

  /**
   *  Alerta de confirmación (Sí/No)
   * @param title Título de la alerta
   * @param message Mensaje descriptivo (opcional)
   * @param confirmText Texto del botón confirmar (default: 'Sí, continuar')
   * @param cancelText Texto del botón cancelar (default: 'Cancelar')
   */
  confirm(title: string, message?: string, confirmText: string = 'Sí, continuar', cancelText: string = 'Cancelar') {
    return this.createAlert('question', title, message, {
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
      timer: undefined,
      timerProgressBar: false
    });
  }

  /**
   *  Alerta de confirmación de eliminación
   * @param itemName Nombre del elemento a eliminar
   */
  confirmDelete(itemName: string) {
    return Swal.fire({
      ...this.baseConfig,
      icon: 'warning',
      iconColor: '#ef4444',
      title: '¿Estás seguro?',
      html: `Se eliminará <strong>${itemName}</strong>.<br><small class="text-muted">Esta acción no se puede deshacer.</small>`,
      showCancelButton: true,
      confirmButtonText: '✓ Sí, eliminar',
      cancelButtonText: '✕ Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      customClass: {
        popup: 'swal-compact swal-delete',
        title: 'swal-title-compact',
        htmlContainer: 'swal-text-compact',
        confirmButton: 'swal-btn-confirm swal-btn-danger',
        cancelButton: 'swal-btn-cancel',
        actions: 'swal-actions-compact',
        icon: 'swal-icon-compact'
      }
    });
  }

  /**
   *  Alerta de cargando (sin botones, se cierra manualmente con close())
   * @param title Título del loading (default: 'Procesando...')
   * @param message Mensaje descriptivo (opcional)
   */
  loading(title: string = 'Procesando...', message?: string) {
    return Swal.fire({
      ...this.baseConfig,
      title: title,
      html: message ? `<p class="loading-message">${message}</p>` : undefined,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'swal-compact swal-loading',
        title: 'swal-title-compact',
        htmlContainer: 'swal-text-compact'
      }
    });
  }

  /**
   * ⏱️ Toast - Notificación pequeña en esquina
   * @param icon Tipo de ícono
   * @param title Título del toast
   * @param position Posición en pantalla (default: 'top-end')
   * @param timer Tiempo en ms (default: 3000)
   */
  toast(
    icon: SweetAlertIcon, 
    title: string, 
    position: 'top-end' | 'top' | 'top-start' | 'bottom-end' | 'bottom' | 'bottom-start' | 'center' = 'top-end',
    timer: number = 3000
  ) {
    const iconColors: Record<SweetAlertIcon, string> = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      question: '#667eea'
    };

    return Swal.fire({
      toast: true,
      position: position,
      icon: icon,
      iconColor: iconColors[icon],
      title: title,
      showConfirmButton: false,
      timer: timer,
      timerProgressBar: true,
      background: '#fff',
      width: '320px',
      showClass: {
        popup: 'swal2-show',
        backdrop: 'swal2-noanimation'
      },
      hideClass: {
        popup: 'swal2-hide',
        backdrop: 'swal2-noanimation'
      },
      customClass: {
        popup: 'swal-toast-compact',
        title: 'swal-toast-title',
        icon: 'swal-toast-icon'
      }
    });
  }

  /**
   *  Alerta personalizada con HTML
   * @param options Opciones de configuración
   */
  custom(options: {
    icon?: SweetAlertIcon;
    title: string;
    html?: string;
    confirmButtonText?: string;
    showCancelButton?: boolean;
    cancelButtonText?: string;
    timer?: number;
    timerProgressBar?: boolean;
  }) {
    const iconColors: Record<SweetAlertIcon, string> = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      question: '#667eea'
    };

    return Swal.fire({
      ...this.baseConfig,
      icon: options.icon || 'info',
      iconColor: options.icon ? iconColors[options.icon] : '#3b82f6',
      title: options.title,
      html: options.html,
      showConfirmButton: true,
      confirmButtonText: options.confirmButtonText || 'Aceptar',
      confirmButtonColor: '#10b981',
      showCancelButton: options.showCancelButton || false,
      cancelButtonText: options.cancelButtonText || 'Cancelar',
      cancelButtonColor: '#6b7280',
      timer: options.timer,
      timerProgressBar: options.timerProgressBar,
      customClass: {
        popup: 'swal-compact swal-custom',
        title: 'swal-title-compact',
        htmlContainer: 'swal-text-compact',
        confirmButton: 'swal-btn-confirm',
        cancelButton: 'swal-btn-cancel',
        actions: 'swal-actions-compact',
        icon: 'swal-icon-compact'
      }
    });
  }

  /**
   * ✕ Cerrar cualquier alerta abierta
   * Útil después de usar loading()
   */
  close() {
    Swal.close();
  }
}
