import { ApplicationConfig, ErrorHandler, LOCALE_ID, APP_INITIALIZER } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { routes } from './app.routes';
import { apiInterceptor } from './core/api.interceptor';
import { GlobalErrorHandler } from './core/global-error-handler';
import { PwaService } from './services/pwa.service';
import { IndexedDbService } from './services/indexed-db.service';

registerLocaleData(localeFr);

// Factory qui déclenche l'initialisation du PwaService (SW + réseau) au boot
function initPwa(pwa: PwaService, _idb: IndexedDbService) {
  return () => {
    // PwaService s'auto-initialise dans son constructeur (via inject)
    // _idb est injecté ici pour forcer sa création et l'ouverture de la DB dès le démarrage
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([apiInterceptor])),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: LOCALE_ID, useValue: 'fr' },
    {
      provide: APP_INITIALIZER,
      useFactory: initPwa,
      deps: [PwaService, IndexedDbService],
      multi: true
    }
  ]
};