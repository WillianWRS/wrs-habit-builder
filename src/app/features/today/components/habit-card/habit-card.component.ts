import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

export type HabitCardAccent = 'default' | 'physical' | 'wellness';

/** Níveis 0–4 conforme dias de sequência: 0 · 15 · 35 · 50 · 66+ */
export type StreakTier = 0 | 1 | 2 | 3 | 4;

const STREAK_TIER_THRESHOLDS = [0, 15, 35, 50, 66] as const;

export function getStreakTier(dayCount: number): StreakTier {
  if (dayCount >= STREAK_TIER_THRESHOLDS[4]) return 4;
  if (dayCount >= STREAK_TIER_THRESHOLDS[3]) return 3;
  if (dayCount >= STREAK_TIER_THRESHOLDS[2]) return 2;
  if (dayCount >= STREAK_TIER_THRESHOLDS[1]) return 1;
  return 0;
}

@Component({
  selector: 'app-habit-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @keyframes habit-marquee-left {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(-50%);
      }
    }

    @keyframes streak-glow-pulse {
      0%,
      100% {
        box-shadow:
          0 0 0 1px rgb(0 200 83 / 0.15),
          0 0 16px rgb(0 200 83 / 0.12);
      }
      50% {
        box-shadow:
          0 0 0 1px rgb(0 200 83 / 0.35),
          0 0 28px rgb(0 200 83 / 0.22);
      }
    }

    @keyframes streak-glow-pulse-dark {
      0%,
      100% {
        box-shadow:
          0 0 0 1px rgb(0 230 118 / 0.2),
          0 0 20px rgb(0 230 118 / 0.15);
      }
      50% {
        box-shadow:
          0 0 0 1px rgb(0 230 118 / 0.45),
          0 0 36px rgb(0 230 118 / 0.28);
      }
    }

    @property --legendary-flow {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }

    @keyframes legendary-color-flow {
      to {
        --legendary-flow: 360deg;
      }
    }

    .habit-marquee-track {
      display: flex;
      width: max-content;
      animation: habit-marquee-left 28s linear infinite;
    }

    /* ── Base idle (nível 0) ── */
    .habit-card {
      --streak-border: rgb(226 232 240);
      --streak-bg: #ffffff;
      border: 1px solid var(--streak-border);
      background-color: var(--streak-bg);
    }

    :host-context(.dark) .habit-card {
      --streak-border: rgb(30 41 59 / 0.8);
      --streak-bg: #1e293b;
    }

    /* ── Nível 1 · 15+ dias ── */
    .habit-card[data-streak-tier='1']:not(.habit-card--completed) {
      border-width: 2px;
      --streak-border: rgb(0 200 83 / 0.22);
      box-shadow: 0 0 0 1px rgb(0 200 83 / 0.06);
    }

    :host-context(.dark) .habit-card[data-streak-tier='1']:not(.habit-card--completed) {
      --streak-border: rgb(0 230 118 / 0.28);
      box-shadow: 0 0 0 1px rgb(0 230 118 / 0.08);
    }

    /* ── Nível 2 · 35+ dias ── */
    .habit-card[data-streak-tier='2']:not(.habit-card--completed) {
      border-width: 2px;
      --streak-border: rgb(0 200 83 / 0.38);
      box-shadow:
        0 0 0 1px rgb(0 200 83 / 0.1),
        0 0 14px rgb(0 200 83 / 0.1),
        inset 0 1px 0 rgb(0 200 83 / 0.06);
    }

    :host-context(.dark) .habit-card[data-streak-tier='2']:not(.habit-card--completed) {
      --streak-border: rgb(0 230 118 / 0.45);
      box-shadow:
        0 0 0 1px rgb(0 230 118 / 0.12),
        0 0 18px rgb(0 230 118 / 0.14),
        inset 0 1px 0 rgb(0 230 118 / 0.08);
    }

    /* ── Nível 3 · 50+ dias ── */
    .habit-card[data-streak-tier='3']:not(.habit-card--completed) {
      border-width: 2px;
      --streak-border: rgb(0 200 83 / 0.55);
      animation: streak-glow-pulse 3s ease-in-out infinite;
    }

    :host-context(.dark) .habit-card[data-streak-tier='3']:not(.habit-card--completed) {
      --streak-border: rgb(0 230 118 / 0.6);
      animation: streak-glow-pulse-dark 3s ease-in-out infinite;
    }

    /* ── Nível 5 · 66+ dias — borda 4px estática, cores em fluxo interno ── */
    .habit-card[data-streak-tier='4'] {
      --legendary-border: 4px;
      --legendary-green: rgb(0 200 83);
      --legendary-green-light: rgb(209 250 229);
      border: var(--legendary-border) solid var(--legendary-green);
      background-color: var(--streak-bg);
      box-shadow: 0 0 14px rgb(0 200 83 / 0.06);
      overflow: visible;
    }

    :host-context(.dark) .habit-card[data-streak-tier='4'] {
      --legendary-green: rgb(0 230 118);
      --legendary-green-light: rgb(167 243 208);
      box-shadow: 0 0 16px rgb(0 230 118 / 0.08);
    }

    .habit-card[data-streak-tier='4']::before {
      --legendary-flow: 0deg;
      content: '';
      position: absolute;
      inset: calc(-1 * var(--legendary-border));
      border-radius: inherit;
      padding: var(--legendary-border);
      background: conic-gradient(
        from var(--legendary-flow),
        var(--legendary-green) 0deg,
        var(--legendary-green-light) 72deg,
        var(--legendary-green) 144deg,
        var(--legendary-green-light) 216deg,
        var(--legendary-green) 288deg,
        var(--legendary-green-light) 360deg
      );
      animation: legendary-color-flow 4s linear infinite;
      pointer-events: none;
      z-index: 0;
      -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      mask-composite: exclude;
    }

    .habit-card--completed[data-streak-tier='4'] {
      background-color: rgb(0 200 83 / 0.1);
    }

    :host-context(.dark) .habit-card--completed[data-streak-tier='4'] {
      background-color: rgb(0 230 118 / 0.1);
    }

    /* ── Completed base (nível 0) ── */
    .habit-card--completed {
      border: 1px solid rgb(0 200 83 / 0.3);
      background-color: rgb(0 200 83 / 0.1);
    }

    :host-context(.dark) .habit-card--completed {
      border-color: rgb(0 230 118 / 0.3);
      background-color: rgb(0 230 118 / 0.1);
    }

    /* ── Completed nível 1 ── */
    .habit-card--completed[data-streak-tier='1'] {
      border-width: 2px;
      border-color: rgb(0 200 83 / 0.4);
      box-shadow: 0 0 0 1px rgb(0 200 83 / 0.12);
    }

    :host-context(.dark) .habit-card--completed[data-streak-tier='1'] {
      border-color: rgb(0 230 118 / 0.45);
      box-shadow: 0 0 0 1px rgb(0 230 118 / 0.15);
    }

    /* ── Completed nível 2 ── */
    .habit-card--completed[data-streak-tier='2'] {
      border-width: 2px;
      border-color: rgb(0 200 83 / 0.55);
      box-shadow:
        0 0 0 1px rgb(0 200 83 / 0.18),
        0 0 16px rgb(0 200 83 / 0.14);
    }

    :host-context(.dark) .habit-card--completed[data-streak-tier='2'] {
      border-color: rgb(0 230 118 / 0.6);
      box-shadow:
        0 0 0 1px rgb(0 230 118 / 0.22),
        0 0 20px rgb(0 230 118 / 0.18);
    }

    /* ── Completed nível 3 ── */
    .habit-card--completed[data-streak-tier='3'] {
      border-width: 2px;
      border-color: rgb(0 200 83 / 0.65);
      animation: streak-glow-pulse 3s ease-in-out infinite;
    }

    :host-context(.dark) .habit-card--completed[data-streak-tier='3'] {
      border-color: rgb(0 230 118 / 0.7);
      animation: streak-glow-pulse-dark 3s ease-in-out infinite;
    }

    /* ── Completed nível 4 — herda borda animada do tier 4 ── */

    @media (prefers-reduced-motion: reduce) {
      .habit-marquee-track {
        animation: none;
      }

      .habit-marquee-viewport {
        overflow-x: auto;
        scrollbar-width: none;
      }

      .habit-marquee-viewport::-webkit-scrollbar {
        display: none;
      }

      .habit-card[data-streak-tier='3']:not(.habit-card--completed),
      .habit-card--completed[data-streak-tier='3'],
      .habit-card[data-streak-tier='4']::before {
        animation: none;
      }

      .habit-card[data-streak-tier='3']:not(.habit-card--completed) {
        box-shadow:
          0 0 0 1px rgb(0 200 83 / 0.25),
          0 0 20px rgb(0 200 83 / 0.15);
      }

      :host-context(.dark) .habit-card[data-streak-tier='3']:not(.habit-card--completed) {
        box-shadow:
          0 0 0 1px rgb(0 230 118 / 0.3),
          0 0 24px rgb(0 230 118 / 0.18);
      }
    }
  `,
  template: `
    <article
      class="habit-card relative rounded-xl p-4 transition-colors duration-200 motion-reduce:transition-none"
      [class.habit-card--completed]="completed()"
      [attr.data-streak-tier]="streakTier()"
      [class.border-l-4]="!completed() && streakTier() === 0"
      [class.border-l-brand-accent-orange]="!completed() && streakTier() === 0 && accent() === 'physical'"
      [class.border-l-brand-accent-purple]="!completed() && streakTier() === 0 && accent() === 'wellness'"
    >
      <div class="relative z-[1]">
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 flex-1 gap-3">
            <div class="flex shrink-0 flex-col items-center gap-1.5">
              <span
                class="flex size-5 items-center justify-center rounded-full border-2 transition-all duration-200 motion-reduce:transition-none"
                [class]="
                  completed()
                    ? 'border-brand-light-primary bg-brand-light-primary dark:border-brand-primary dark:bg-brand-primary'
                    : 'border-brand-light-text-secondary/40 dark:border-brand-text-secondary/50'
                "
                aria-hidden="true"
              >
                @if (completed()) {
                  <svg
                    class="size-3 text-white transition-transform duration-200 motion-reduce:transition-none dark:text-brand-bg"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                }
              </span>

              <div
                class="flex flex-col items-center leading-none"
                [attr.aria-label]="dayCount() + ' dias'"
              >
                <span
                  class="text-[10px] font-medium text-brand-light-text-secondary dark:text-brand-text-secondary"
                  >dia</span
                >
                <span
                  class="text-2xl font-bold tabular-nums transition-all duration-200"
                  [class]="dayCountStyleClass()"
                  >{{ dayCount() }}</span
                >
              </div>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                <h2
                  class="font-medium text-brand-light-text-primary dark:text-brand-text-primary"
                >
                  {{ name() }}
                </h2>
                <span
                  class="shrink-0 text-xs text-brand-light-text-secondary dark:text-brand-text-secondary"
                  >{{ time() }} · {{ category() }}</span
                >
              </div>

              <div
                class="habit-marquee-viewport mt-1 overflow-hidden"
                [attr.aria-label]="marqueeLabel()"
              >
                <div class="habit-marquee-track text-sm text-brand-light-text-secondary dark:text-brand-text-secondary">
                  @for (copy of [0, 1]; track copy) {
                    <span class="flex shrink-0 items-center gap-2 pr-8" [attr.aria-hidden]="copy === 1">
                      <span class="inline-flex items-center gap-1">
                        <i
                          class="bi bi-lightning-charge shrink-0 text-xs text-brand-light-primary dark:text-brand-primary"
                          aria-hidden="true"
                        ></i>
                        <span>{{ trigger1() }}</span>
                      </span>
                      <span class="leading-none opacity-50" aria-hidden="true">·</span>
                      <span class="inline-flex items-center gap-1">
                        <i
                          class="bi bi-lightning-charge shrink-0 text-xs text-brand-light-primary dark:text-brand-primary"
                          aria-hidden="true"
                        ></i>
                        <span>{{ trigger2() }}</span>
                      </span>
                      <span class="leading-none opacity-50" aria-hidden="true">·</span>
                      <span class="inline-flex items-center gap-1">
                        <i
                          class="bi bi-trophy shrink-0 text-xs text-brand-light-primary dark:text-brand-primary"
                          aria-hidden="true"
                        ></i>
                        <span>{{ motivation1() }}</span>
                      </span>
                      <span class="leading-none opacity-50" aria-hidden="true">·</span>
                      <span class="inline-flex items-center gap-1">
                        <i
                          class="bi bi-trophy shrink-0 text-xs text-brand-light-primary dark:text-brand-primary"
                          aria-hidden="true"
                        ></i>
                        <span>{{ motivation2() }}</span>
                      </span>
                    </span>
                  }
                </div>
              </div>

              <p
                class="mt-1 text-sm text-brand-light-text-secondary dark:text-brand-text-secondary"
              >
                Mínimo: {{ minimumAction() }}
              </p>
            </div>
          </div>

          @if (completed()) {
            <span
              class="shrink-0 text-sm font-medium text-brand-light-primary dark:text-brand-primary"
              >✓ Feito</span
            >
          } @else {
            <button
              type="button"
              class="shrink-0 rounded-lg bg-brand-light-primary px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
              [attr.aria-label]="'Marcar ' + name() + ' como feito'"
              (click)="markToggle.emit()"
            >
              Marcar ✓
            </button>
          }
        </div>

        @if (completed()) {
          <button
            type="button"
            class="mt-3 text-xs text-brand-light-text-secondary underline-offset-2 hover:text-brand-light-text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:text-brand-text-secondary dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
            [attr.aria-label]="'Desmarcar ' + name()"
            (click)="markToggle.emit()"
          >
            Desmarcar
          </button>
        }
      </div>
    </article>
  `,
})
export class HabitCardComponent {
  readonly name = input.required<string>();
  readonly time = input.required<string>();
  readonly category = input.required<string>();
  readonly trigger1 = input.required<string>();
  readonly trigger2 = input.required<string>();
  readonly motivation1 = input.required<string>();
  readonly motivation2 = input.required<string>();
  readonly minimumAction = input.required<string>();
  readonly dayCount = input<number>(0);
  readonly completed = input.required<boolean>();
  readonly accent = input<HabitCardAccent>('default');

  readonly markToggle = output<void>();

  protected readonly streakTier = computed(() => getStreakTier(this.dayCount()));

  protected readonly dayCountStyleClass = computed(() => {
    const tier = this.streakTier();
    const base = 'text-brand-light-primary dark:text-brand-primary';

    if (tier >= 4) {
      return base + ' font-extrabold';
    }
    if (tier >= 3) {
      return base + ' font-extrabold';
    }
    if (tier >= 2) {
      return base + ' font-bold';
    }
    return base;
  });

  protected readonly marqueeLabel = computed(
    () =>
      `${this.trigger1()}. ${this.trigger2()}. ${this.motivation1()}. ${this.motivation2()}.`,
  );
}
