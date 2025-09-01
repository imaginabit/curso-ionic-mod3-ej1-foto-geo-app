# Tutorial Paso a Paso: Foto-Geo App (Parte 4) — Migración a SQLite

## Objetivo
Migrar la persistencia de registros (actualmente en `localStorage` o en servicios simples) a una base de datos SQLite usando el plugin de Capacitor, y proveer un servicio `StorageSqlService` con CRUD, migración de datos y ejemplos de integración en `HomePage`.
## Archivos relacionados 

- `src/app/services/storage-sql.service.ts` — Servicio SQLite
- `src/app/models/geo-photo.model.ts` — Modelo extendido
- `src/app/home/home.page.ts` — Integración y UI
<script>
// copyCode mejorado con fallback y accesibilidad (misma lógica que en tutoriales anteriores)
function copyCode(btn) {
  const codeBlock = btn.nextElementSibling;
  const text = codeBlock ? codeBlock.innerText : '';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = 'Copiado!';
      setTimeout(() => btn.textContent = 'Copiar', 2000);
    }).catch(() => fallbackCopy(text, btn));
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

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('button[onclick^="copyCode"]').forEach(btn => {
    if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', 'Copiar código');
    btn.setAttribute('type', 'button');
  });
});
</script>

<style>
.mini-reto {
  border-left: 4px solid #2b8aef;
  border-radius: 6px;
  padding: 10px 12px;
  background: #f8fbff;
}
.tutorial-index {
  background: #ffffff;
  margin: 12px 0 18px 0;
  padding: 8px;
}
.tutorial-index .index-item { display: block; padding: 6px 0; }
.admonition { border-left: 4px solid #6c757d; border-radius: 6px; padding: 8px; }
.admonition--note { border-left-color: #2b8aef; }
.code-toolbar.terminal pre,
.code-toolbar.terminal code {
  background: #0f1720;
  color: #e6eef8;
  overflow: auto;
}
.code-toolbar.terminal .copy-btn { position: absolute; top: 8px; right: 8px; }
</style>

<script>
// Persistencia del índice del tutorial
const TUTORIAL_INDEX_KEY = 'tutorial-parte-4-migracion-sqlite-progress';

function initTutorialIndex() {
  try {
    const raw = localStorage.getItem(TUTORIAL_INDEX_KEY);
    const state = raw ? JSON.parse(raw) : {};
    document.querySelectorAll('.tutorial-index input[data-step]').forEach(cb => {
      const id = cb.getAttribute('data-step');
      if (state[id]) cb.checked = true;
      cb.addEventListener('change', (e) => saveIndexState(cb));
    });
  } catch (err) {
    // ignore
  }
}

function saveIndexState(cb) {
  try {
    const nodes = document.querySelectorAll('.tutorial-index input[data-step]');
    const state = {};
    nodes.forEach(n => { state[n.getAttribute('data-step')] = n.checked; });
    localStorage.setItem(TUTORIAL_INDEX_KEY, JSON.stringify(state));
  } catch (err) { /* ignore */ }
}

document.addEventListener('DOMContentLoaded', initTutorialIndex);
</script>

# Tutorial Paso a Paso: Foto-Geo App (Parte 4) — Migración a SQLite

## Objetivo
Migrar la persistencia de registros (actualmente en `localStorage` o en servicios simples) a una base de datos SQLite usando el plugin de Capacitor, y proveer un servicio `StorageSqlService` con CRUD, migración de datos y ejemplos de integración en `HomePage`.

---

## Resumen rápido
- Instalaremos el plugin SQLite para Capacitor.
- Crearemos la tabla y el contrato SQL.
- Implementaremos `StorageSqlService` con métodos `saveRecord`, `getAll`, `delete`, y `migrateFromLocalStorage`.
- Actualizaremos `HomePage` para usar SQLite y añadiremos comprobaciones y tests básicos.

---

## Índice
Marca los pasos a medida que los completes:

<nav class="tutorial-index" role="navigation" aria-label="Índice del tutorial">
  <ul class="index-list">
    <li class="index-item"><label><input type="checkbox" data-step="step-1"> <a href="#1-instalar-plugins">1. Instalar plugins</a></label></li>
    <li class="index-item"><label><input type="checkbox" data-step="step-2"> <a href="#2-modelo-contrato-sql">2. Modelo de datos y contrato SQL</a></label></li>
    <li class="index-item"><label><input type="checkbox" data-step="step-3"> <a href="#3-generar-servicio">3. Generar servicio `StorageSqlService`</a></label></li>
    <li class="index-item"><label><input type="checkbox" data-step="step-4"> <a href="#4-implementacion-crud">4. Implementación: inicialización y CRUD</a></label></li>
    <li class="index-item"><label><input type="checkbox" data-step="step-5"> <a href="#5-migracion-localstorage">5. Migración desde `localStorage`</a></label></li>
    <li class="index-item"><label><input type="checkbox" data-step="step-6"> <a href="#6-integracion-homepage">6. Integración en `HomePage`</a></label></li>
    <li class="index-item"><label><input type="checkbox" data-step="step-7"> <a href="#7-pruebas-verificacion">7. Pruebas y verificación</a></label></li>
    <li class="index-item"><label><input type="checkbox" data-step="step-8"> <a href="#8-notas-practicas">8. Notas y buenas prácticas</a></label></li>
  </ul>
</nav>

---

## 1. Instalar plugins

Abre una terminal y ejecuta:

<div class="code-toolbar terminal">
  <button onclick="copyCode(this)">Copiar</button>

```bash
npm install @capacitor-community/sqlite
npx cap sync
```
</div>

Explicación:
- `@capacitor-community/sqlite` es el plugin que nos da acceso a SQLite en plataformas móviles y en entornos web mediante el driver correspondiente.
- `npx cap sync` sincroniza los plugins con los proyectos nativos.

Nota: si usas otra variante (por ejemplo `capacitor-sqlite` o un fork), adapta los import según corresponda.

---

## 2. Modelo de datos y tablas SQL

Usaremos el modelo `GeoPhotoRecord` ya definido en la Parte 3. En lugar de guardar las coordenadas como columnas planas en la misma tabla, crearemos dos tablas relacionadas: una para el registro principal (`geo_photos`) y otra para las coordenadas (`coords`). Esto permite normalizar los datos y, si en el futuro queremos guardar múltiples coordenadas por foto (por ejemplo trazas), será más sencillo.

### a) Interfaz extendida
Abre `src/app/models/geo-photo.model.ts` y verifica que el modelo represente la relación con `Coordinates` (anidado como objeto opcional):

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
import { Coordinates } from './coordinates.model';

export interface GeoPhotoRecord {
  id: string;
  date: string; // formato ISO o legible
  description?: string;
  photoPath?: string; // ruta o webviewPath
  coordinates?: Coordinates | null; // objeto opcional con latitude/longitude
}
```
</div>

### b) Crear Tablas SQL
Crearemos dos tablas: `geo_photos` para el registro principal y `coords` para las coordenadas vinculadas por `photo_id`.

SQL de ejemplo:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```sql
CREATE TABLE IF NOT EXISTS geo_photos (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  description TEXT,
  photoPath TEXT
);

CREATE TABLE IF NOT EXISTS coords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  photo_id TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  FOREIGN KEY(photo_id) REFERENCES geo_photos(id) ON DELETE CASCADE
);
```
</div>

---

## 3. Generar servicio `StorageSqlService`

Genera el servicio con Ionic CLI (o crea el archivo manualmente):

<div class="code-toolbar terminal">
  <button onclick="copyCode(this)">Copiar</button>

```bash
npx ionic generate service services/storage-sql
```
</div>

Archivo esperado: `src/app/services/storage-sql.service.ts`

En el servicio importaremos el plugin y definiremos la inicialización de la DB.

---

## 4. Implementación: inicialización y CRUD

A continuación un esqueleto con las piezas clave. Puedes copiar y adaptar los fragmentos a `src/app/services/storage-sql.service.ts`.

### a) Imports y decorador

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SQLiteConnection, capSQLiteChanges, capSQLiteResult } from '@capacitor-community/sqlite';
import { GeoPhotoRecord } from '../models/geo-photo.model';
```
</div>

### b) Contrato y métodos principales (esqueleto)

- `init()` — inicializa la conexión y crea la tabla si es necesario.
- `saveRecord(record: GeoPhotoRecord)` — inserta o actualiza un registro.
- `getAll()` — devuelve todos los registros ordenados por fecha.
- `delete(id: string)` — elimina por id.
- `migrateFromLocalStorage(key: string)` — lee `localStorage` y migra registros.

Ejemplo resumido (resalta la idea, pega en el archivo y adapta imports y tipos):

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
@Injectable({ providedIn: 'root' })
export class StorageSqlService {
  private sqlite: SQLiteConnection;
  private dbName = 'foto_geo_db';
  private dbReady = false;

  constructor() {
    this.sqlite = new SQLiteConnection(Capacitor);
  }

  async init() {
    if (this.dbReady) return;
    try {
      const db = await this.sqlite.createConnection(this.dbName, false, 'no-encryption', 1);
      await db.open();
      const createGeo = `CREATE TABLE IF NOT EXISTS geo_photos (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        description TEXT,
        photoPath TEXT
      );`;
      const createCoords = `CREATE TABLE IF NOT EXISTS coords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        photo_id TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        FOREIGN KEY(photo_id) REFERENCES geo_photos(id) ON DELETE CASCADE
      );`;
      await db.execute(createGeo);
      await db.execute(createCoords);
      await this.sqlite.closeConnection(this.dbName);
      this.dbReady = true;
    } catch (err) {
      console.error('SQLite init error', err);
      throw err;
    }
  }

  // ... saveRecord, getAll, delete, migrateFromLocalStorage ...
}
```
</div>

### c) Ejemplo de `saveRecord` y `getAll` (con transacción en dos tablas)

Mini-contrato: `saveRecord(record: GeoPhotoRecord): Promise<void>`
- Inputs: `GeoPhotoRecord` con `id`, `date`, `description?`, `photoPath?`, `coordinates?`.
- Output: Promise resuelta cuando la operación termine.
- Errores: lanza si falla la conexión a la DB o la ejecución SQL.

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
async saveRecord(record: GeoPhotoRecord): Promise<void> {
  await this.init();
  const db = await this.sqlite.createConnection(this.dbName, false, 'no-encryption', 1);
  await db.open();
  try {
    await db.execute('BEGIN;');
    const upsert = `INSERT OR REPLACE INTO geo_photos (id, date, description, photoPath) VALUES (?,?,?,?);`;
    await db.run(upsert, [record.id, record.date, record.description || null, record.photoPath || null]);
    if (record.coordinates) {
      await db.run('DELETE FROM coords WHERE photo_id = ?;', [record.id]);
      await db.run('INSERT INTO coords (photo_id, latitude, longitude) VALUES (?,?,?);', [record.id, record.coordinates.latitude, record.coordinates.longitude]);
    }
    await db.execute('COMMIT;');
  } catch (err) {
    await db.execute('ROLLBACK;');
    throw err;
  } finally {
    await this.sqlite.closeConnection(this.dbName);
  }
}

Mini-contrato: `getAll(): Promise<GeoPhotoRecord[]>`
- Inputs: ninguno.
- Output: array de `GeoPhotoRecord` con `coordinates` poblado cuando exista.
- Errores: lanza si falla la consulta.

async getAll(): Promise<GeoPhotoRecord[]> {
  await this.init();
  const db = await this.sqlite.createConnection(this.dbName, false, 'no-encryption', 1);
  await db.open();
  try {
    const res = await db.query(`SELECT p.id, p.date, p.description, p.photoPath, c.latitude, c.longitude
      FROM geo_photos p
      LEFT JOIN coords c ON c.photo_id = p.id
      ORDER BY p.date DESC;`);
    const rows = (res.values || []) as any[];
    return rows.map(r => ({
      id: r.id,
      date: r.date,
      description: r.description,
      photoPath: r.photoPath,
      coordinates: (r.latitude != null && r.longitude != null) ? { latitude: r.latitude, longitude: r.longitude } : undefined
    }));
  } finally {
    await this.sqlite.closeConnection(this.dbName);
  }
}
```
</div>

### d) `delete`

Mini-contrato: `delete(id: string): Promise<void>`
- Inputs: `id` del registro.
- Output: Promise resuelta cuando se elimine.
- Errores: lanza si falla la operación.

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
async delete(id: string): Promise<void> {
  await this.init();
  const db = await this.sqlite.createConnection(this.dbName, false, 'no-encryption', 1);
  await db.open();
  try {
    await db.execute('BEGIN;');
    // Gracias a FOREIGN KEY ... ON DELETE CASCADE, al eliminar el registro principal se eliminan coords relacionadas
    await db.run('DELETE FROM geo_photos WHERE id = ?;', [id]);
    await db.execute('COMMIT;');
  } catch (err) {
    await db.execute('ROLLBACK;');
    throw err;
  } finally {
    await this.sqlite.closeConnection(this.dbName);
  }
}
```
</div>

---

## 5. Migración desde localStorage

Si previamente almacenaste los registros en `localStorage` bajo una clave (ej: `GEO_PHOTO_RECORDS`), añade un método que lea y convierta esos objetos en registros SQLite.

Ejemplo de `migrateFromLocalStorage`:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
async migrateFromLocalStorage(storageKey = 'GEO_PHOTO_RECORDS') {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return { migrated: 0 };
  try {
    const arr: GeoPhotoRecord[] = JSON.parse(raw);
    let migrated = 0;
    for (const r of arr) {
      // validar shape y convertir tipos según sea necesario
      await this.saveRecord(r);
      migrated++;
    }
    // opcional: borrar la clave para evitar re-migración
    // localStorage.removeItem(storageKey);
    return { migrated };
  } catch (err) {
    console.error('migrate error', err);
    return { migrated: 0, error: err };
  }
}
```
</div>

Buenas prácticas para la migración:

### Ejemplo JSON realista de un registro

```json
{
  "id": "record_1690000000000_ab12cd34",
  "date": "2025-08-28T21:15:03.000Z",
  "description": "Foto tomada cerca del parque central",
  "photoPath": "blob:https://localhost/abcd-ef01",
  "coordinates": { "latitude": -33.456789, "longitude": -70.654321 }
}
```

<div class="mini-reto">
  <h3>Mini-reto: comprobar migración segura</h3>
  <p>Escribe un pequeño script (o botón en la UI) que exporte los datos de `localStorage` a un archivo JSON antes de ejecutar <code>migrateFromLocalStorage</code>. Comprueba que el número de registros migrados coincide con el número de objetos en el JSON exportado.</p>
</div>

---

## 6. Integración en `HomePage`

Cambios principales en `src/app/home/home.page.ts`:

- Importa e inyecta `StorageSqlService` en lugar del `StorageService` anterior.
- Al arrancar (`ngOnInit`) llama a `await storageSqlService.init()` y luego `getAll()` para popular `registros`.
- Al guardar un registro, usa `await storageSqlService.saveRecord(record)`.
- Al eliminar, usa `await storageSqlService.delete(id)`.

Ejemplo mínimo de uso:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
private storageSql = inject(StorageSqlService);

async ngOnInit() {
  await this.storageSql.init();
  this.registros = await this.storageSql.getAll();
}

async guardarRegistro() {
  const record: GeoPhotoRecord = {
    id: 'record_' + Date.now(),
    date: new Date().toISOString(),
    description: this.descripcion,
    photoPath: this.foto,
    latitude: this.coordenadas?.latitude ?? null,
    longitude: this.coordenadas?.longitude ?? null,
  };
  await this.storageSql.saveRecord(record);
  await this.cargarRegistros();
  this.limpiarFormulario();
}
```
</div>

---

## 7. Pruebas y verificación

- En el navegador: SQLite en web puede usar el driver `sqlite-wasm` o `IndexedDB` adaptador; revisa la documentación del plugin y configura `capacitor.config.ts` si hace falta.
- Comprobar que `getAll()` devuelve registros tras `saveRecord()`.
- Prueba la migración con datos de ejemplo:

```typescript
// en consola o temporizador
await storageSql.migrateFromLocalStorage('GEO_PHOTO_RECORDS');
```

- Verifica que los registros migrados aparecen en la UI.

---

## 8. Notas y buenas prácticas

- Mantén transacciones para operaciones múltiples si necesitas atomicidad.
- Evita abrir/cerrar la conexión a la DB en cada operación si vas a hacer muchas consultas; en su lugar, reutiliza la conexión (gestión de pool simple).
- Añade versionado de esquema y scripts de migración (ej: tabla `meta` con `schema_version`).
- Realiza backups/exportaciones antes de migraciones destructivas.

---

## Archivos relacionados 

- `src/app/services/storage-sql.service.ts` — Servicio SQLite
- `src/app/models/geo-photo.model.ts` — Modelo extendido
- `src/app/home/home.page.ts` — Integración y UI


