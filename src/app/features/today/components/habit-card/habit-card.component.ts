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

const STREAK_TIER_MESSAGES: Record<
  StreakTier,
  { title: string; subtitle: string }
> = {
  0: { title: 'Sequência iniciada', subtitle: 'É só o começo' },
  1: { title: 'Sequência boa', subtitle: 'Podemos mais' },
  2: { title: 'Sequência ótima', subtitle: 'Vamos pra cima' },
  3: { title: 'Sequência excelente', subtitle: 'Não desista agora' },
  4: { title: 'Sequência perfeita', subtitle: 'Manteremos o topo' },
};

/** Faltas acumuladas até interromper a streak — preview fixo até persistência real */
const STREAK_MISS_TOLERANCE = 7;

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
          0 0 0 1px rgb(var(--accent-rgb-light) / 0.15),
          0 0 16px rgb(var(--accent-rgb-light) / 0.12);
      }
      50% {
        box-shadow:
          0 0 0 1px rgb(var(--accent-rgb-light) / 0.35),
          0 0 28px rgb(var(--accent-rgb-light) / 0.22);
      }
    }

    @keyframes streak-glow-pulse-dark {
      0%,
      100% {
        box-shadow:
          0 0 0 1px rgb(var(--accent-rgb-dark) / 0.2),
          0 0 20px rgb(var(--accent-rgb-dark) / 0.15);
      }
      50% {
        box-shadow:
          0 0 0 1px rgb(var(--accent-rgb-dark) / 0.45),
          0 0 36px rgb(var(--accent-rgb-dark) / 0.28);
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

    @keyframes mark-btn-shake {
      0%,
      100% {
        transform: translateX(0) rotate(0deg);
      }
      15% {
        transform: translateX(-3px) rotate(-2deg);
      }
      30% {
        transform: translateX(3px) rotate(2deg);
      }
      45% {
        transform: translateX(-2px) rotate(-1.5deg);
      }
      60% {
        transform: translateX(2px) rotate(1.5deg);
      }
      75% {
        transform: translateX(-1px) rotate(-0.5deg);
      }
    }

    .habit-mark-btn:hover {
      animation: mark-btn-shake 0.45s ease-in-out;
    }

    @keyframes day-count-pulse {
      0%,
      100% {
        transform: scale(1);
        filter: drop-shadow(0 0 0 transparent);
      }
      50% {
        transform: scale(var(--day-pulse-scale, 1.08));
        filter: drop-shadow(0 0 var(--day-pulse-glow, 0) rgb(var(--accent-rgb-current) / 0.5));
      }
    }

    .habit-card--completed .day-count-value {
      display: inline-block;
      transform-origin: center center;
      animation: day-count-pulse var(--day-pulse-duration, 2s) ease-in-out infinite;
    }

    .habit-card--completed[data-streak-tier='0'] {
      --day-pulse-duration: 2.3s;
      --day-pulse-scale: 1.06;
      --day-pulse-glow: 0;
    }

    .habit-card--completed[data-streak-tier='1'] {
      --day-pulse-duration: 1.75s;
      --day-pulse-scale: 1.07;
      --day-pulse-glow: 0;
    }

    .habit-card--completed[data-streak-tier='2'] {
      --day-pulse-duration: 1.25s;
      --day-pulse-scale: 1.09;
      --day-pulse-glow: 2px;
    }

    .habit-card--completed[data-streak-tier='3'] {
      --day-pulse-duration: 0.85s;
      --day-pulse-scale: 1.11;
      --day-pulse-glow: 4px;
    }

    .habit-card--completed[data-streak-tier='4'] {
      --day-pulse-duration: 0.45s;
      --day-pulse-scale: 1.15;
      --day-pulse-glow: 8px;
    }

    /* ── Base idle (nível 0) ── */
    .habit-card {
      --accent-rgb-current: var(--accent-rgb-light);
      --accent-tint-current: var(--accent-tint-light);
      --streak-subtitle-accent: 0%;
      --streak-border: rgb(var(--card-border-rgb-light));
      --streak-bg: var(--brand-light-surface);
      border: 1px solid var(--streak-border);
      background-color: var(--streak-bg);
    }

    :host-context(.dark) .habit-card {
      --accent-rgb-current: var(--accent-rgb-dark);
      --accent-tint-current: var(--accent-tint-dark);
      --streak-border: rgb(var(--card-border-rgb-dark) / 0.85);
      --streak-bg: var(--card-bg-dark);
    }

    .habit-card::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background-color: rgb(255 255 255 / 0);
      pointer-events: none;
      z-index: 0;
      transition: background-color 200ms ease-out;
    }

    .habit-card:hover::after {
      background-color: rgb(255 255 255 / 0.05);
    }

    :host-context(.dark) .habit-card:hover::after {
      background-color: rgb(255 255 255 / 0.06);
    }

    /* ── Texto de streak por tier (título) ── */
    .streak-status-title {
      color: rgb(var(--accent-rgb-current));
    }

    .habit-card[data-streak-tier='1'] .streak-status-title {
      color: color-mix(in srgb, rgb(var(--accent-rgb-current)) 82%, rgb(var(--accent-tint-current)));
    }

    .habit-card[data-streak-tier='2'] .streak-status-title {
      color: color-mix(in srgb, rgb(var(--accent-rgb-current)) 64%, rgb(var(--accent-tint-current)));
    }

    .habit-card[data-streak-tier='3'] .streak-status-title {
      color: color-mix(in srgb, rgb(var(--accent-rgb-current)) 46%, rgb(var(--accent-tint-current)));
    }

    .habit-card[data-streak-tier='3'] .streak-status-title,
    .habit-card[data-streak-tier='4'] .streak-status-title,
    .habit-card[data-streak-tier='3'] .streak-status-subtitle,
    .habit-card[data-streak-tier='4'] .streak-status-subtitle {
      font-weight: 700;
    }

    .habit-card[data-streak-tier='4'] .streak-status-title {
      animation: streak-status-text-pulse 0.45s ease-in-out infinite;
    }

    @keyframes streak-status-text-pulse {
      0%,
      100% {
        color: rgb(var(--accent-rgb-current));
      }
      50% {
        color: color-mix(in srgb, rgb(var(--accent-rgb-current)) 28%, rgb(var(--accent-tint-current)));
      }
    }

    .streak-status-subtitle {
      color: color-mix(
        in srgb,
        rgb(var(--accent-rgb-current)) var(--streak-subtitle-accent, 0%),
        var(--brand-light-text-secondary) calc(100% - var(--streak-subtitle-accent, 0%))
      );
    }

    :host-context(.dark) .streak-status-subtitle {
      color: color-mix(
        in srgb,
        rgb(var(--accent-rgb-current)) var(--streak-subtitle-accent, 0%),
        var(--brand-text-secondary) calc(100% - var(--streak-subtitle-accent, 0%))
      );
    }

    .habit-card[data-streak-tier='1'] {
      --streak-subtitle-accent: 18%;
    }

    .habit-card[data-streak-tier='2'] {
      --streak-subtitle-accent: 32%;
    }

    .habit-card[data-streak-tier='3'] {
      --streak-subtitle-accent: 46%;
    }

    .habit-card[data-streak-tier='4'] {
      --streak-subtitle-accent: 58%;
    }

    /* ── Nível 1 · 15+ dias ── */
    .habit-card[data-streak-tier='1']:not(.habit-card--completed) {
      border-width: 2px;
      --streak-border: rgb(var(--accent-rgb-light) / 0.22);
      box-shadow: 0 0 0 1px rgb(var(--accent-rgb-light) / 0.06);
    }

    :host-context(.dark) .habit-card[data-streak-tier='1']:not(.habit-card--completed) {
      --streak-border: rgb(var(--accent-rgb-dark) / 0.28);
      box-shadow: 0 0 0 1px rgb(var(--accent-rgb-dark) / 0.08);
    }

    /* ── Nível 2 · 35+ dias ── */
    .habit-card[data-streak-tier='2']:not(.habit-card--completed) {
      border-width: 2px;
      --streak-border: rgb(var(--accent-rgb-light) / 0.38);
      box-shadow:
        0 0 0 1px rgb(var(--accent-rgb-light) / 0.1),
        0 0 14px rgb(var(--accent-rgb-light) / 0.1),
        inset 0 1px 0 rgb(var(--accent-rgb-light) / 0.06);
    }

    :host-context(.dark) .habit-card[data-streak-tier='2']:not(.habit-card--completed) {
      --streak-border: rgb(var(--accent-rgb-dark) / 0.45);
      box-shadow:
        0 0 0 1px rgb(var(--accent-rgb-dark) / 0.12),
        0 0 18px rgb(var(--accent-rgb-dark) / 0.14),
        inset 0 1px 0 rgb(var(--accent-rgb-dark) / 0.08);
    }

    /* ── Nível 3 · 50+ dias ── */
    .habit-card[data-streak-tier='3']:not(.habit-card--completed) {
      border-width: 2px;
      --streak-border: rgb(var(--accent-rgb-light) / 0.55);
      animation: streak-glow-pulse 3s ease-in-out infinite;
    }

    :host-context(.dark) .habit-card[data-streak-tier='3']:not(.habit-card--completed) {
      --streak-border: rgb(var(--accent-rgb-dark) / 0.6);
      animation: streak-glow-pulse-dark 3s ease-in-out infinite;
    }

    /* ── Nível 5 · 66+ dias — borda 4px estática, cores em fluxo interno ── */
    .habit-card[data-streak-tier='4'] {
      --legendary-border: 4px;
      --legendary-orange: rgb(var(--accent-rgb-light));
      --legendary-orange-light: rgb(var(--accent-tint-light));
      border: var(--legendary-border) solid var(--legendary-orange);
      background-color: var(--streak-bg);
      box-shadow: 0 0 14px rgb(var(--accent-rgb-light) / 0.06);
      overflow: visible;
    }

    :host-context(.dark) .habit-card[data-streak-tier='4'] {
      --legendary-orange: rgb(var(--accent-rgb-dark));
      --legendary-orange-light: rgb(var(--accent-tint-dark));
      box-shadow: 0 0 16px rgb(var(--accent-rgb-dark) / 0.08);
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
        var(--legendary-orange) 0deg,
        var(--legendary-orange-light) 72deg,
        var(--legendary-orange) 144deg,
        var(--legendary-orange-light) 216deg,
        var(--legendary-orange) 288deg,
        var(--legendary-orange-light) 360deg
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
      background-color: rgb(var(--accent-rgb-light) / 0.1);
    }

    :host-context(.dark) .habit-card--completed[data-streak-tier='4'] {
      background-color: rgb(var(--accent-rgb-dark) / 0.1);
    }

    /* ── Completed base (nível 0) ── */
    .habit-card--completed {
      border: 1px solid rgb(var(--accent-rgb-light) / 0.3);
      background-color: rgb(var(--accent-rgb-light) / 0.1);
    }

    :host-context(.dark) .habit-card--completed {
      border-color: rgb(var(--accent-rgb-dark) / 0.3);
      background-color: rgb(var(--accent-rgb-dark) / 0.1);
    }

    /* ── Completed nível 1 ── */
    .habit-card--completed[data-streak-tier='1'] {
      border-width: 2px;
      border-color: rgb(var(--accent-rgb-light) / 0.4);
      box-shadow: 0 0 0 1px rgb(var(--accent-rgb-light) / 0.12);
    }

    :host-context(.dark) .habit-card--completed[data-streak-tier='1'] {
      border-color: rgb(var(--accent-rgb-dark) / 0.45);
      box-shadow: 0 0 0 1px rgb(var(--accent-rgb-dark) / 0.15);
    }

    /* ── Completed nível 2 ── */
    .habit-card--completed[data-streak-tier='2'] {
      border-width: 2px;
      border-color: rgb(var(--accent-rgb-light) / 0.55);
      box-shadow:
        0 0 0 1px rgb(var(--accent-rgb-light) / 0.18),
        0 0 16px rgb(var(--accent-rgb-light) / 0.14);
    }

    :host-context(.dark) .habit-card--completed[data-streak-tier='2'] {
      border-color: rgb(var(--accent-rgb-dark) / 0.6);
      box-shadow:
        0 0 0 1px rgb(var(--accent-rgb-dark) / 0.22),
        0 0 20px rgb(var(--accent-rgb-dark) / 0.18);
    }

    /* ── Completed nível 3 ── */
    .habit-card--completed[data-streak-tier='3'] {
      border-width: 2px;
      border-color: rgb(var(--accent-rgb-light) / 0.65);
      animation: streak-glow-pulse 3s ease-in-out infinite;
    }

    :host-context(.dark) .habit-card--completed[data-streak-tier='3'] {
      border-color: rgb(var(--accent-rgb-dark) / 0.7);
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

      .habit-card--completed .day-count-value {
        animation: none;
      }

      .habit-mark-btn:hover {
        animation: none;
      }

      .habit-card[data-streak-tier='4'] .streak-status-title {
        animation: none;
        color: color-mix(in srgb, rgb(var(--accent-rgb-current)) 28%, rgb(var(--accent-tint-current)));
      }

      .habit-card[data-streak-tier='3']:not(.habit-card--completed) {
        box-shadow:
          0 0 0 1px rgb(var(--accent-rgb-light) / 0.25),
          0 0 20px rgb(var(--accent-rgb-light) / 0.15);
      }

      :host-context(.dark) .habit-card[data-streak-tier='3']:not(.habit-card--completed) {
        box-shadow:
          0 0 0 1px rgb(var(--accent-rgb-dark) / 0.3),
          0 0 24px rgb(var(--accent-rgb-dark) / 0.18);
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
        <div class="flex items-center justify-between gap-3">
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
                  class="day-count-value text-2xl font-bold tabular-nums"
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
                  class="shrink-0 text-xs italic text-brand-light-text-secondary dark:text-brand-text-secondary"
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

              <div class="mt-1 flex items-start justify-between gap-3">
                <p
                  class="min-w-0 text-sm text-brand-light-text-secondary dark:text-brand-text-secondary"
                >
                  Mínimo: {{ minimumAction() }}
                </p>

                <div
                  class="shrink-0 text-right"
                  [attr.aria-label]="streakStatusAriaLabel()"
                >
                  @if (showMissMessage()) {
                    <p
                      class="text-[10px] leading-snug text-brand-light-text-secondary/80 dark:text-brand-text-secondary/80"
                    >
                      {{ streakAtRiskHint() }}
                    </p>
                    <p
                      class="mt-0.5 text-sm text-brand-light-text-secondary dark:text-brand-text-secondary"
                    >
                      {{ streakAtRiskEncouragement() }}
                    </p>
                  } @else {
                    <p class="streak-status-title text-sm font-medium">
                      {{ streakTierMessage().title }}
                    </p>
                    <p class="streak-status-subtitle mt-0.5 text-sm">
                      {{ streakTierMessage().subtitle }}
                    </p>
                  }
                </div>
              </div>
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
              class="habit-mark-btn shrink-0 rounded-lg bg-brand-light-primary px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
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
            class="mt-3 inline-flex items-center gap-1.5 text-xs text-brand-light-text-secondary underline-offset-2 hover:text-brand-light-text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:text-brand-text-secondary dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
            [attr.aria-label]="'Desmarcar ' + name()"
            (click)="markToggle.emit()"
          >
            <i class="bi bi-arrow-counterclockwise text-[11px]" aria-hidden="true"></i>
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
  /** Preview: assume `false` até haver completions do dia anterior */
  readonly previousDayCompleted = input(false);
  readonly completed = input.required<boolean>();
  readonly accent = input<HabitCardAccent>('default');

  readonly markToggle = output<void>();

  protected readonly streakTier = computed(() => getStreakTier(this.dayCount()));

  /** Falta ontem e ainda não marcou hoje → mensagem de risco */
  protected readonly showMissMessage = computed(
    () => !this.previousDayCompleted() && !this.completed(),
  );

  protected readonly streakTierMessage = computed(
    () => STREAK_TIER_MESSAGES[this.streakTier()],
  );

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

  protected readonly streakAtRiskHint = computed(() => {
    const remaining = STREAK_MISS_TOLERANCE - 1;
    const label = remaining === 1 ? 'falta' : 'faltas';

    return `mais ${remaining} ${label} seguidas interrompem a streak`;
  });

  protected readonly streakAtRiskEncouragement = computed(() => {
    return '1 falta, não desanime, complete a tarefa hoje';
  });

  protected readonly streakStatusAriaLabel = computed(() => {
    if (this.showMissMessage()) {
      return `${this.streakAtRiskHint()}. ${this.streakAtRiskEncouragement()}`;
    }

    const message = this.streakTierMessage();
    return `${message.title}. ${message.subtitle}`;
  });
}
