import { ApplicationConfig, APP_INITIALIZER, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { ThemeService } from './core/services/theme.service';
import { AccentThemeService } from './core/services/accent-theme.service';

function initializeTheme(theme: ThemeService): () => void {
  return () => theme.init();
}

function initializeAccentTheme(accentTheme: AccentThemeService): () => void {
  return () => accentTheme.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTheme,
      deps: [ThemeService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAccentTheme,
      deps: [AccentThemeService],
      multi: true,
    },
  ],
};
