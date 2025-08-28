## Ejercicios prácticos (para el alumno)

1) Manejo de permisos denegados
- Objetivo: simular que el usuario niega permisos de ubicación y mostrar una UI amigable.
- Requisito: modifica `obtenerUbicacion()` para detectar `null` y mostrar un toast o message que explique cómo activar permisos.

2) Filtro por fecha
- Objetivo: añadir un input para filtrar la lista de registros por fecha.
- Requisito: implementar una función simple que filtre `registros` por año/mes y actualizar la vista.

3) Optimización del almacenamiento
- Objetivo: almacenar una versión reducida (thumbnail) de la imagen además del webviewPath.
- Requisito: modifica `PhotoService` para generar un thumbnail (canvas) y guarda `thumbnail` en el objeto `GeoPhotoRecord`.

Mini-quiz rápido (ver/verdadero)

- V/F: `Preferences` es apropiado para miles de registros en producción. (F)
- V/F: `Geolocation.getCurrentPosition()` puede tardar más si el GPS está frío. (V)
- V/F: Siempre debes validar `JSON.parse` porque puede fallar. (V)
- V/F: El botón copiar en markdown siempre funciona en todos los renderizadores. (F)

---

## Depuración y casos reales

- Permisos denegados: comprobar logs del dispositivo y probar eliminar la app y reinstalar para forzar prompt.
- JSON corrupto en Preferences: abrir la consola del navegador y ejecutar `await Preferences.get({ key: 'geo-photo-records' })` para inspeccionar; en Android usar `adb shell` y revisar el almacenamiento de app.
- Fotos que no cargan: revisar `webviewPath` y probar con `console.log(photoResult)` después de `takePicture()`.
- Fallos intermitentes: añadir `try/catch` con `console.error` y mostrar mensajes amigables en la UI.

---

## Guía del instructor (resumen rápido)

- Tiempo estimado: 45-60 minutos (explicación + práctica)
- Objetivos mínimos:
  - Implementar geolocalización y persistencia básica
  - Entender permisos y errores comunes
  - Mostrar la lista de registros y eliminar elementos
- Puntos de discusión:
  - ¿Por qué usar `Preferences` vs SQLite?
  - Manejo de permisos en Android 11+ (background location)
  - Tradeoffs entre almacenar base64 vs rutas de archivo
- Demostración sugerida: 10 minutos en dispositivo real mostrando permiso y guardado
- Pruebas rápidas para clase: pedir a los alumnos que implementen el ejercicio 1 y lo expliquen en 5 minutos.
