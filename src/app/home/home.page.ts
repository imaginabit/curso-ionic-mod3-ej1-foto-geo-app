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
  constructor() { }
}
