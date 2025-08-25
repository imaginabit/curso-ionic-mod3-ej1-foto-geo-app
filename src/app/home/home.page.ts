import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PhotoService } from '../app/services/photo.service';


import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonLabel,
  IonTextarea,
  IonImg
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
    IonImg
  ],
})
export class HomePage {
  foto: string="";
  descripcion: string="";
  private photoService = inject(PhotoService);


  constructor() { }

  // Método que implementaremos en Parte 2
  async tomarFoto() {
    console.log('Función tomarFoto');
    const photoResult = await this.photoService.takePicture();
    if (photoResult) {
      this.foto = photoResult.webviewPath;
    }
  }

  async guardarRegistro() {
    console.log('Función guardarRegistro');
  }

  eliminarFoto() {
    this.foto = '';
  }


}
