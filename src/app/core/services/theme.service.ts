import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'wrs-habit-builder-theme';

/** Cor da barra de status/PWA alinhada ao canvas do app (não ao tema do SO). */
const THEME_META_COLORS: Record<ThemeMode, string> = {
  light: '#eaeaec',
  dark: '#18181b',
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);

  /** Dark é o padrão obrigatório na primeira visita */
  readonly theme = signal<ThemeMode>('dark');

  init(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const mode: ThemeMode = stored === 'light' ? 'light' : 'dark';
    this.apply(mode);
  }

  toggle(): void {
    const next: ThemeMode = this.theme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  setTheme(mode: ThemeMode): void {
    this.apply(mode);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }

  isDark(): boolean {
    return this.theme() === 'dark';
  }

  private apply(mode: ThemeMode): void {
    this.theme.set(mode);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    syncThemeToDocument(mode);
  }
}

/** Sincroniza classe, color-scheme e theme-color com a preferência do app. */
export function syncThemeToDocument(mode: ThemeMode): void {
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  root.style.colorScheme = mode === 'dark' ? 'only dark' : 'only light';

  let meta = document.querySelector('meta[name="theme-color"]');

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }

  meta.setAttribute('content', THEME_META_COLORS[mode]);

  const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');

  if (colorSchemeMeta) {
    colorSchemeMeta.setAttribute('content', mode === 'dark' ? 'dark' : 'light');
  }
}
