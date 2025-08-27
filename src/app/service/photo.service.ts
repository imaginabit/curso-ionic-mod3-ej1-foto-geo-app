import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';

export interface UserPhoto {
  filepath: string;      // Ruta del archivo en el dispositivo
  webviewPath: string;  // Ruta para mostrar la imagen en la app
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private static readonly CAMERA_QUALITY = 90;
  private static readonly IMAGE_FORMAT = '.jpeg';

  constructor(private platform: Platform) { }

  async takePicture(): Promise<UserPhoto | null> {

    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: PhotoService.CAMERA_QUALITY,
      allowEditing: false,
    });
    // Procesa la foto capturada
    return this.processCapturedPhoto(capturedPhoto);
  }

  private async processCapturedPhoto(photo: Photo): Promise<UserPhoto> {
    if (this.isNativePlatform()) {
      // Si es móvil, guarda la foto en el filesystem
      return this.savePhotoToFileSystem(photo);
    } else {
      // Si es web, solo prepara la foto para mostrar
      return this.processWebPhoto(photo);
    }
  }

  private async savePhotoToFileSystem(photo: Photo): Promise<UserPhoto> {
    const base64Data = await this.convertPhotoToBase64(photo);
    const fileName = this.generateFileName();

    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    return {
      filepath: savedFile.uri,
      webviewPath: Capacitor.convertFileSrc(savedFile.uri),
    };
  }

  private processWebPhoto(photo: Photo): UserPhoto {
    const fileName = this.generateFileName();
    return {
      filepath: fileName,
      webviewPath: photo.webPath || '',
    };
  }

  private async convertPhotoToBase64(photo: Photo): Promise<string> {
    if (this.isNativePlatform()) {
      // Lee el archivo desde el filesystem (móvil)
      const file = await Filesystem.readFile({
        path: photo.path!,
      });
      return file.data as string;
    } else {
      // Convierte la imagen web a base64
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();
      return this.convertBlobToBase64(blob);
    }
  }

  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  }

  private generateFileName(): string {
  return Date.now() + PhotoService.IMAGE_FORMAT;
}

  private isNativePlatform(): boolean {
    return this.platform.is('hybrid');
  }

}
