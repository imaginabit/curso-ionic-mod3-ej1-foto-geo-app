import { Coordinates } from "./coordinates.model";

export interface GeoPhotoRecord {
  id: string;
  photo: string;
  description: string;    // Descripción del usuario
  coordinates?: Coordinates;        // Coordenada de latitud
  date: string;          // Fecha y hora de creación
}
