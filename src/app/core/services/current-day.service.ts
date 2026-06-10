import { isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { getMsUntilNextMidnight, toDateKey } from '../utils/date.utils';

@Injectable({ providedIn: 'root' })
export class CurrentDayService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _today = signal(new Date());
  private midnightTimer: ReturnType<typeof setTimeout> | null = null;

  /** Data de referência para "hoje" — atualiza na meia-noite e ao retomar a aba. */
  readonly today = this._today.asReadonly();
  readonly todayKey = computed(() => toDateKey(this._today()));

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.syncToday();
    this.scheduleMidnightRefresh();

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.syncToday();
      }
    });

    window.addEventListener('focus', () => this.syncToday());
  }

  /** Atualiza o signal se o dia civil mudou (ex.: aba suspensa ou relógio do SO). */
  syncToday(now: Date = new Date()): void {
    if (toDateKey(now) !== toDateKey(this._today())) {
      this._today.set(now);
    }

    this.scheduleMidnightRefresh(now);
  }

  private scheduleMidnightRefresh(from: Date = new Date()): void {
    if (this.midnightTimer !== null) {
      clearTimeout(this.midnightTimer);
    }

    this.midnightTimer = setTimeout(() => {
      this._today.set(new Date());
      this.scheduleMidnightRefresh();
    }, getMsUntilNextMidnight(from));
  }
}
