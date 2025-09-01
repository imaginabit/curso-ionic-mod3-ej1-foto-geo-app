import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { GeoPhotoRecord } from '../models/geo-photo.model';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly RECORDS_KEY = 'geo-photo-records';

  constructor() {}

  async saveRecord(record: GeoPhotoRecord): Promise<void> {
    try {
      const records = await this.getAllRecords();
      records.push(record);

      await Preferences.set({
        key: this.RECORDS_KEY,
        value: JSON.stringify(records),
      });
    } catch (error) {
      console.error('Error guardando registro:', error);
      throw error;
    }
  }

  async getAllRecords(): Promise<GeoPhotoRecord[]> {
    try {
      const result = await Preferences.get({ key: this.RECORDS_KEY });
      return result.value ? JSON.parse(result.value) : [];
    } catch (error) {
      console.error('Error obteniendo registros:', error);
      return [];
    }
  }

  async deleteRecord(id: string): Promise<void> {
    try {
      const records = await this.getAllRecords();
      const filteredRecords = records.filter((record) => record.id !== id);

      await Preferences.set({
        key: this.RECORDS_KEY,
        value: JSON.stringify(filteredRecords),
      });
    } catch (error) {
      console.error('Error eliminando registro:', error);
      throw error;
    }
  }

  generateId(): string {
    return (
      'record_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }
}
