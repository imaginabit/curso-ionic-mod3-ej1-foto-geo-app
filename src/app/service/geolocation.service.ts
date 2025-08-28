import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Coordinates } from '../models/coordinates.model';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

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


  formatCoordinates(lat: number, lng: number): string {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }

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

}
