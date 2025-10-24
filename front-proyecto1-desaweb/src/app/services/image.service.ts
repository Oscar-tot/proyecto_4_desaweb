import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface ImageUploadResponse {
  message: string;
  url: string;
  fileName: string;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/imagenes`;

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    const headers: { [key: string]: string } = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return new HttpHeaders(headers);
  }

  /**
   * Subir imagen al servidor
   */
  uploadImage(file: File, tipo: 'jugador' | 'equipo' = 'jugador'): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', tipo);

    return this.http.post<ImageUploadResponse>(`${this.apiUrl}/upload`, formData, {
      headers: this.getHeaders()
    });
  }

  /**
   * Eliminar imagen del servidor
   */
  deleteImage(fileName: string, tipo: 'jugador' | 'equipo' = 'jugador'): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/${tipo}/${fileName}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtener URL completa de la imagen
   */
  getImageUrl(relativePath: string): string {
    if (!relativePath) return '';
    if (relativePath.startsWith('http')) return relativePath; // URL externa
    // Para rutas locales, no usar /api prefix
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}${relativePath}`;
  }

  /**
   * Validar archivo de imagen
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Tipo de archivo no permitido. Use: JPG, PNG, GIF, WEBP' 
      };
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: 'El archivo es muy grande. Máximo 5MB' 
      };
    }

    return { valid: true };
  }
}