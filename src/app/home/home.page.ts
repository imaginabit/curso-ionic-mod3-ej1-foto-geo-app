import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PhotoService } from '../app/services/photo.service';

import { GeolocationService } from '../service/geolocation.service';
import { StorageService } from '../service/storage.service';
import { GeoPhotoRecord } from '../models/geo-photo.model';
import { Coordinates } from '../models/coordinates.model';



import {
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
} from '@ionic/angular/standalone';


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
export class HomePage implements OnInit {
  foto: string = "";
  descripcion: string = "";
  titulo: string = "Mi app foto";
  coordenadas: Coordinates | null = null;
  registros: GeoPhotoRecord[] = [];
  cargandoUbicacion: boolean = false;

  private photoService = inject(PhotoService);
  private geoService = inject(GeolocationService);
  private storageService = inject(StorageService);

  async ngOnInit() {
    await this.cargarRegistros();
  }

  constructor() { }

  async tomarFoto() {
    console.log('Función tomarFoto');
    const photoResult = await this.photoService.takePicture();
    if (photoResult) {
      this.foto = photoResult.webviewPath;
      // Obtener ubicación automáticamente al tomar foto
      await this.obtenerUbicacion();
    }
  }


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

  eliminarFoto() {
    this.foto = '';
    this.coordenadas = null;
  }


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


  async cargarRegistros() {
    try {
      this.registros = await this.storageService.getAllRecords();
      // Ordenar por fecha más reciente primero
      this.registros.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error cargando registros:', error);
    }
  }


  async eliminarRegistro(id: string) {
    try {
      await this.storageService.deleteRecord(id);
      await this.cargarRegistros();
    } catch (error) {
      console.error('Error eliminando registro:', error);
    }
  }


  private limpiarFormulario() {
    this.foto = '';
    this.descripcion = '';
    this.coordenadas = null;
  }

  get formularioValido(): boolean {
    return !!(this.foto && this.descripcion);
  }

  
get tieneUbicacion(): boolean {
  return this.coordenadas !== null;
}





}
