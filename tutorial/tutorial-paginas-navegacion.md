<script>
function copyCode(btn) {
  const codeBlock = btn.nextElementSibling;
  navigator.clipboard.writeText(codeBlock.innerText);
  btn.textContent = 'Copiado!';
  setTimeout(() => btn.textContent = 'Copiar', 2000);
}
</script>
<script>
// Mejor versión del copyCode con fallback y accesibilidad
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

# Tutorial: Creación de páginas y navegación en Ionic CLI

## Creación de páginas y navegación

El primer paso en el desarrollo de cualquier app es definir sus pantallas principales. En Ionic 7, cada pantalla se denomina página, y se puede crear fácilmente desde la terminal con el siguiente comando:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```bash
ionic generate page nombre-de-la-pagina
```
</div>

Este comando generará una carpeta con los archivos necesarios (.ts, .html, .scss, .spec.ts) para la nueva página. Por ejemplo, si queremos una página llamada "Perfil", ejecutamos:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```bash
ionic generate page perfil
```

</div>

Una vez creada, debemos configurar la navegación. Ionic utiliza el sistema de enrutamiento basado en rutas, similar al de otros frameworks. Para agregar nuestra nueva página a la navegación, editamos el archivo app-routing.module.ts:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>

```typescript
const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioPage },
  { path: 'perfil', component: PerfilPage },
];
```
</div>

Con esto, podemos navegar a la nueva página usando el componente ion-router-link:

<div class="code-toolbar">
  <button onclick="copyCode(this)">Copiar</button>
  
```html
<ion-button routerLink="/perfil">Ir a Perfil</ion-button>
```
</div>

Este sistema hace que la navegación sea fluida, reactiva y fácil de mantener.

## Consejos adicionales

- Asegúrate de importar los componentes de las páginas en el módulo de rutas.
- Usa `routerLink` para navegación declarativa en plantillas.
- Para navegación programática, utiliza `this.router.navigate(['/ruta']);` en el componente TypeScript.

¡Con estos pasos, puedes empezar a construir la estructura de navegación de tu app Ionic!

---

## Mini reto: Páginas y navegación

- Dado: Las páginas creadas deben declararse en las rutas y exportar el componente principal.
- Comprueba:
  - [ ] Ejecuta `ionic generate page perfil` y verifica que la carpeta se creó
  - [ ] La ruta `/perfil` carga la página sin errores en la consola
- Reto: Añade un botón en la página de inicio que navegue a `/perfil` y muestre un mensaje con `ion-toast`.


