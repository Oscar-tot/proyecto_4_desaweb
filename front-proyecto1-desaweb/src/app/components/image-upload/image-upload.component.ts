import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService, ImageUploadResponse } from '../../services/image.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.component.html',
  styles: [`
    .image-upload-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 2px dashed #ddd;
      border-radius: 8px;
      background: #fafafa;
      transition: all 0.3s ease;
    }
    
    .image-upload-container:hover {
      border-color: #667eea;
      background: #f0f4ff;
    }
    
    .image-preview {
      position: relative;
      width: 120px;
      height: 120px;
    }
    
    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
      border: 2px solid #ddd;
    }
    
    .btn-remove-image {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #dc3545;
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
    }
    
    .image-placeholder {
      width: 120px;
      height: 120px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 2px dashed #ccc;
      border-radius: 8px;
      color: #666;
      text-align: center;
      font-size: 0.9rem;
    }
    
    .image-placeholder i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: #999;
    }
    
    .file-input {
      display: none;
    }
    
    .upload-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
    }
    
    .btn-primary {
      background: #667eea;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #5a6fd8;
    }
    
    .file-info {
      text-align: center;
      color: #666;
    }
    
    .error-message {
      color: #dc3545;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .success-message {
      color: #28a745;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .loading-spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class ImageUploadComponent {
  private imageService = inject(ImageService);
  
  @Input() currentImageUrl: string = '';
  @Input() imageType: 'jugador' | 'equipo' = 'jugador';
  @Input() altText: string = 'Imagen';
  @Input() placeholderText: string = 'Sin imagen';
  
  @Output() imageUploaded = new EventEmitter<string>();
  @Output() imageRemoved = new EventEmitter<void>();
  
  selectedFile: File | null = null;
  isUploading = false;
  errorMessage = '';
  successMessage = '';
  
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    
    this.clearMessages();
    
    // Validar archivo
    const validation = this.imageService.validateImageFile(file);
    if (!validation.valid) {
      this.errorMessage = validation.error!;
      return;
    }
    
    this.selectedFile = file;
  }
  
  async uploadImage() {
    if (!this.selectedFile) return;
    
    this.isUploading = true;
    this.clearMessages();
    
    this.imageService.uploadImage(this.selectedFile, this.imageType).subscribe({
      next: (response: ImageUploadResponse) => {
        this.successMessage = 'Imagen subida exitosamente';
        this.imageUploaded.emit(response.url);
        this.selectedFile = null;
        this.isUploading = false;
        
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al subir la imagen';
        this.isUploading = false;
      }
    });
  }
  
  removeImage() {
    this.currentImageUrl = '';
    this.selectedFile = null;
    this.clearMessages();
    this.imageRemoved.emit();
  }
  
  getImageUrl(url: string): string {
    return this.imageService.getImageUrl(url);
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}