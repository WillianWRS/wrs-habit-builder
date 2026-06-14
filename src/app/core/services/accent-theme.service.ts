import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type AccentTheme =
  | 'orange'
  | 'emerald'
  | 'red'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'cyan';

const STORAGE_KEY = 'wrs-habit-builder-accent';
const ACCENT_CLASS_PREFIX = 'accent-';
const ACCENT_CLASSES = [
  'accent-emerald',
  'accent-red',
  'accent-blue',
  'accent-purple',
  'accent-pink',
  'accent-cyan',
];

@Injectable({ providedIn: 'root' })
export class AccentThemeService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly accent = signal<AccentTheme>('orange');

  init(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY) as AccentTheme | null;
    const accent = isAccentTheme(stored) ? stored : 'orange';
    this.apply(accent);
  }

  toggle(): void {
    const next: AccentTheme = this.accent() === 'orange' ? 'emerald' : 'orange';
    this.setAccent(next);
  }

  setAccent(accent: AccentTheme): void {
    this.apply(accent);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, accent);
    }
  }

  private apply(accent: AccentTheme): void {
    this.accent.set(accent);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    for (const klass of ACCENT_CLASSES) {
      document.documentElement.classList.remove(klass);
    }

    if (accent !== 'orange') {
      document.documentElement.classList.add(`${ACCENT_CLASS_PREFIX}${accent}`);
    }
  }
}

function isAccentTheme(value: string | null): value is AccentTheme {
  return (
    value === 'orange' ||
    value === 'emerald' ||
    value === 'red' ||
    value === 'blue' ||
    value === 'purple' ||
    value === 'pink' ||
    value === 'cyan'
  );
}
