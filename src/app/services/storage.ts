import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage = inject(Storage);
  private authService = inject(AuthService);

  // Configuración
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  async uploadContactImage(file: File, contactId: string): Promise<string> {
    try {
      // Validar archivo
      this.validateFile(file);

      // Comprimir imagen
      const compressedFile = await this.compressImage(file);

      // Crear referencia con ruta organizada
      const userId = this.authService.currentUser?.uid;
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `contacts/${userId}/${contactId}/${fileName}`;
      const storageRef = ref(this.storage, filePath);

      // Subir archivo
      console.log('📤 Subiendo imagen...');
      await uploadBytes(storageRef, compressedFile);

      // Obtener URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log('✅ Imagen subida:', downloadURL);

      return downloadURL;
    } catch (error) {
      console.error('❌ Error al subir imagen:', error);
      throw new Error('Error al subir la imagen. Intenta nuevamente.');
    }
  }

  async uploadProfileImage(file: File): Promise<string> {
    try {
      this.validateFile(file);
      const compressedFile = await this.compressImage(file);

      const userId = this.authService.currentUser?.uid;
      const fileName = `profile_${Date.now()}.jpg`;
      const filePath = `profiles/${userId}/${fileName}`;
      const storageRef = ref(this.storage, filePath);

      console.log('📤 Subiendo foto de perfil...');
      await uploadBytes(storageRef, compressedFile);

      const downloadURL = await getDownloadURL(storageRef);
      console.log('✅ Foto de perfil subida');

      return downloadURL;
    } catch (error) {
      console.error('❌ Error al subir foto de perfil:', error);
      throw new Error('Error al subir la foto de perfil.');
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, imageUrl);
      await deleteObject(storageRef);
      console.log('🗑️ Imagen eliminada');
    } catch (error) {
      console.error('⚠️ Error al eliminar imagen:', error);
      // No lanzar error, solo log
    }
  }

  private validateFile(file: File): void {
    // Validar tipo
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo se aceptan: JPG, PNG, WEBP');
    }

    // Validar tamaño
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('El archivo es muy grande. Máximo 5MB');
    }
  }

  private async compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          let width = img.width;
          let height = img.height;

          // Calcular nuevas dimensiones
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                console.log('🗜️ Imagen comprimida:', 
                  `Original: ${(file.size / 1024).toFixed(2)}KB`,
                  `→ Comprimida: ${(compressedFile.size / 1024).toFixed(2)}KB`
                );
                resolve(compressedFile);
              } else {
                reject(new Error('Error al comprimir imagen'));
              }
            },
            'image/jpeg',
            0.8 // Calidad 80%
          );
        };

        img.onerror = () => reject(new Error('Error al cargar imagen'));
      };

      reader.onerror = () => reject(new Error('Error al leer archivo'));
    });
  }

  getImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}