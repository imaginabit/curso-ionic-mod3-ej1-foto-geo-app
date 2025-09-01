Preamble

Tarea: generar un prompt reutilizable que permita a cualquier IA, dado uno o varios archivos de código, crear un tutorial en Markdown con la misma calidad, estructura y cuidado pedagógico que este repositorio (Parte 3 — Foto-Geo). El prompt debe ser claro, exigir verificaciones, y producir un MD listo para preview y export a HTML.

Plan breve
- Proveer un prompt que reciba: lista de archivos o carpeta raíz, lenguaje principal y objetivos pedagógicos.
- Definir la estructura esperada del tutorial y reglas de estilo (índice, anclas, copy buttons, mini-retos, ejemplos JSON, contratos, comprobaciones rápidas, accesibilidad, estilos de terminal solo para bash).
- Incluir pasos de validación y "quality gates" que la IA debe ejecutar antes de entregar el MD.

Checklist (lo que debe generar el prompt)
- [ ] Entrada: especificar archivos/folder y lenguaje principal.
- [ ] Salida: un archivo Markdown estructurado (título, objetivo, índice navegable, pasos con snippets, mini-retos, ejemplos, comprobaciones rápidas, notas de debugging).
- [ ] Añadir anclas HTML explícitas antes de encabezados principales para asegurar enlaces #hash válidos en HTML.
- [ ] Incluir fragmento JS para botones "Copiar" con fallback y accesibilidad (aria-label, type).
- [ ] Incluir CSS/nota para aplicar fondo oscuro únicamente a <pre>/<code> dentro de wrappers terminal.
- [ ] Añadir mini-contratos (inputs/outputs/errores) antes de cada método crítico mostrado.
- [ ] Incluir al menos un ejemplo JSON realista del objeto que se guarda (registro).
- [ ] Añadir comprobaciones rápidas (comandos/console logs) y acciones de debugging para fallos comunes.
- [ ] Marcar y estandarizar rutas de servicios como `src/app/services/...` y advertir sobre incoherencias.
- [ ] Generar tests o pasos de verificación (build, lint, run) y una pequeña "quality gates" lista.

Prompt plantilla (para dar a la IA que generará el tutorial)

-- INICIO DEL PROMPT --
Eres una IA especializada en generar tutoriales técnicos claros y reproducibles.
Entrada (JSON):
{
  "projectRoot": "<ruta/absoluta/o-relativa-al-proyecto>",
  "files": ["src/app/home/home.page.ts", "src/app/services/storage.service.ts", ...],
  "language": "typescript",                // lenguaje primario
  "goal": "Explicar cómo añadir geolocalización y persistencia en la app Foto-Geo",
  "audience": "desarrolladores con conocimientos básicos de Ionic/Angular",
  "outputFile": "tutorial-parte-3-geo-persistencia.md"
}

Requisitos para la salida (Markdown):
1) Encabezado y metadatos: título, objetivo breve (1-2 líneas), prerequisitos.
2) Índice navegable: un <nav> con lista y enlaces a secciones; cada item debe incluir un checkbox HTML con attribute data-step="step-N".
   - Antes de cada sección principal (## X. ...) agrega un ancla HTML explícita: <a id="{slug}"></a>
3) Contenido por paso: para cada cambio en el código producir:
   - Breve "Por qué lo hacemos" (1-2 frases).
   - Mini-contrato (inputs/outputs/errores) antes de snippets que definen métodos o APIs.
   - Snippet de código dentro de ```language fences```. Para bloques que representen comandos de terminal usa ```bash y envuelve en <div class="code-toolbar terminal"> con un botón: <button onclick="copyCode(this)">Copiar</button> seguido del fence.
   - Incluir un pequeño "Comprueba rápido" con 1-2 comandos o expectativas en consola.
   - Incluir un mini-reto o ejercicio práctico destacado en un div.mini-reto.
4) Copiar UI y accesibilidad:
   - Incluir al inicio (o al final) un <script> con la función copyCode(btn) que usa navigator.clipboard con fallback a textarea + document.execCommand; registrar aria-label y type="button" para los botones.
   - Añadir nota de compatibilidad y accesibilidad.
5) Estilos:
   - Incluir un bloque <style> que defina .mini-reto, .tutorial-index, .admonition y que aplique el fondo oscuro sólo a .code-toolbar.terminal pre, .code-toolbar.terminal code (no al wrapper completo).
6) Persistencia del índice:
   - Añadir script que use localStorage con una clave derivada del nombre del archivo (por ejemplo: tutorial-<slug>-progress) para guardar checkboxes con data-step.

8) Ejemplo JSON de registro y estructura de datos: incluye al menos un ejemplo realista.
9) Quality gates (al final):
   - Build: indica comando para compilar (por ejemplo `npm run build` o `ionic build`) y qué buscar.
   - Lint/Typecheck: sugiere `npm run lint` o `tsc --noEmit` si aplica.
   - Tests: sugiere 1-2 pruebas mínimas (por ejemplo, guardar y recuperar un registro usando el servicio) y cómo ejecutarlas.
10) Entrega:
   - Escribe el archivo Markdown solicitado en la ruta indicada y además devuelve un breve resumen de cambios realizados frente al código fuente.

Reglas adicionales de estilo y seguridad:
- No inventes APIs; si falta información sobre funciones o nombrado, genera un bloque "Asunción" donde expliques la decisión tomada.
- Mantén ejemplos funcionales y probables en un proyecto Ionic+Angular (Paths, imports, nombres de servicios).
- Evita mostrar bloques largos >200 líneas; divide en micro-snippets si es necesario.

Criterios de evaluación (qué comprobar antes de terminar):
- Existe <nav> con checkboxes y data-step en la salida.
- Cada enlace del índice apunta a un ancla existente en el documento.
- Los bloques de comando que tienen `terminal` están marcados con ```bash y el CSS los pinta como terminal SOLO dentro de pre/code.
- El script copyCode está presente y es accesible.
- La clave de localStorage es única y derivable del nombre del tutorial.

Formato de entrega final:
- Entrega un único string que sea el contenido del Markdown.
- Opcional: lista de archivos que la IA leyó para generar el tutorial (si aplicó cambios, describirlos).

-- FIN DEL PROMPT --

Notas finales y uso
- Usa este prompt pegándolo en la UI de la IA objetivo. Provee la lista de archivos relevantes o la carpeta raíz.


