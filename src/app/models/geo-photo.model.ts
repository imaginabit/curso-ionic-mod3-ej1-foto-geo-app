import { Coordinates } from './coordinates.model';

export interface GeoPhotoRecord {
  id: string;
  photo: string;           // Base64 o ruta de la imagen
  description: string;     // Descripción del usuario
  coordinates?: Coordinates; // Coordenadas (latitude, longitude)
  date: string;            // Fecha y hora de creación
}
