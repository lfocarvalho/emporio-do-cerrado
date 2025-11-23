import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-home-debug',
  template: `
    <ion-header>
      <ion-toolbar color="dark">
        <ion-title>Debug Home</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p>Se você está vendo esta tela, o roteamento e o outlet estão OK.</p>
      <p>Próximo passo: voltar a apontar para a Home verdadeira e investigar o que quebra.</p>
    </ion-content>
  `,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomeDebugPage {}
