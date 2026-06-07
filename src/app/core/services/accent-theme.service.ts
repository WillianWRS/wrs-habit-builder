import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type AccentTheme = 'orange' | 'emerald';

const STORAGE_KEY = 'wrs-habit-builder-accent';

@Injectable({ providedIn: 'root' })
export class AccentThemeService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly accent = signal<AccentTheme>('orange');

  init(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const accent: AccentTheme = stored === 'emerald' ? 'emerald' : 'orange';
    this.apply(accent);
  }

  toggle(): void {
    const next: AccentTheme = this.accent() === 'orange' ? 'emerald' : 'orange';
    this.apply(next);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }

  private apply(accent: AccentTheme): void {
    this.accent.set(accent);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    document.documentElement.classList.toggle('accent-emerald', accent === 'emerald');
  }
}
