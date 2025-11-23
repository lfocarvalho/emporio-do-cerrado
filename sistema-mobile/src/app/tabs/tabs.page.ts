import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, pricetagsOutline, cartOutline, heartOutline, personOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet, RouterLink],
})
export class TabsPage {
  constructor() {
    // Registrar ícones com nomes kebab-case padrão
    addIcons({ 'home-outline': homeOutline, 'pricetags-outline': pricetagsOutline, 'cart-outline': cartOutline, 'heart-outline': heartOutline, 'person-outline': personOutline });
  }
}
