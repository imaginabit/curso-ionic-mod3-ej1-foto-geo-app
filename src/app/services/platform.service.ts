// src/app/services/platform.service.ts
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  constructor(private platform: Platform) {}

  isNativePlatform(): boolean {
    return this.platform.is('hybrid');
  }
}
