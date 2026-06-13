import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'wrs-habit-builder-theme';

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

    document.documentElement.classList.toggle('dark', mode === 'dark');
  }
}
