import { CommonModule } from '@angular/common'; 
import { Component, OnInit } from '@angular/core'; 
import { FormsModule } from '@angular/forms';

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

  constructor() { }

  // Método que implementaremos en Parte 2 
  async tomarFoto() { 
    console.log('Función tomarFoto'); 
    // Por ahora simular una foto 
    this.foto = 'https://picsum.photos/300/200?random=' + Math.random(); 
    console.log('foto', this.foto);
  }

  async guardarRegistro() { 
    console.log('Función guardarRegistro');
  } 


}
