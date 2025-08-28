# Tutorial: Creación del modelo Registro

## Paso 1: Crear el modelo `Registro`

Crea el archivo `src/app/models/registro.ts` y define la interfaz `Registro`:

```typescript
export interface Registro {
  id?: number;        // autoincremental, lo asignará la base de datos
  foto: string;       // ruta o base64 de la foto
  descripcion: string;// texto descriptivo de la foto
  lat: number;        // latitud donde se tomó la foto
  lng: number;        // longitud donde se tomó la foto
  fecha: number;      // timestamp en milisegundos
}
```

### Generación del archivo usando Ionic CLI

También podemos crear el archivo automáticamente utilizando el comando de Ionic CLI. Por ejemplo, puedes ejecutar el siguiente comando en la terminal:

```bash
ionic generate interface model/registro
```

Este comando generará la estructura base del archivo en la ubicación correspondiente, que luego podrás editar para incluir la definición de la interfaz `Registro` y cualquier otro detalle que necesites.

## ¿Cómo lo vamos a usar?

- **Almacenar registros:** Cada vez que el usuario tome una foto, crearemos un objeto `Registro` con la información de la imagen, la ubicación y la fecha.
- **Guardar en base de datos:** Usaremos este modelo para guardar los registros en una base de datos local (por ejemplo, SQLite o Storage).
- **Mostrar en la app:** Cuando queramos mostrar la lista de fotos tomadas, recuperaremos los objetos `Registro` y los usaremos para mostrar la imagen, la descripción y la ubicación en la interfaz.

## ¿Qué es una interfaz?

En TypeScript, una interfaz es una definición de un contrato que especifica la estructura de un objeto. Indica qué propiedades y métodos debe tener un objeto, sin proveer una implementación concreta. Esto nos permite definir la forma de los datos y asegurar que las variables que se ajusten a dicha interfaz cumplan con la estructura esperada.

## Ejemplo de uso: creando una variable de tipo Registro

Para usar la interfaz `Registro`, simplemente importamos la interfaz y creamos una variable que se ajuste a esa estructura. Por ejemplo:

```typescript
import { Registro } from './models/registro';

// Creamos un registro de ejemplo
const registroEjemplo: Registro = {
  foto: 'ruta/a/la/foto.jpg',
  descripcion: 'Una descripción de la foto',
  lat: 40.12345,
  lng: -3.67890,
  fecha: Date.now()
};

console.log(registroEjemplo);
```

En este ejemplo, `registroEjemplo` es una variable de tipo `Registro`, y al asignarle un objeto que cumple con la estructura definida en la interfaz, TypeScript nos ayuda a prevenir errores de tipado durante el desarrollo.

## Diferencias entre `interface` y `class`

- Una `interface` define la forma o contrato de un objeto, especificando qué propiedades y métodos debe tener, pero no provee ninguna implementación. Es útil para definir estructuras de datos y asegurar el tipado en tiempo de compilación.

- Una `class` es una plantilla para crear objetos. Además de definir sus propiedades y métodos, puede contener lógica interna, constructores y herencia. Permite crear instancias y manipular el estado interno de un objeto.

### ¿Por qué no usamos `class` en este caso?

En nuestro ejemplo, solo necesitamos definir la estructura de los datos que van a representar el registro de una foto. No es necesario incluir lógica, métodos o comportamientos adicionales, por lo que una `interface` es la opción ideal. Usando una `interface` mantenemos el código simple y centrado en la definición de la forma del objeto, sin la sobrecarga que implicaría una `class`.

## Versión con `class` y métodos de conversión

También podemos definir el modelo usando una clase. Esto nos permite incluir métodos que transformen los datos, por ejemplo, convertir el timestamp a una fecha con el formato de España y transformar las coordenadas de números a grados, minutos y segundos.

```typescript
export class Registro2 {
  id?: number;        // autoincremental
  foto: string;
  descripcion: string;
  lat: number;
  lng: number;
  fecha: number;      // timestamp en milisegundos

  constructor(foto: string, descripcion: string, lat: number, lng: number, fecha: number, id?: number) {
    this.foto = foto;
    this.descripcion = descripcion;
    this.lat = lat;
    this.lng = lng;
    this.fecha = fecha;
    if (id) this.id = id;
  }

  // Método para convertir el timestamp a fecha en formato de España (dd/mm/yyyy)
  getFechaFormatoEspanol(): string {
    const date = new Date(this.fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  // Método privado para convertir una coordenada a grados, minutos y segundos
  private convertToDMS(coordenada: number): { grados: number; minutos: number; segundos: number } {
    const grados = Math.floor(coordenada);
    const fraccion = Math.abs(coordenada - grados);
    const totalMinutos = fraccion * 60;
    const minutos = Math.floor(totalMinutos);
    const segundos = +((totalMinutos - minutos) * 60).toFixed(2);
    return { grados, minutos, segundos };
  }

  // Método para obtener la latitud en formato DMS
  getLatDMS(): string {
    const { grados, minutos, segundos } = this.convertToDMS(this.lat);
    return `${grados}° ${minutos}' ${segundos}''`;
  }

  // Método para obtener la longitud en formato DMS
  getLngDMS(): string {
    const { grados, minutos, segundos } = this.convertToDMS(this.lng);
    return `${grados}° ${minutos}' ${segundos}''`;
  }
}
```

Este enfoque con clase nos permite encapsular comportamiento en el modelo, facilitando la transformación y presentación de los datos.

## Resumen

El modelo `Registro` es fundamental porque define la estructura de los datos que manejará nuestra app. Así, aseguramos que todos los registros tengan la misma información y sea fácil manipularlos en las siguientes partes del desarrollo.
