import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {TranslateModule} from '@ngx-translate/core';
import {provideHttpClient} from '@angular/common/http';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot(
        {
          loader: provideTranslateHttpLoader(
            {
              prefix: 'assets/i18n/',
              suffix: '.json'
            }
          )
        }
      )
    )
  ]
};
