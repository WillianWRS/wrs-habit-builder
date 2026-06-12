import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import {
  TOAST_ICON_CLASS,
  ToastService,
  type ToastIcon,
} from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="toast-container pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 md:inset-x-auto md:bottom-auto md:left-auto md:right-6 md:top-6 md:items-end md:px-0"
      aria-live="polite"
      aria-relevant="additions"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast-item pointer-events-auto relative w-full max-w-md overflow-hidden rounded-xl bg-brand-light-primary shadow-lg dark:bg-brand-primary"
          [class.toast-item--enter]="!reducedMotion() && !toast.exiting"
          [class.toast-item--exit]="!reducedMotion() && toast.exiting"
          role="status"
        >
          @if (toast.type === 'undo') {
            <div
              class="toast-progress-bar absolute inset-x-0 top-0 h-1 origin-left bg-black"
              [class.toast-progress-bar--animated]="!reducedMotion() && !toast.exiting"
              [style.--toast-duration.ms]="toast.durationMs"
              aria-hidden="true"
            ></div>
          }

          <div
            class="flex min-h-12 items-center gap-3 px-4 py-2.5"
            [class.pt-3]="toast.type === 'undo'"
          >
            <i
              [class]="toastIconClasses(toast.icon)"
              aria-hidden="true"
            ></i>

            <span
              class="min-w-0 flex-1 text-sm font-medium leading-none text-white dark:text-brand-bg"
            >
              {{ toast.message }}
            </span>

            <div class="flex shrink-0 items-center gap-1 self-center">
              @if (toast.type === 'undo') {
                <button
                  type="button"
                  class="rounded-lg px-2 py-1 text-sm font-semibold text-white/95 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 dark:text-brand-bg dark:hover:bg-brand-bg/15 dark:focus-visible:ring-brand-bg/70"
                  (click)="undo(toast.id)"
                >
                  {{ toast.undoLabel }}
                </button>
              }

              <button
                type="button"
                class="inline-flex size-8 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 dark:text-brand-bg/80 dark:hover:bg-brand-bg/15 dark:hover:text-brand-bg dark:focus-visible:ring-brand-bg/70"
                aria-label="Fechar"
                (click)="close(toast.id)"
              >
                <i class="bi bi-x-lg text-sm" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-item--enter {
      animation: toast-enter-mobile 240ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    .toast-item--exit {
      animation: toast-exit-mobile 220ms cubic-bezier(0.4, 0, 1, 1) forwards;
    }

    @keyframes toast-enter-mobile {
      from {
        opacity: 0;
        transform: translateY(16px) scale(0.96);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes toast-exit-mobile {
      from {
        opacity: 1;
        transform: translateY(0) scale(1);
      }

      to {
        opacity: 0;
        transform: translateY(12px) scale(0.96);
      }
    }

    @media (min-width: 768px) {
      .toast-item--enter {
        animation-name: toast-enter-desktop;
      }

      .toast-item--exit {
        animation-name: toast-exit-desktop;
      }

      @keyframes toast-enter-desktop {
        from {
          opacity: 0;
          transform: translateX(24px) scale(0.96);
        }

        to {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }

      @keyframes toast-exit-desktop {
        from {
          opacity: 1;
          transform: translateX(0) scale(1);
        }

        to {
          opacity: 0;
          transform: translateX(24px) scale(0.96);
        }
      }
    }

    .toast-progress-bar {
      width: 100%;
      transform: scaleX(0);
    }

    .toast-progress-bar--animated {
      animation: toast-grow linear forwards;
      animation-duration: var(--toast-duration, 6000ms);
    }

    @keyframes toast-grow {
      from {
        transform: scaleX(0);
      }

      to {
        transform: scaleX(1);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .toast-item--enter,
      .toast-item--exit {
        animation: none;
      }

      .toast-progress-bar--animated {
        animation: toast-pulse-once 400ms ease-out 1;
      }

      @keyframes toast-pulse-once {
        0% {
          opacity: 1;
        }

        50% {
          opacity: 0.55;
        }

        100% {
          opacity: 0.85;
        }
      }
    }
  `,
})
export class AppToastComponent implements OnDestroy {
  protected readonly toastService = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly reducedMotion = signal(false);

  private mediaQuery: MediaQueryList | null = null;
  private readonly onMotionPreferenceChange = (): void => {
    this.reducedMotion.set(this.mediaQuery?.matches ?? false);
  };

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (typeof window.matchMedia !== 'function') {
      return;
    }

    this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion.set(this.mediaQuery.matches);
    this.mediaQuery.addEventListener('change', this.onMotionPreferenceChange);
  }

  ngOnDestroy(): void {
    this.mediaQuery?.removeEventListener('change', this.onMotionPreferenceChange);
  }

  protected toastIconClasses(icon: ToastIcon): string {
    return `${TOAST_ICON_CLASS[icon]} shrink-0 text-base leading-none text-white dark:text-brand-bg`;
  }

  protected close(id: string): void {
    this.toastService.dismiss(id, 'close');
  }

  protected undo(id: string): void {
    this.toastService.dismiss(id, 'undo');
  }
}
