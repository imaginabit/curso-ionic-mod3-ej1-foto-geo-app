<script>
// Mejora del botón copiar: añade aria-labels a los botones y usa fallback si navigator.clipboard no está disponible
function copyCode(btn) {
  const codeBlock = btn.nextElementSibling;
  const text = codeBlock ? codeBlock.innerText : '';

  // Intentar usar la API moderna
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => {
        btn.textContent = 'Copiado!';
        setTimeout(() => btn.textContent = 'Copiar', 2000);
      })
      .catch(() => fallbackCopy(text, btn));
  } else {
    fallbackCopy(text, btn);
  }
}

function fallbackCopy(text, btn) {
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    btn.textContent = 'Copiado!';
    setTimeout(() => btn.textContent = 'Copiar', 2000);
  } catch (err) {
    // último recurso: seleccionar texto para que el usuario lo copie manualmente
    if (btn && btn.nextElementSibling) {
      const cb = btn.nextElementSibling;
      const range = document.createRange();
      range.selectNodeContents(cb);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      btn.textContent = 'Selecciona y copia (Ctrl+C)';
    }
  }
}

// Añadir aria-labels a botones existentes para accesibilidad
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('button[onclick^="copyCode"]').forEach(btn => {
    if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', 'Copiar código');
    btn.setAttribute('type', 'button');
  });
  // Inicializar progreso del índice (checkboxes interactivos)
  if (typeof initIndexProgress === 'function') initIndexProgress();
  if (typeof normalizeTerminalWrappers === 'function') normalizeTerminalWrappers();
});

/* Persistencia de progreso del índice: guarda/recupera en localStorage */
const INDEX_STORAGE_KEY = 'tutorial-parte-3-geo-persistencia-progress';

function initIndexProgress() {
  const stored = localStorage.getItem(INDEX_STORAGE_KEY);
  let state = {};
  try { state = stored ? JSON.parse(stored) : {}; } catch (e) { state = {}; }

  document.querySelectorAll('.tutorial-index input[type="checkbox"][data-step]').forEach(cb => {
    const id = cb.getAttribute('data-step');
    cb.checked = !!state[id];
    updateLabelCompleted(cb);
    cb.addEventListener('change', () => {
      saveCheckboxState(cb);
      updateLabelCompleted(cb);
    });
  });
}

function saveCheckboxState(cb) {
  const id = cb.getAttribute('data-step');
  if (!id) return;
  let state = {};
  try { state = JSON.parse(localStorage.getItem(INDEX_STORAGE_KEY) || '{}'); } catch (e) { state = {}; }
  state[id] = !!cb.checked;
  try { localStorage.setItem(INDEX_STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

function updateLabelCompleted(cb) {
  const label = cb.closest('label');
  if (!label) return;
  if (cb.checked) label.classList.add('completed'); else label.classList.remove('completed');
}


</script>

<style>
.mini-reto {
  border-left: 4px solid #2b8aef;
  background: #f0f8ff;
  padding: 12px 16px;
  margin: 12px 0 18px 0;
  border-radius: 6px;
}
.mini-reto h2, .mini-reto h3 {
  margin-top: 0;
}
.mini-reto .reto-meta {
  font-size: 0.95em;
  color: #254e7b;
}

/* Estilos para índice, admoniciones y bloques de terminal/comandos */
.tutorial-index {
  background: #ffffff;
  border: 1px solid #e6eef6;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 12px 0 18px 0;
}
.tutorial-index .index-item {
  display: block;
  padding: 6px 0;
}
.admonition {
  border-left: 4px solid #6c757d;
  background: #f8f9fa;
  padding: 12px 16px;
  margin: 12px 0;
  border-radius: 6px;
}
.admonition--note {
  border-left-color: #2b8aef;
}
.admonition p { margin: 0; }

/* Bloques de comandos / terminal */
/* Nota: aplicamos el fondo oscuro sólo al <pre> / <code> dentro del wrapper
   .code-toolbar.terminal para evitar que otros elementos fuera de <pre>
   (por ejemplo etiquetas, botones o texto adicional) queden con fondo negro. */
.code-toolbar.terminal {
  position: relative;
  margin: 12px 0;
}
.code-toolbar.terminal pre,
.code-toolbar.terminal code {
  background: #0f1720; /* fondo oscuro para terminal */
  color: #e6eef6;
  border-radius: 6px;
  padding: 8px;
  margin: 0;
  overflow: auto;
}
.code-toolbar.terminal pre { /* mantener posibilidad de ajustes específicos */ }
.code-toolbar.terminal .copy-btn { position: absolute; top: 8px; right: 8px; }
</style>

# Tutorial Paso a Paso: Foto-Geo App (Parte 3)

## Objetivo
Agregar geolocalización para capturar coordenadas GPS y persistencia de datos para guardar y mostrar una lista de registros, completando la funcionalidad de la aplicación Foto-Geo.

<aside class="admonition admonition--note" role="note">
<p>En esta parte añadiremos geolocalización para capturar coordenadas al tomar fotos y un servicio de persistencia para guardar registros (foto, descripción, coordenadas, fecha). Al final tendrás una lista de registros guardados y la posibilidad de eliminarlos.</p>
</aside>

## Prerrequisitos
Qué vas a construir / Aprenderás:
- Añadir geolocalización (obtener lat/lng y manejar permisos)
- Guardar y recuperar registros usando `@capacitor/preferences`
- Integrar geolocalización y persistencia en `HomePage` y mostrar la lista


---

## Índice

Marca los pasos a medida que los completes:

<nav class="tutorial-index" role="navigation" aria-label="Índice del tutorial">
<ul class="index-list">
  <li>
  <label><input type="checkbox" aria-hidden="true" data-step="step-1"> <a href="#1-instala-los-plugins-necesarios">1. Instala los plugins necesarios</a></label>
  </li>
  <li>
  <label><input type="checkbox" aria-hidden="true" data-step="step-2"> <a href="#2-crea-el-modelo-de-datos">2. Crea el modelo de datos</a></label>
  </li>

  <li class="index-group-heading">Geolocalización
    <ul>
      <li>
          <label><input type="checkbox" aria-hidden="true" data-step="step-3"> <a href="#3-crea-el-servicio-de-geolocalizacion">3. Crea el servicio de geolocalización</a></label>
      </li>
      <li>
          <label><input type="checkbox" aria-hidden="true" data-step="step-4"> <a href="#4-implementa-la-logica-de-geolocalizacion">4. Implementa la lógica de geolocalización</a></label>
      </li>
      <li>
          <label><input type="checkbox" aria-hidden="true" data-step="step-5"> <a href="#5-completa-la-implementacion-de-los-metodos-de-geolocalizacion">5. Completa la implementación de los métodos de geolocalización</a></label>
      </li>
    </ul>
  </li>

  <li class="index-group-heading">Persistencia / Storage
    <ul>
      <li>
          <label><input type="checkbox" aria-hidden="true" data-step="step-6"> <a href="#6-crea-el-servicio-de-almacenamiento">6. Crea el servicio de almacenamiento</a></label>
      </li>
      <li>
          <label><input type="checkbox" aria-hidden="true" data-step="step-7"> <a href="#7-implementa-los-metodos-del-servicio-de-almacenamiento">7. Implementa los métodos del servicio de almacenamiento</a></label>
      </li>
    </ul>
  </li>

  <li class="index-group-heading">Actualizar HomePage
    <ul>
      <li>
          <label><input type="checkbox" aria-hidden="true" data-step="step-8"> <a href="#8-actualiza-el-componente-homepage">8. Actualiza el componente HomePage</a></label>
      </li>
      <li>
          <label><input type="checkbox" aria-hidden="true" data-step="step-9"> <a href="#9-actualiza-las-variables-del-componente-homepage">9. Actualiza las variables del componente HomePage</a></label>
      </li>
      <li>
          <label><input type="checkbox" aria-hidden="true" data-step="step-10"> <a href="#10-actualiza-los-metodos-existentes-del-homepage">10. Actualiza los métodos existentes del HomePage</a></label>
      </li>
      <li>
          <label><input type="checkbox" aria-hidden="true" data-step="step-11"> <a href="#11-agrega-los-nuevos-metodos-al-homepage">11. Agrega los nuevos métodos al HomePage</a></label>
      </li>
      <li>
          <label><input type="checkbox" aria-hidden="true" data-step="step-12"> <a href="#12-agrega-metodos-utilitarios-al-homepage">12. Agrega métodos utilitarios al HomePage</a></label>
      </li>
    </ul>
  </li>

  <li>
  <label><input type="checkbox" aria-hidden="true" data-step="step-13"> <a href="#13-actualiza-la-interfaz-html">13. Actualiza la interfaz HTML</a></label>
  </li>
  <li>
  <label><input type="checkbox" aria-hidden="true" data-step="step-14"> <a href="#14-agrega-la-seccion-de-lista-de-registros-al-html">14. Agrega la sección de lista de registros al HTML</a></label>
  </li>
  <li>
  <label><input type="checkbox" aria-hidden="true" data-step="step-15"> <a href="#15-actualiza-los-estilos">15. Actualiza los estilos</a></label>
  </li>
  <li>
  <label><input type="checkbox" aria-hidden="true" data-step="step-16"> <a href="#16-configura-permisos-para-android">16. Configura permisos para Android</a></label>
  </li>
  <li>
  <label><input type="checkbox" aria-hidden="true" data-step="step-17"> <a href="#17-prueba-la-aplicacion">17. Prueba la aplicación</a></label>
  </li>
</ul>
</nav>


---

## Prerrequisitos
- Haber completado las **Parte 1** y **Parte 2**
- Tener funcionando:
  - Captura de fotos con cámara
  - Vista previa de imágenes
  - Formulario con descripción

---

<a id="1-instala-los-plugins-necesarios"></a>
## 1. Instala los plugins necesarios

Abre una terminal y ejecuta:

<div class="code-toolbar terminal">
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

<a id="2-crea-el-modelo-de-datos"></a>
## 2. Crea el modelo de datos

### Por qué lo hacemos
Entender y definir el modelo de datos antes de implementar servicios y UI evita errores de integración. Al tener una interfaz clara (GeoPhotoRecord y Coordinates) sabes qué guardar, cómo formatearlo y qué mostrar en la lista.

### Ejemplo de JSON de un registro
Para que veas un ejemplo realista del objeto que guardaremos en `@capacitor/preferences`:

```json
{
  "id": "record_1690000000000_ab12cd34",
  "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "description": "Atardecer en la playa",
  "coordinates": { "latitude": -33.4489, "longitude": -70.6693 },
  "date": "2025-08-28 21:15:03"
}
```


### a) Genera el archivo del modelo usando Ionic CLI

Abre la terminal y ejecuta:

<div class="code-toolbar terminal">
  <button onclick="copyCode(this)">Copiar</button>

```bash
npx ionic generate interface models/geo-photo.model
```
</div>

Esto creará el archivo `src/app/models/geo-photo.model.ts` directamente con el nombre correcto.

### b) Agrega la interfaz para el registro completo

Abre el archivo `src/app/models/geo-photo.model.ts` y reemplaza el contenido generado por (importando `Coordinates` desde su archivo):

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
import { Coordinates } from './coordinates.model';

export interface GeoPhotoRecord {
  id: string;
  photo: string;           // Base64 o ruta de la imagen
  description: string;     // Descripción del usuario
  coordinates?: Coordinates; // Coordenadas (latitude, longitude)
  date: string;            // Fecha y hora de creación
}
```
</div>

### c) Crea la interfaz para coordenadas en su propio archivo

Es preferible mantener `Coordinates` en un archivo separado. Genera un nuevo archivo de interfaz y agrégalo en `src/app/models/coordinates.model.ts`:

<div class="code-toolbar terminal">
  <button onclick="copyCode(this)">Copiar</button>

```bash
npx ionic generate interface models/coordinates.model
```
</div>

Y reemplaza su contenido por:

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

<a id="3-crea-el-servicio-de-geolocalizacion"></a>
## 3. Crea el servicio de geolocalización

### a) Genera el servicio usando Ionic CLI

Abre la terminal y ejecuta:

<div class="code-toolbar terminal">
  <button onclick="copyCode(this)">Copiar</button>

```bash
npx ionic generate service service/geolocation.service
```
</div>

Esto creará el archivo `src/app/service/geolocation.service.ts` directamente con el nombre correcto.

### Comprobaciones rápidas / debugging
- Si el `npx ionic generate service` no crea el archivo en `src/app/service`, revisa que estés en la carpeta raíz del proyecto y repite el comando.
- Si durante importaciones recibes "module not found", verifica la ruta exacta (usamos `src/app/service/` en este tutorial) y que el archivo `.ts` existe.

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


<div class="mini-reto">

## Mini Reto: Geolocalización

<div class="reto-meta">
El servicio <code>GeolocationService</code> debe exponer <code>getCurrentPosition(): Promise&lt;Coordinates | null&gt;</code> y manejo de permisos.</div>

- Comprueba:
  - [ ] Archivo `src/app/service/geolocation.service.ts` creado
  - [ ] `getCurrentPosition()` devuelve `{ latitude, longitude }` o `null` en fallos

Reto: Implementa <code>getCurrentPosition()</code> y <code>checkPermissions()</code> con manejo de errores y timeout.

### Comprueba rápido: Geolocalización

- Abre la consola con F12 (devtools) y ejecuta (si estás en web):
  - `await Geolocation.getCurrentPosition()` — espera recibir un objeto con `coords.latitude` y `coords.longitude` o un error si los permisos no están concedidos.
  - En Android, comprueba que al primer uso se solicita permiso; si no, revisa `AndroidManifest.xml`.

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

<a id="4-implementa-la-logica-de-geolocalizacion"></a>
## 4. Implementa la lógica de geolocalización

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

Pequeño paso (micro-snippet): crea solo la firma y un return temporal para compilar y probar.

```typescript
async getCurrentPosition(): Promise<Coordinates | null> {
  // TODO: implementar; por ahora devuelve null para evitar errores en compilación
  return null;
}
```

Comprueba rápido:

- Compila el proyecto (`npm run build` o `ionic build`) y verifica que no hay errores de tipo por la firma del método.

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

Micro-paso: añade una versión mínima que siempre solicite permisos (útil para depurar):

```typescript
private async checkPermissions(): Promise<boolean> {
  // Versión simplificada para pruebas: siempre solicita permisos
  try {
    const req = await Geolocation.requestPermissions();
    return req.location === 'granted';
  } catch {
    return false;
  }
}
```

Comprueba rápido:

- Llama a `await this.checkPermissions()` desde un componente o la consola y comprueba que devuelve `true` o `false` según el permiso.

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

<a id="5-completa-la-implementacion-de-los-metodos-de-geolocalizacion"></a>
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

Micro-checks para storage (antes de crear todos los métodos):

- Crea y prueba `generateId()` simple:

```typescript
generateId(): string {
  return 'r_' + Date.now();
}
```

Comprueba rápido:

- En consola, ejecuta `new StorageService().generateId()` (o añade un console.log) para comprobar el formato.

---

<a id="6-crea-el-servicio-de-almacenamiento"></a>
## 6. Crea el servicio de almacenamiento

### a) Genera el servicio de almacenamiento

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```bash
npx ionic generate service service/storage.service
```
</div>

Esto creará el archivo `src/app/service/storage.service.ts` directamente con el nombre correcto.
### Comprobaciones rápidas / debugging (Storage)
- Si `Preferences.get` retorna un valor no JSON o lanza un error, asegúrate de manejar JSON.parse dentro de un try/catch (el tutorial ya incluye este manejo).
- Para comprobar que los registros se guardan: en la consola (web) ejecuta `await Preferences.get({ key: 'geo-photo-records' })` y valida que `result.value` sea un JSON parseable (o `null`/`[]`).


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


<div class="mini-reto">

## Mini reto: Persistencia y almacenamiento

<div class="reto-meta">El servicio <code>StorageService</code> debe exponer <code>saveRecord(record: GeoPhotoRecord): Promise&lt;void&gt;</code>, <code>getAllRecords(): Promise&lt;GeoPhotoRecord[]&gt;</code>, <code>deleteRecord(id: string): Promise&lt;void&gt;</code> y <code>generateId(): string</code>.</div>

- Comprueba:
  - [ ] `StorageService.generateId()` existe y devuelve un string
  - [ ] `saveRecord` persiste un array JSON en `@capacitor/preferences`

Reto: Implementa `saveRecord`, `getAllRecords` y `deleteRecord` con manejo de JSON corrupto y fallback.

### Comprueba rápido: Persistencia

- En la consola de devtools (web) ejecuta:
  - `await Preferences.get({ key: 'geo-photo-records' })` — deberías obtener `{ value: '[]' }` inicialmente o el JSON almacenado.
  - Alternativa: en la app, guarda un registro y luego llama a `this.storageService.getAllRecords()` desde la consola (o añade un console.log) para comprobar que aparece el registro.

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

<a id="7-implementa-los-metodos-del-servicio-de-almacenamiento"></a>
## 7. Implementa los métodos del servicio de almacenamiento

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

Micro-paso: implementa `getAllRecords()` básica que retorna array vacío para pruebas iniciales:

```typescript
async getAllRecords(): Promise<GeoPhotoRecord[]> {
  return [];
}
```

Comprueba rápido:

- Llama a `await storageService.getAllRecords()` desde la consola o añade un console.log en `ngOnInit` de `HomePage` para confirmar que retorna un array.

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

Mini-check:

- Llama a `storageService.generateId()` y confirma que devuelve una cadena con `record_` y un sufijo único.

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

<a id="8-actualiza-el-componente-homepage"></a>
## 8. Actualiza el componente HomePage

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

Micro-paso HomePage: prueba `tomarFoto()` y `guardarRegistro()` por separado.

Comprueba rápido:

- Llama manualmente a `await homePage.tomarFoto()` desde la consola y comprueba que `this.foto` se actualiza cuando se toma la foto.
- Llama a `await homePage.guardarRegistro()` tras rellenar `descripcion` y una `foto` de prueba; comprueba que `storageService.saveRecord` es llamado (usa console.log temporal).

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

<a id="9-actualiza-las-variables-del-componente-homepage"></a>
## 9. Actualiza las variables del componente HomePage

### a) Agrega nuevas variables después de las existentes

En la clase `HomePage`, declara las variables justo después de inyectar los servicios para mantener el código organizado y fácil de leer. Más abajo hay un ejemplo de las variables que necesitarás; ubícalas junto a la inyección de servicios.

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

<!-- Variables del componente: agrégalas aquí, justo después de inyectar los servicios, cerca de su primer uso -->
<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
// ...en la clase HomePage (dentro del scope de la clase)
foto: string = "";
descripcion: string = "";
coordenadas: Coordinates | null = null;
registros: GeoPhotoRecord[] = [];
cargandoUbicacion: boolean = false;
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

<a id="10-actualiza-los-metodos-existentes-del-homepage"></a>
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

<a id="11-agrega-los-nuevos-metodos-al-homepage"></a>
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

<a id="12-agrega-metodos-utilitarios-al-homepage"></a>
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

```typescript

get formularioValido(): boolean {
  return !!(this.foto && this.descripcion);
}
```
</div>

---

<a id="13-actualiza-la-interfaz-html"></a>
## 13. Actualiza la interfaz HTML

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

<a id="14-agrega-la-seccion-de-lista-de-registros-al-html"></a>
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

<a id="15-actualiza-los-estilos"></a>
## 15. Actualiza los estilos

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

<a id="16-configura-permisos-para-android"></a>
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

<a id="17-prueba-la-aplicacion"></a>
## 17. Prueba la aplicación

### a) Prueba en el navegador

Ejecuta el comando:

<div class="code-toolbar terminal">
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

<div class="code-toolbar terminal">
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


## Archivos relacionados

Al completar este tutorial, habrás trabajado con estos archivos:

- `src/app/models/geo-photo.model.ts`: Modelos de datos y interfaces
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
