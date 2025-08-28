<script>
function copyCode(btn) {
  const codeBlock = btn.nextElementSibling;
  navigator.clipboard.writeText(codeBlock.innerText);
  btn.textContent = 'Copiado!';
  setTimeout(() => btn.textContent = 'Copiar', 2000);
}
</script>

# Tutorial Paso a Paso: Foto-Geo App (Parte 3)

## Objetivo
Agregar geolocalización para capturar coordenadas GPS y persistencia de datos para guardar y mostrar una lista de registros, completando la funcionalidad de la aplicación Foto-Geo.

---

## Prerrequisitos
- Haber completado las **Parte 1** y **Parte 2**
- Tener funcionando:
  - Captura de fotos con cámara
  - Vista previa de imágenes
  - Formulario con descripción

---

## 1. Instala los plugins necesarios

Abre una terminal y ejecuta:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```bash
npm install @capacitor/geolocation @capacitor/preferences
npx cap sync
```
</div>


**Explicación:**
- `@capacitor/geolocation`: Para obtener la ubicación GPS del dispositivo
- `@capacitor/preferences`: Para guardar datos localmente de forma persistente

---

## 2. Crea el modelo de datos paso a paso

### a) Genera el archivo del modelo usando Ionic CLI

Abre la terminal y ejecuta:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```bash
npx ionic generate interface models/geo-photo.model
```
</div>

Esto creará el archivo `src/app/models/geo-photo.model.ts` directamente con el nombre correcto.

### b) Agrega la interfaz para el registro completo

Abre el archivo `src/app/models/geo-photo.model.ts` y reemplaza el contenido generado por:

### c) Agrega la interfaz para el registro completo

Abre el archivo `src/app/models/geo-photo.model.ts` y reemplaza el contenido generado por:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
export interface GeoPhotoRecord {
  id: string;
  photo: string;           // Base64 o ruta de la imagen
  description: string;     // Descripción del usuario
  coordinates?: Coordinates; // Coordenadas (latitude, longitude)
  date: string;            // Fecha y hora de creación
}
```
</div>

### c) Agrega la interfaz para coordenadas

En el mismo archivo `src/app/models/geo-photo.model.ts`, agrega debajo de la interfaz anterior:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
export interface Coordinates {
  latitude: number;
  longitude: number;
}
```
</div>

**Explicación:**
Un modelo define la estructura de datos que usará tu aplicación. Es como un "contrato" que especifica qué campos debe tener cada registro. Ionic CLI nos ayuda a mantener la estructura organizada del proyecto.

---

## 3. Crea el servicio de geolocalización paso a paso

### a) Genera el servicio usando Ionic CLI

Abre la terminal y ejecuta:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```bash
npx ionic generate service services/geolocation.service
```
</div>

Esto creará el archivo `src/app/service/geolocation.service.ts` directamente con el nombre correcto.

### b) Agrega las importaciones necesarias

Abre `src/app/service/geolocation.service.ts` y reemplaza las importaciones por:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Coordinates } from '../models/coordinates.model';
```
</div>

### c) Declara la clase del servicio

Asegúrate de que la clase tenga esta estructura básica:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  constructor() {}
  
  // Métodos se implementarán en los siguientes pasos
}
```
</div>

---

## 4. Implementa la lógica de geolocalización paso a paso

### a) Crea el método principal para obtener posición

Agrega el método principal en `GeolocationService`:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
async getCurrentPosition(): Promise<Coordinates | null> {
  // Implementación en el siguiente paso
}
```
</div>

### b) Implementa la verificación de permisos

Agrega este método privado en `GeolocationService`:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
private async checkPermissions(): Promise<boolean> {
  // Implementación en el siguiente paso
}
```
</div>

### c) Agrega método utilitario para formatear coordenadas

Agrega este método público en `GeolocationService`:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}
```
</div>

---

## 5. Completa la implementación de los métodos de geolocalización

### a) Implementa `getCurrentPosition`

Reemplaza el método vacío por esta implementación completa:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
async getCurrentPosition(): Promise<Coordinates | null> {
  try {
    // Verificar permisos
    const hasPermission = await this.checkPermissions();
    if (!hasPermission) {
      return null;
    }

    // Obtener posición actual
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
  } catch (error) {
    console.error('Error obteniendo ubicación:', error);
    return null;
  }
}
```
</div>

### b) Implementa `checkPermissions`

Reemplaza el método vacío por esta implementación:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
private async checkPermissions(): Promise<boolean> {
  try {
    // Verificar permisos actuales
    const permission = await Geolocation.checkPermissions();
    
    if (permission.location === 'granted') {
      return true;
    }

    // Solicitar permisos si no están concedidos
    if (permission.location === 'prompt') {
      const requestResult = await Geolocation.requestPermissions();
      return requestResult.location === 'granted';
    }

    return false;
  } catch (error) {
    console.error('Error verificando permisos:', error);
    return false;
  }
}
```
</div>

---

## 6. Crea el servicio de almacenamiento paso a paso

### a) Genera el servicio de almacenamiento

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```bash
npx ionic generate service services/storage.service
```
</div>

Esto creará el archivo `src/app/service/storage.service.ts` directamente con el nombre correcto.

### b) Agrega las importaciones necesarias

Abre `src/app/service/storage.service.ts` y reemplaza las importaciones por:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { GeoPhotoRecord } from '../models/geo-photo.model';
```
</div>

### c) Declara la constante para la clave de almacenamiento

En la clase `StorageService`, agrega justo después de la declaración de clase:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly RECORDS_KEY = 'geo-photo-records';

  constructor() {}
  
  // Métodos se implementarán en los siguientes pasos
}
```
</div>

---

## 7. Implementa los métodos del servicio de almacenamiento paso a paso

### a) Crea los métodos esqueleto

Agrega estos métodos vacíos en `StorageService`:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
async saveRecord(record: GeoPhotoRecord): Promise<void> {
  // Implementación en el siguiente paso
}

async getAllRecords(): Promise<GeoPhotoRecord[]> {
  // Implementación en el siguiente paso
}

async deleteRecord(id: string): Promise<void> {
  // Implementación en el siguiente paso
}

generateId(): string {
  // Implementación en el siguiente paso
}
```
</div>

### b) Implementa `generateId`

Reemplaza el método vacío por:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
generateId(): string {
  return 'record_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
```
</div>

### c) Implementa `getAllRecords`

Reemplaza el método vacío por:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
async getAllRecords(): Promise<GeoPhotoRecord[]> {
  try {
    const result = await Preferences.get({ key: this.RECORDS_KEY });
    return result.value ? JSON.parse(result.value) : [];
  } catch (error) {
    console.error('Error obteniendo registros:', error);
    return [];
  }
}
```
</div>

### d) Implementa `saveRecord`

Reemplaza el método vacío por:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
async saveRecord(record: GeoPhotoRecord): Promise<void> {
  try {
    const records = await this.getAllRecords();
    records.push(record);
    
    await Preferences.set({
      key: this.RECORDS_KEY,
      value: JSON.stringify(records)
    });
  } catch (error) {
    console.error('Error guardando registro:', error);
    throw error;
  }
}
```
</div>

### e) Implementa `deleteRecord`

Reemplaza el método vacío por:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
async deleteRecord(id: string): Promise<void> {
  try {
    const records = await this.getAllRecords();
    const filteredRecords = records.filter(record => record.id !== id);
    
    await Preferences.set({
      key: this.RECORDS_KEY,
      value: JSON.stringify(filteredRecords)
    });
  } catch (error) {
    console.error('Error eliminando registro:', error);
    throw error;
  }
}
```
</div>

---

## 8. Actualiza el componente HomePage paso a paso

### a) Agrega las nuevas importaciones al inicio del archivo

Abre `src/app/home/home.page.ts` y agrega estas importaciones después de las existentes:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
import { GeolocationService } from '../service/geolocation.service';
import { StorageService } from '../service/storage.service';
import { GeoPhotoRecord } from '../models/geo-photo.model';
import { Coordinates } from '../models/coordinates.model';
```
</div>

### b) Agrega los nuevos componentes de Ionic a las importaciones

En el mismo archivo, encuentra la sección de importaciones de componentes y agrega estos nuevos:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
import {
  // ...importaciones existentes...
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonIcon,
  IonText,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/angular/standalone';
```
</div>

### c) Actualiza el array `imports` en el decorador @Component

Encuentra el decorador `@Component` y agrega los nuevos componentes al array `imports`:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonItem,
    IonLabel,
    IonTextarea,
    IonImg,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonList,
    IonIcon,
    IonText,
    IonGrid,
    IonRow,
    IonCol
  ],
})
```
</div>

---

## 9. Actualiza las variables del componente HomePage

### a) Agrega nuevas variables después de las existentes

En la clase `HomePage`, después de las variables existentes `foto` y `descripcion`, agrega:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
export class HomePage implements OnInit {
  foto: string = "";
  descripcion: string = "";
  coordenadas: Coordinates | null = null;
  registros: GeoPhotoRecord[] = [];
  cargandoUbicacion: boolean = false;
```
</div>

### b) Inyecta los nuevos servicios

Después de la inyección existente del `PhotoService`, agrega:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
private photoService = inject(PhotoService);
private geoService = inject(GeolocationService);
private storageService = inject(StorageService);
```
</div>

### c) Implementa OnInit

Cambia la declaración de clase para implementar `OnInit`:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
export class HomePage implements OnInit {
```
</div>

Y agrega el método `ngOnInit` después del constructor:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
constructor() { }

async ngOnInit() {
  await this.cargarRegistros();
}
```
</div>

---

## 10. Actualiza los métodos existentes del HomePage

### a) Modifica el método `tomarFoto` existente

Encuentra el método existente `tomarFoto` y reemplázalo por esta versión que incluye geolocalización automática:
<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
async tomarFoto() {
  console.log('Función tomarFoto');
  const photoResult = await this.photoService.takePicture();
  if (photoResult) {
    this.foto = photoResult.webviewPath;
    // Obtener ubicación automáticamente al tomar foto
    await this.obtenerUbicacion();
  }
}
```
</div>

### b) Modifica el método `guardarRegistro` existente

Encuentra el método existente `guardarRegistro` y reemplázalo por esta versión completa:
<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
async guardarRegistro() {
  if (!this.foto || !this.descripcion) {
    console.warn('Faltan datos para guardar');
    return;
  }

  try {
    const registro: GeoPhotoRecord = {
      id: this.storageService.generateId(),
      photo: this.foto,
      description: this.descripcion,
      coordinates: this.coordenadas ?? undefined,
      date: new Date().toLocaleString(),
    };

    await this.storageService.saveRecord(registro);
    console.log('Registro guardado:', registro);
    
    // Limpiar formulario y recargar lista
    this.limpiarFormulario();
    await this.cargarRegistros();
  } catch (error) {
    console.error('Error guardando registro:', error);
  }
}
```
</div>

### c) Modifica el método `eliminarFoto` existente

Encuentra el método existente `eliminarFoto` y reemplázalo por:
<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
eliminarFoto() {
  this.foto = '';
  this.coordenadas = null;
}
```
</div>

---

## 11. Agrega los nuevos métodos al HomePage

### a) Agrega el método para obtener ubicación

Después de los métodos existentes, agrega:
<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript

async obtenerUbicacion() {
  this.cargandoUbicacion = true;
  try {
    this.coordenadas = await this.geoService.getCurrentPosition();
    if (!this.coordenadas) {
      console.warn('No se pudo obtener la ubicación');
    }
  } finally {
    this.cargandoUbicacion = false;
  }
}
```
</div>

### b) Agrega el método para cargar registros
<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript

async cargarRegistros() {
  try {
    this.registros = await this.storageService.getAllRecords();
    // Ordenar por fecha más reciente primero
  this.registros.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error cargando registros:', error);
  }
}
```
</div>

### c) Agrega el método para eliminar registros
<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript

async eliminarRegistro(id: string) {
  try {
    await this.storageService.deleteRecord(id);
    await this.cargarRegistros();
  } catch (error) {
    console.error('Error eliminando registro:', error);
  }
}
```
</div>

### d) Agrega el método privado para limpiar formulario
<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript

private limpiarFormulario() {
  this.foto = '';
  this.descripcion = '';
  this.coordenadas = null;
}
```
</div>

---

## 12. Agrega métodos utilitarios al HomePage

### a) Agrega getter para verificar si hay ubicación
<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript

get tieneUbicacion(): boolean {
  return this.coordenadas !== null;
}
```
</div>

### b) Agrega getter para validar formulario

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

get formularioValido(): boolean {
  return !!(this.foto && this.descripcion);
}
```
```
</div>

---

## 13. Actualiza la interfaz HTML paso a paso

### a) Cambia el título de la aplicación

Abre `src/app/home/home.page.html` y cambia el título en el header:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```html
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>Foto-Geo App</ion-title>
  </ion-toolbar>
</ion-header>
```
</div>

### b) Reemplaza el contenido del container por una estructura de cards

Encuentra el `<div id="container">` y reemplaza todo su contenido por:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```html
<div id="container">
  <!-- Sección: Nuevo Registro -->
  <ion-card>
    <ion-card-header>
      <ion-card-title>Nuevo Registro</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      
      <!-- Contenido del formulario se agregará en los siguientes pasos -->
      
    </ion-card-content>
  </ion-card>
  
  <!-- Otras secciones se agregarán en los siguientes pasos -->
  
</div>
```
</div>

### c) Agrega el formulario dentro del primer card

Dentro de `<ion-card-content>` del primer card, agrega el formulario existente con algunos cambios:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```html
<!-- Botón para tomar foto -->
<ion-button expand="full" (click)="tomarFoto()">
  Tomar Foto
</ion-button>

<!-- Campo descripción -->
<ion-item>
  <ion-label position="floating">Descripción</ion-label>
  <ion-textarea [(ngModel)]="descripcion"></ion-textarea>
</ion-item>

<!-- Vista previa de la foto -->
<ion-img class="foto-preview" [src]="foto" *ngIf="foto"></ion-img>

<!-- Botón eliminar foto -->
<ion-button 
  fill="clear" 
  color="danger" 
  *ngIf="foto" 
  (click)="eliminarFoto()">
  Eliminar Foto
</ion-button>
```
</div>

### d) Agrega la información de ubicación después del botón eliminar

Después del botón "Eliminar Foto", agrega:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```html
<!-- Información de ubicación -->
<div class="ubicacion-info" *ngIf="tieneUbicacion">
  <ion-text color="success">
    <h4>📍 Ubicación obtenida</h4>
    <p>{{coordenadas!.latitude.toFixed(6)}}, {{coordenadas!.longitude.toFixed(6)}}</p>
  </ion-text>
</div>

<div class="ubicacion-info" *ngIf="cargandoUbicacion">
  <ion-text color="warning">
    <p>🔍 Obteniendo ubicación...</p>
  </ion-text>
</div>
```
</div>

### e) Agrega el botón para obtener ubicación manualmente

Después de la información de ubicación:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```html
<!-- Botón para obtener ubicación manualmente -->
<ion-button 
  expand="full" 
  fill="outline" 
  color="secondary"
  (click)="obtenerUbicacion()"
  [disabled]="cargandoUbicacion">
  {{cargandoUbicacion ? 'Obteniendo ubicación...' : 'Obtener Ubicación GPS'}}
</ion-button>
```
</div>

### f) Actualiza el botón guardar con la nueva validación

Reemplaza el botón "Guardar Registro" existente por:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```html
<!-- Botón guardar -->
<ion-button
  expand="full"
  color="success"
  (click)="guardarRegistro()"
  [disabled]="!formularioValido">
  Guardar Registro
</ion-button>
```
</div>

---

## 14. Agrega la sección de lista de registros al HTML

### a) Agrega el card para mostrar registros guardados

Después del primer card (Nuevo Registro), pero antes del cierre de `</div>`, agrega:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```html
<!-- Sección: Lista de Registros -->
<ion-card *ngIf="registros.length > 0">
  <ion-card-header>
    <ion-card-title>Registros Guardados ({{registros.length}})</ion-card-title>
  </ion-card-header>
  <ion-card-content>
    
    <!-- Contenido de la lista se agregará en el siguiente paso -->
    
  </ion-card-content>
</ion-card>
```
</div>

### b) Agrega la lista de registros dentro del segundo card

Dentro de `<ion-card-content>` del segundo card, agrega:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```html
<ion-list>
  <ion-item *ngFor="let registro of registros">
    <ion-grid>
      <ion-row>
        <!-- Columna de imagen -->
        <ion-col size="4">
          <ion-img 
            [src]="registro.photo" 
            class="registro-imagen">
          </ion-img>
        </ion-col>
        
        <!-- Columna de información -->
        <ion-col size="6">
          <div class="registro-info">
            <h3>{{registro.description}}</h3>
            <p class="date">📅 {{registro.date}}</p>
            <p class="coordenadas">📍 {{registro.coordinates?.latitude.toFixed(6)}}, {{registro.coordinates?.longitude.toFixed(6)}}</p>
          </div>
        </ion-col>
        
        <!-- Columna de botón eliminar -->
        <ion-col size="2" class="ion-text-center">
          <ion-button 
            fill="clear" 
            color="danger" 
            size="small"
            (click)="eliminarRegistro(registro.id)">
            🗑️
          </ion-button>
        </ion-col>
        
      </ion-row>
    </ion-grid>
  </ion-item>
</ion-list>
```
</div>

### c) Agrega el mensaje cuando no hay registros

Después del segundo card, agrega:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```html
<!-- Mensaje cuando no hay registros -->
<ion-card *ngIf="registros.length === 0">
  <ion-card-content class="ion-text-center">
    <ion-text color="medium">
      <h4>No hay registros guardados</h4>
      <p>Toma tu primera foto con ubicación para comenzar</p>
    </ion-text>
  </ion-card-content>
</ion-card>
```
</div>

---

## 15. Actualiza los estilos paso a paso

### a) Actualiza los estilos base del container

Abre `src/app/home/home.page.scss` y reemplaza el estilo del container:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```scss
#container {
  padding: 16px;
}
```
</div>

### b) Mejora los estilos de vista previa de foto

Encuentra la clase `.foto-preview` y reemplaza por:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```scss
.foto-preview {
  height: 40dvh;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  object-fit: contain;
  background-color: hsla(0, 0%, 0%, 0.1);
  margin: 16px 0;
}
```
</div>

### c) Agrega estilos para las imágenes de registros

Después de los estilos existentes, agrega:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```scss
.registro-imagen {
  height: 80px;
  width: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
}
```
</div>

### d) Agrega estilos para la información de registros

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```scss
.registro-info {
  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: var(--ion-color-primary);
    font-weight: 500;
  }

  p {
    margin: 4px 0;
    font-size: 14px;
    color: var(--ion-color-medium);

    &.fecha {
      color: var(--ion-color-success);
    }

    &.coordenadas {
      font-family: monospace;
      font-size: 12px;
    }
  }
}
```
</div>

### e) Agrega estilos para la información de ubicación

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```scss
.ubicacion-info {
  margin: 16px 0;
  padding: 12px;
  background-color: var(--ion-color-light);
  border-radius: 8px;
  border-left: 4px solid var(--ion-color-success);

  h4 {
    margin: 0 0 8px 0;
    color: var(--ion-color-success);
  }

  p {
    margin: 0;
    font-family: monospace;
    font-size: 14px;
  }
}
```
</div>

### f) Mejora los estilos de cards y botones

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```scss
// Estilos para cards
ion-card {
  margin: 16px 0;
  
  ion-card-title {
    color: var(--ion-color-primary);
    font-size: 18px;
  }
}

// Estilos generales para botones  
ion-button {
  margin: 10px 0;

  &[disabled] {
    opacity: 0.5;
  }
}
```
</div>

### g) Agrega estilos responsive

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```scss
// Responsive adjustments
@media (max-width: 768px) {
  .registro-info h3 {
    font-size: 14px;
  }
  
  .registro-info p {
    font-size: 12px;
  }
}
```
</div>

---

## 16. Configura permisos para Android

### a) Localiza el archivo AndroidManifest.xml

Navega hasta `android/app/src/main/AndroidManifest.xml` en tu proyecto.

### b) Agrega los permisos de ubicación

Dentro del tag `<manifest>` y antes del tag `<application>`, agrega estos permisos:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
```
</div>

**Explicación de cada permiso:**
- `ACCESS_COARSE_LOCATION`: Ubicación aproximada basada en torres de telefonía
- `ACCESS_FINE_LOCATION`: Ubicación precisa usando GPS
- `ACCESS_BACKGROUND_LOCATION`: Para ubicación cuando la app está en segundo plano

---

## 17. Prueba la aplicación paso a paso

### a) Prueba en el navegador

Ejecuta el comando:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```bash
ionic serve
```
</div>

**Verifica estas funcionalidades:**
1. El botón "Tomar Foto" funciona y solicita ubicación automáticamente
2. Se puede obtener ubicación manualmente con el botón correspondiente
3. Los registros se guardan correctamente con foto, descripción y ubicación
4. La lista muestra todos los registros guardados
5. Se pueden eliminar registros individuales
6. La interfaz es responsive y clara

### b) Prueba en Android

Ejecuta los comandos:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```bash
npx cap sync android
npx cap open android
```
</div>

**Verifica en el dispositivo móvil:**
1. Solicita permisos de ubicación al usar GPS por primera vez
2. La geolocalización funciona con coordenadas reales
3. Los datos se persisten al cerrar y reabrir la app
4. Todas las funcionalidades web también funcionan en móvil

---

## 18. Resumen de funcionalidades implementadas

### a) Geolocalización completada
- ✅ Obtener coordenadas GPS automáticamente al tomar foto
- ✅ Botón manual para obtener ubicación
- ✅ Gestión de permisos de ubicación
- ✅ Formato legible de coordenadas
- ✅ Manejo de errores de geolocalización

### b) Persistencia de datos completada
- ✅ Guardar registros localmente
- ✅ Cargar registros al iniciar la app
- ✅ Eliminar registros individuales
- ✅ Generación de IDs únicos
- ✅ Ordenamiento por fecha

### c) Interfaz mejorada completada
- ✅ Cards organizadas por secciones
- ✅ Lista visual de registros guardados
- ✅ Indicadores de estado de ubicación
- ✅ Validación de formularios
- ✅ Diseño responsive

---

## 19. Archivos relacionados

Al completar este tutorial, habrás trabajado con estos archivos:

- `src/app/models/geo-photo.model.ts`: Modelos de datos y interfaces
 - `src/app/service/geolocation.service.ts`: Servicio de geolocalización
 - `src/app/service/storage.service.ts`: Servicio de almacenamiento
 - `src/app/service/geolocation.service.ts`: Servicio de geolocalización
 - `src/app/service/storage.service.ts`: Servicio de almacenamiento
- `src/app/home/home.page.ts`: Lógica completa del componente
- `src/app/home/home.page.html`: Interfaz con lista de registros
- `src/app/home/home.page.scss`: Estilos mejorados
- `android/app/src/main/AndroidManifest.xml`: Permisos de ubicación


---

¡Felicidades! Has completado una aplicación móvil completa con Ionic + Angular que combina fotografía, geolocalización y persistencia de datos. La app ahora puede capturar fotos, obtener coordenadas GPS y guardar registros que se mantienen entre sesiones de la aplicación.

---

## 📚 ¿Qué sigue? Parte 4 - Base de datos SQLite

En la **Parte 4** del tutorial, mejoraremos significativamente el almacenamiento de datos:

### **Migración a SQLite:**
- Reemplazar `@capacitor/preferences` por una base de datos SQLite real
- Crear tablas estructuradas para registros y fotos
- Implementar consultas SQL optimizadas
- Relaciones entre tablas (registros → fotos)

### **Nuevas funcionalidades con SQLite:**
- **Búsqueda avanzada**: Filtrar por fecha, ubicación, descripción
- **Paginación**: Manejar miles de registros eficientemente  
- **Estadísticas**: Consultas agregadas (COUNT, AVG, etc.)
- **Backup/Restore**: Exportar e importar base de datos completa
- **Sincronización**: Preparar datos para sync con servidor

### **Ventajas de SQLite:**
- **Rendimiento**: Consultas más rápidas que JSON
- **Escalabilidad**: Manejar grandes volúmenes de datos
- **Integridad**: Constraints y validaciones a nivel de DB
- **Flexibilidad**: Consultas complejas y reportes

**¡Prepárate para llevar tu app al siguiente nivel con una base de datos profesional!**

## Posibles mejoras futuras

Una vez completado este tutorial, podrías considerar estas mejoras:

-  **Sincronización en la nube**: Usar Firebase o similar
-  **Geocodificación inversa**: Convertir coordenadas a direcciones reales
-  **Mapa interactivo**: Mostrar ubicaciones en un mapa
-  **Compartir registros**: Exportar fotos con metadatos
-  **Búsqueda y filtros**: Buscar por descripción o fecha
-  **Estadísticas**: Mostrar métricas de uso
