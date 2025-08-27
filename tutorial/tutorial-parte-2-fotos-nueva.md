# Tutorial Paso a Paso: Foto-Geo App (Parte 2)

## Objetivo
Agregar funcionalidad real de cámara y gestión de fotos usando un servicio en Ionic + Angular, manteniendo la estructura clara y guiada como en la Parte 1.

---

## Prerrequisitos
- Haber completado la **Parte 1**
- Tener instalado:
  - `@capacitor/camera`
  - `@capacitor/filesystem`
  - `@ionic/angular`

---

## 1. Instala los plugins necesarios

Abre una terminal y ejecuta:

```bash
npm install @capacitor/camera @capacitor/filesystem
npx cap sync
```

---

src/app/services/photo.service.ts

## 2. Crea el servicio de fotos paso a paso

### a) Crea el archivo del servicio usando Ionic CLI

Abre la terminal y ejecuta:

```bash
npx ionic generate service app/services/photo.service
```

Esto creará dos archivos:
- `src/app/services/photo.service.ts`
- `src/app/services/photo.service.spec.ts`

Trabajaremos solo en el archivo `.ts`.

### b) Explicación: ¿Qué es un servicio?

Un servicio en Angular permite centralizar lógica reutilizable, como la gestión de fotos, y se puede inyectar en cualquier componente.

### c) Define la interfaz para la foto de usuario

Abre `src/app/services/photo.service.ts` y agrega al inicio:

```typescript
export interface UserPhoto {
  filepath: string;      // Ruta del archivo en el dispositivo
  webviewPath: string;  // Ruta para mostrar la imagen en la app
}
```

### d) Declara la clase del servicio

Debajo de la interfaz, asegúrate de tener:

```typescript
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  constructor() {}
  // Métodos se implementarán en los siguientes pasos
}
```

Así tendrás la base lista para agregar la lógica de cámara y archivos en los siguientes pasos.

---

## 3. Implementa la lógica de tomar foto

### a) Agrega dependencias de Capacitor

Agrega los imports necesarios al inicio del archivo `photo.service.ts`:

```typescript
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
```

### b) Inyecta Platform en el constructor

```typescript
constructor(private platform: Platform) {}
```

La clase Platform de @ionic/angular sirve para detectar en qué plataforma se está ejecutando tu app (por ejemplo: web, Android, iOS, escritorio).


### c) Crea el método para tomar foto

Agrega el método:

```typescript
async takePicture(): Promise<UserPhoto | null> {
  // Implementación en el siguiente paso
}
```

---

## 4. Procesa y guarda la foto

### a) Agrega métodos privados para procesar la foto

Agrega los siguientes métodos vacíos en `PhotoService`:

```typescript
private async processCapturedPhoto(photo: Photo): Promise<UserPhoto> {
  // Implementación siguiente
}

private async savePhotoToFileSystem(photo: Photo): Promise<UserPhoto> {
  // Implementación siguiente
}

private processWebPhoto(photo: Photo): UserPhoto {
  // Implementación siguiente
}
```

Todos estos metodos probablemente muestren un error ahora mismo por que no estan devolviendo el tipo de dato que le pedimos que devuelva, por ejemplo, processWebPhoto tiene deve devolver UserPhoto y no devuelve nada




### b) Implementa la lógica en cada método paso a paso

Ahora vamos a implementar cada método del servicio paso a paso. Abre `src/app/services/photo.service.ts` y sigue estas instrucciones:

#### 1. Agrega las constantes a la clase

Al inicio de la clase `PhotoService`, justo después de la línea `export class PhotoService {`, agrega:

```typescript
// Constantes de configuración
private static readonly CAMERA_QUALITY = 90;
private static readonly IMAGE_FORMAT = '.jpeg';

```

#### 2. Método `takePicture`

Este método abre la cámara y gestiona errores:

```typescript
async takePicture(): Promise<UserPhoto | null> {
  try {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: PhotoService.CAMERA_QUALITY,
      allowEditing: false,
    });
    // Procesa la foto capturada
    return this.processCapturedPhoto(capturedPhoto);
  } catch (error) {
    // Si el usuario cancela o hay error, retorna null
    return null;
  }
}
```

#### 3. Método `processCapturedPhoto`

Decide si guardar la foto en el filesystem (móvil) o solo mostrarla (web):

```typescript
private async processCapturedPhoto(photo: Photo): Promise<UserPhoto> {
  if (this.isNativePlatform()) {
    // Si es móvil, guarda la foto en el filesystem
    return this.savePhotoToFileSystem(photo);
  } else {
    // Si es web, solo prepara la foto para mostrar
    return this.processWebPhoto(photo);
  }
}
```

#### 4. Método `savePhotoToFileSystem`

Convierte la foto a base64, la guarda y retorna la info:

```typescript
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
```

#### 5. Método `processWebPhoto`

Prepara la foto para mostrar en la web:

```typescript
private processWebPhoto(photo: Photo): UserPhoto {
  const fileName = this.generateFileName();
  return {
    filepath: fileName,
    webviewPath: photo.webPath || '',
  };
}
```

#### 6. Métodos auxiliares

Agrega estos métodos privados al final de la clase para completar la funcionalidad:

##### 6.1. Método `convertPhotoToBase64`

Convierte una foto a formato Base64, dependiendo de si la app se ejecuta en un dispositivo móvil o en la web:

```typescript
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
```

##### 6.2. Método `convertBlobToBase64`

Convierte un objeto Blob (datos binarios) a una cadena Base64:

```typescript
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
```

##### 6.3. Método `generateFileName`

Genera un nombre de archivo único basado en la marca de tiempo actual:

```typescript
private generateFileName(): string {
  return Date.now() + PhotoService.IMAGE_FORMAT;
}
```

##### 6.4. Método `isNativePlatform`

Verifica si la aplicación se está ejecutando en una plataforma nativa (móvil) o en la web:

```typescript
private isNativePlatform(): boolean {
  return this.platform.is('hybrid');
}
```

---

Con esto, tu servicio `PhotoService` estará completo y funcional. Si copias y pegas cada bloque en el lugar indicado, tu archivo no debería mostrar errores y la cámara funcionará tanto en web como en móvil.

---

## 5. Integra el servicio en HomePage

### a) Importa el servicio en `home.page.ts`

```typescript
import { PhotoService } from '../app/services/photo.service';
```

### b) Inyecta el servicio usando `inject`

La función inject de Angular permite obtener una instancia de un servicio o dependencia directamente dentro de una clase, sin necesidad de usar el constructor.
Es una forma moderna y recomendada (desde Angular 14+) para inyectar servicios, especialmente en componentes standalone o cuando quieres evitar constructores largos.

es el equivalente a hacer 
constructor(private photoService: PhotoService) {}
para injectar dependencias 


```typescript
//importa inject 
import { Component, inject } from '@angular/core';


// dentro de class HomePage
private photoService = inject(PhotoService);
```

### c) Crea el método `tomarFoto` en HomePage

```typescript
async tomarFoto() {
  const photoResult = await this.photoService.takePicture();
  if (photoResult) {
    this.foto = photoResult.webviewPath;
  }
}
```

---

## 6. Actualiza la interfaz de usuario

### a) Modifica el archivo HTML

Edita `src/app/home/home.page.html` para agregar el botón eliminar:

```html
<!-- Botón eliminar foto -->
<ion-button fill="clear" color="danger" *ngIf="foto" (click)="eliminarFoto()">
  Eliminar Foto
</ion-button>
```

### b) Agrega el método `eliminarFoto` en HomePage

```typescript
eliminarFoto() {
  this.foto = '';
}
```

---

## 7. Mejora los estilos

Edita `src/app/home/home.page.scss` para mejorar la vista previa y botones:

```scss
.foto-preview {
  height: 40dvh;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  object-fit: contain;
  background-color: hsla(0, 0%, 0%, 0.6);
}

ion-button {
  margin: 10px 0;

  &[disabled] {
    opacity: 0.5;
  }
}
```

---

## 8. Prueba la app

### a) En el navegador

```bash
ionic serve
```

- Verifica que el botón "Tomar Foto" abre la cámara del navegador.
- La foto se muestra en la vista previa.
- El botón eliminar funciona.

### b) En Android

```bash
npx cap sync android
npx cap open android
```

- Prueba la cámara nativa y la vista previa.

---

## 9. Archivos relacionados

- `src/app/services/photo.service.ts`: Servicio de fotos
- `src/app/home/home.page.ts`: Lógica de integración
- `src/app/home/home.page.html`: Interfaz de usuario
- `src/app/home/home.page.scss`: Estilos

---

## Checklist final

- [ ] Servicio de fotos creado
- [ ] Cámara funciona en web y Android
- [ ] Vista previa y eliminación de fotos
- [ ] UI mejorada
- [ ] Sin errores en consola

---

¡Listo! Continúa con la Parte 3 para agregar geolocalización.
