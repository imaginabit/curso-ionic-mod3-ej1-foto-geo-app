# Tutorial Paso a Paso: Foto-Geo App (Versión Básica)

## Objetivo
Crear una app Ionic + Angular que permita simular la captura de una foto y escribir una descripción, sin lista de registros.

---


## **Prerrequisitos**

Necesitas tener instalado:

```bash
# Node.js (versión 16 o superior)
node --version

# Ionic CLI
npm install -g @ionic/cli

# Para Android (opcional en esta parte)
# - Android Studio
# - Java JDK 11+
```

## 1. Instalación y generación de proyecto

### a) Crea el proyecto base

```bash
ionic start foto-geo-app blank --type=angular
cd foto-geo-app
```

### b) Instala Capacitor, PWA Elements y configura Android

```bash
npm install @capacitor/core @capacitor/cli
npm install @ionic/pwa-elements
npm install @capacitor/android
npx cap add android
npx cap sync
```

Esto creará la carpeta `/android` en tu proyecto, necesaria para compilar y ejecutar en dispositivos Android.

---

## 2. Configura PWA Elements para cámara web

Abre `src/main.ts` y **añade estas líneas antes de `bootstrapApplication`**:

```typescript
// ...código existente...
import { defineCustomElements } from '@ionic/pwa-elements/loader';
defineCustomElements(window);
// ...código existente...
```

Esto permite que la cámara funcione en el navegador.

---



## 3. Configuración del componente Home

Antes de implementar la lógica, asegúrate de que tu componente `HomePage` esté preparado para trabajar con formularios y componentes independientes de Ionic:

- Importa en la cabecera del archivo:
  ```typescript
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import {
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonItem,
    IonLabel,
    IonTextarea,
    IonImg
  } from '@ionic/angular/standalone';
  ```

- En el decorador `@Component`, agrega todos estos módulos en la propiedad `imports`:
  ```typescript
  @Component({
    // ...existing code...
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
      IonImg
    ],
  })
  ```

- Inicializa las variables del formulario en la clase:
  ```typescript
  foto: string = '';
  descripcion: string = '';
  ```

---

## 3b. Cambios en la plantilla HTML de Home

Antes de implementar la lógica, asegúrate de que tu archivo `home.page.html` tenga la estructura adecuada:

- Elimina el contenido de bienvenida por defecto generado por Ionic.
- Añade la estructura del formulario:
  ```html
  <div id="container">
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

    <!-- Botón guardar -->
    <ion-button
      expand="full"
      color="success"
      (click)="guardarRegistro()"
      [disabled]="!foto || !descripcion">
      Guardar Registro
    </ion-button>
  </div>
  ```
- Utiliza binding y directivas de Angular para enlazar los datos y controlar la visibilidad y el estado de los botones.

---

## 4. Construye la interfaz y la lógica paso a paso

### a) Declara las variables en el componente

Abre `src/app/home/home.page.ts` y declara las variables que usarás en el formulario:
```typescript
// ...existing code...
foto: string = '';
descripcion: string = '';
// ...existing code...
```

---

### b) Relaciona el botón "Tomar Foto" con la variable y el método

En el HTML (`src/app/home/home.page.html`):

```html
<ion-button expand="full" (click)="tomarFoto()">
  Tomar Foto
</ion-button>
```

En el TypeScript (`src/app/home/home.page.ts`):

```typescript
async tomarFoto() {
  // Por ahora simula una foto aleatoria
  this.foto = 'https://picsum.photos/300/200?random=' + Math.random();
}
```

---

### c) Muestra la foto en la interfaz

En el HTML, muestra la imagen solo si existe `foto`:

```html
<ion-img class="foto-preview" [src]="foto" *ngIf="foto"></ion-img>
```

---

### d) Campo de descripción enlazado a variable

En el HTML:

```html
<ion-item>
  <ion-label position="floating">Descripción</ion-label>
  <ion-textarea [(ngModel)]="descripcion"></ion-textarea>
</ion-item>
```

---

### e) Botón "Guardar" y método para limpiar el formulario

En el HTML:

```html
<ion-button 
  expand="full" 
  color="success" 
  (click)="guardarRegistro()"
  [disabled]="!foto || !descripcion">
  Guardar Registro
</ion-button>
```

En el TypeScript:

```typescript
async guardarRegistro() {
  // Por ahora solo limpia el formulario
  this.foto = '';
  this.descripcion = '';
}
```

---

### f) Añade estilos básicos

En `src/app/home/home.page.scss`:

```scss
#container {
  padding: 20px;
}

.foto-preview {
  width: 100%;
  max-height: 200px;
  margin: 15px 0;
  border-radius: 8px;
  border: 2px solid #ccc;
}

ion-button {
  margin: 10px 0;
}
```

---

## 5. Prueba tu app en el navegador

```bash
ionic serve
```

Verifica que:
- El botón "Tomar Foto" muestra una imagen de prueba.
- El campo descripción funciona y se enlaza a la variable.
- El botón "Guardar" solo se activa si hay foto y descripción.
- Al guardar, el formulario se limpia.
- Los estilos se aplican correctamente.

---

## 6. Prueba y despliegue en Android

### a) Compila la app web
```bash
ionic build
```

### b) Sincroniza los cambios con Android
```bash
npx cap copy android
npx cap sync android
```

### c) Abre el proyecto en Android Studio
```bash
npx cap open android
```

### d) Ejecuta la app en un dispositivo o emulador
Desde Android Studio, selecciona tu dispositivo o emulador y pulsa "Run". Asegúrate de tener activada la depuración USB si usas un dispositivo físico.

---

## Resumen de relaciones

- **Variable `foto`**:  
  - Se modifica con `tomarFoto()`, se muestra con `<ion-img>`, y se usa al guardar.
- **Variable `descripcion`**:  
  - Se enlaza con el campo de texto y se usa al guardar.
- **Método `guardarRegistro()`**:  
  - Limpia ambas variables.

---

## Checklist final

- [ ] El proyecto compila y se ejecuta con `ionic serve`.
- [ ] El botón "Tomar Foto" muestra una imagen de prueba.
- [ ] El campo descripción funciona y se enlaza a la variable.
- [ ] El botón "Guardar" solo se activa si hay foto y descripción.
- [ ] Al pulsar "Guardar", el formulario se limpia.
- [ ] Los estilos se aplican correctamente.
- [ ] La carpeta `/android` existe en el proyecto.
- [ ] Se puede abrir el proyecto en Android Studio con `npx cap open android`.
- [ ] La app se puede compilar y ejecutar en un dispositivo o emulador Android.
- [ ] La app funciona igual en navegador y en Android.


## Archivos 

### src\app\home\home.page.html

```html
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>
      Blank
    </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">Blank</ion-title>
    </ion-toolbar>
  </ion-header>

  <div id="container">
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

    <!-- Botón guardar (por ahora solo console.log) --> 
    <ion-button  
      expand="full"  
      color="success"  
      (click)="guardarRegistro()" 
      [disabled]="!foto || !descripcion"> 
      Guardar Registro 
    </ion-button> 
  </div>
</ion-content>
```

### src\app\home\home.page.ts

```typescript

import { CommonModule } from '@angular/common'; 
import { Component, OnInit } from '@angular/core'; 
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonLabel,
  IonTextarea,
  IonImg
} from '@ionic/angular/standalone';


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
    IonImg
  ],
})
export class HomePage {
  foto: string="";
  descripcion: string="";

  constructor() { }

  // Método que implementaremos en Parte 2 
  async tomarFoto() { 
    console.log('Función tomarFoto'); 
    // Por ahora simular una foto 
    this.foto = 'https://picsum.photos/300/200?random=' + Math.random(); 
    console.log('foto', this.foto);
  }

  async guardarRegistro() { 
    console.log('Función guardarRegistro');
  } 

}
```


### src\app\home\home.page.scss

```css
#container {
  padding: 20px;
}

.foto-preview {
  height: 50vh;
  margin: 15px 0;
  border-radius: 8px;
  border: 2px solid #ccc;
}

ion-button {
  margin: 10px 0;
}

h3 {
  color: var(--ion-color-primary);
  margin: 20px 0 10px 0;
}
```

