import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

const MOBILE_MAX_WIDTH_QUERY = '(max-width: 768px)';

@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _isMobile = signal(false);

  /** Viewport ≤768px (breakpoint `md` do Tailwind). */
  readonly isMobile = this._isMobile.asReadonly();

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_MAX_WIDTH_QUERY);
    this._isMobile.set(mediaQuery.matches);
    mediaQuery.addEventListener('change', (event) => {
      this._isMobile.set(event.matches);
    });
  }
}
