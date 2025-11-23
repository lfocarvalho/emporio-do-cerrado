import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules, withRouterConfig } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { registerAppIcons } from './app/core/icons.registry';

// Registra ícones globais do Ionicons antes do bootstrap
registerAppIcons();

// [+] Inicializa o Storage antes de qualquer guard/serviço usá-lo
function initStorageFactory() {
  return async () => {
    const storage = inject(Storage);
    await storage.create();
  };
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    Storage,                                                     // provider do Storage
    { provide: APP_INITIALIZER, multi: true, useFactory: initStorageFactory }, // [+]
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withRouterConfig({ onSameUrlNavigation: 'ignore' }),
    ),
    provideHttpClient(),
  ],
});
