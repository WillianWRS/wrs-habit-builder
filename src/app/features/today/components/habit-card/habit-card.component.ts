import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { STREAK_MISS_TOLERANCE } from '../../../../core/utils/habit-streak.utils';
import { formatHabitCardTitle } from '../../../../core/utils/habit-meta.utils';
import type { Weekday } from '../../../../core/models/weekday.model';
import { WeekdayScheduleComponent } from '../../../../shared/components/weekday-schedule/weekday-schedule.component';

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

/** Faltas acumuladas até interromper a streak e zerar os dias */
const DAY_ONE_MESSAGE = {
  title: 'Dia um',
  subtitle: 'Marque hoje para começar a sequência',
} as const;

const COMPLETE_SWEEP_MS = 400;

const COMPLETE_SWEEP_BANDS = [1, 2, 3, 4] as const;

type CompleteSweepPhase = 'idle' | 'in' | 'out';
type MarqueeSpeed = 'default' | 'fast' | 'paused';

const MARQUEE_SPEED_CYCLE: Record<MarqueeSpeed, MarqueeSpeed> = {
  default: 'fast',
  fast: 'paused',
  paused: 'default',
};

const MARQUEE_FAST_PLAYBACK_RATE = 28 / 9;

@Component({
  selector: 'app-habit-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WeekdayScheduleComponent],
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

    .habit-marquee-viewport {
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
    }

    .habit-marquee-viewport * {
      user-select: none;
      -webkit-user-select: none;
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
    @keyframes habit-complete-sweep-in {
      from {
        transform: scaleX(0);
      }
      to {
        transform: scaleX(1);
      }
    }

    @keyframes habit-complete-sweep-out {
      from {
        transform: scaleX(1);
      }
      to {
        transform: scaleX(0);
      }
    }

    .habit-card {
      --accent-rgb-current: var(--accent-rgb-light);
      --accent-tint-current: var(--accent-tint-light);
      --streak-subtitle-accent: 0%;
      --streak-border: rgb(var(--card-border-rgb-light));
      --streak-bg: var(--brand-light-surface);
      --completed-bg: rgb(var(--accent-rgb-light) / 0.1);
      border: 1px solid var(--streak-border);
      background-color: var(--streak-bg);
      overflow: hidden;
    }

    .habit-card-complete-bg {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .habit-card-complete-band {
      position: absolute;
      left: 0;
      right: 0;
      height: 25%;
      background-color: var(--completed-bg);
      transform: scaleX(1);
      transform-origin: right center;
    }

    .habit-card-complete-band--sweep-in {
      transform: scaleX(0);
      animation: habit-complete-sweep-in ease-out forwards;
    }

    .habit-card-complete-band--sweep-out {
      transform: scaleX(1);
      animation: habit-complete-sweep-out ease-out forwards;
    }

    .habit-card-complete-band[data-band='1'] {
      bottom: 0;
    }

    .habit-card-complete-band[data-band='2'] {
      bottom: 25%;
    }

    .habit-card-complete-band[data-band='3'] {
      bottom: 50%;
    }

    .habit-card-complete-band[data-band='4'] {
      bottom: 75%;
    }

    .habit-card-complete-band[data-band='1'].habit-card-complete-band--sweep-in,
    .habit-card-complete-band[data-band='1'].habit-card-complete-band--sweep-out {
      animation-duration: 0.1s;
    }

    .habit-card-complete-band[data-band='2'].habit-card-complete-band--sweep-in,
    .habit-card-complete-band[data-band='2'].habit-card-complete-band--sweep-out {
      animation-duration: 0.2s;
    }

    .habit-card-complete-band[data-band='3'].habit-card-complete-band--sweep-in,
    .habit-card-complete-band[data-band='3'].habit-card-complete-band--sweep-out {
      animation-duration: 0.3s;
    }

    .habit-card-complete-band[data-band='4'].habit-card-complete-band--sweep-in,
    .habit-card-complete-band[data-band='4'].habit-card-complete-band--sweep-out {
      animation-duration: 0.4s;
    }

    :host-context(.dark) .habit-card {
      --accent-rgb-current: var(--accent-rgb-dark);
      --accent-tint-current: var(--accent-tint-dark);
      --streak-border: rgb(var(--card-border-rgb-dark) / 0.85);
      --streak-bg: var(--card-bg-dark);
      --completed-bg: rgb(var(--accent-rgb-dark) / 0.1);
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
      background-color: rgb(0 0 0 / 0.04);
    }

    :host-context(.dark) .habit-card:hover::after {
      background-color: rgb(255 255 255 / 0.06);
    }

    .habit-card-field {
      transition:
        color 200ms ease-out,
        border-color 200ms ease-out,
        filter 200ms ease-out;
    }

    .habit-card-field--primary {
      color: var(--brand-light-text-primary);
    }

    .habit-card:hover .habit-card-field--primary {
      color: color-mix(in srgb, var(--brand-light-text-primary) 88%, black);
    }

    :host-context(.dark) .habit-card-field--primary {
      color: var(--brand-text-primary);
    }

    :host-context(.dark) .habit-card:hover .habit-card-field--primary {
      color: color-mix(in srgb, var(--brand-text-primary) 82%, white);
    }

    .habit-card-field--secondary {
      color: var(--brand-light-text-secondary);
    }

    .habit-card:hover .habit-card-field--secondary {
      color: color-mix(
        in srgb,
        var(--brand-light-text-secondary) 72%,
        var(--brand-light-text-primary)
      );
    }

    :host-context(.dark) .habit-card-field--secondary {
      color: var(--brand-text-secondary);
    }

    :host-context(.dark) .habit-card:hover .habit-card-field--secondary {
      color: color-mix(in srgb, var(--brand-text-secondary) 50%, var(--brand-text-primary));
    }

    .habit-card-field--accent {
      color: var(--accent-light);
    }

    .habit-card:hover .habit-card-field--accent {
      color: color-mix(in srgb, var(--accent-light) 88%, black);
    }

    :host-context(.dark) .habit-card-field--accent {
      color: var(--accent-dark);
    }

    :host-context(.dark) .habit-card:hover .habit-card-field--accent {
      color: color-mix(in srgb, var(--accent-dark) 85%, white);
    }

    .habit-card:hover .habit-card-field--circle {
      border-color: color-mix(
        in srgb,
        var(--brand-light-text-secondary) 65%,
        var(--brand-light-text-primary)
      ) !important;
    }

    :host-context(.dark) .habit-card:hover .habit-card-field--circle {
      border-color: color-mix(
        in srgb,
        var(--brand-text-secondary) 40%,
        var(--accent-dark)
      ) !important;
    }

    .habit-card:hover ::ng-deep .habit-card-weekdays {
      filter: brightness(0.9);
    }

    :host-context(.dark) .habit-card:hover ::ng-deep .habit-card-weekdays {
      filter: brightness(1.18);
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

    /* ── Completed base (nível 0) — fundo via overlay .habit-card-complete-bg ── */
    .habit-card--completed {
      border: 1px solid rgb(var(--accent-rgb-light) / 0.3);
    }

    :host-context(.dark) .habit-card--completed {
      border-color: rgb(var(--accent-rgb-dark) / 0.3);
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

      .habit-card-complete-band--sweep-in,
      .habit-card-complete-band--sweep-out {
        animation: none;
      }

      .habit-card-complete-band--sweep-in {
        transform: scaleX(1);
      }

      .habit-card-complete-band--sweep-out {
        transform: scaleX(0);
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
      class="habit-card relative rounded-xl p-4 motion-reduce:transition-none"
      [class.habit-card--completed]="completed()"
      [attr.data-streak-tier]="streakTier()"
      [class.border-l-4]="!completed() && streakTier() === 0"
      [class.border-l-brand-accent-orange]="!completed() && streakTier() === 0 && accent() === 'physical'"
      [class.border-l-brand-accent-purple]="!completed() && streakTier() === 0 && accent() === 'wellness'"
    >
      @if (showCompleteOverlay()) {
        <div class="habit-card-complete-bg" aria-hidden="true">
          @for (band of completeSweepBands; track band) {
            <div
              class="habit-card-complete-band"
              [class.habit-card-complete-band--sweep-in]="completeSweepPhase() === 'in'"
              [class.habit-card-complete-band--sweep-out]="completeSweepPhase() === 'out'"
              [attr.data-band]="band"
            ></div>
          }
        </div>
      }
      <div class="relative z-[1]">
        <div class="flex items-start justify-between gap-3 md:items-center">
          <div class="flex min-w-0 flex-1 gap-3">
            <div
              class="habit-card-day-count flex shrink-0 flex-col items-center gap-1.5 self-start"
            >
              <span
                class="flex size-5 items-center justify-center rounded-full border-2 transition-all duration-200 motion-reduce:transition-none"
                [class]="
                  completed()
                    ? 'border-brand-light-primary bg-brand-light-primary dark:border-brand-primary dark:bg-brand-primary'
                    : 'habit-card-field habit-card-field--circle border-brand-light-text-secondary/40 dark:border-brand-text-secondary/50'
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
                  class="habit-card-field habit-card-field--primary min-w-0 flex-1 font-medium"
                >
                  {{ displayTitle() }}
                </h2>
                <span
                  class="habit-card-field habit-card-field--secondary hidden shrink-0 text-xs italic md:inline"
                  >{{ time() }} · {{ category() }}</span
                >
              </div>

              <p class="habit-card-field habit-card-field--secondary mt-1 text-sm md:hidden">
                Min: {{ minimumAction() }}
              </p>

              <!-- Desktop -->
              <div class="hidden md:block">
                <app-weekday-schedule
                  class="habit-card-weekdays mt-2"
                  [selectedDays]="scheduleDays()"
                  [readonly]="true"
                />

                <div
                  class="habit-marquee-viewport mt-1 overflow-hidden select-none"
                  role="button"
                  tabindex="0"
                  [attr.aria-label]="marqueeAriaLabel()"
                  (click)="cycleMarqueeSpeed($event)"
                  (keydown.enter)="cycleMarqueeSpeed($event)"
                  (keydown.space)="cycleMarqueeSpeed($event)"
                >
                  <div
                    #marqueeTrack
                    class="habit-marquee-track habit-card-field habit-card-field--secondary text-sm"
                  >
                    @for (copy of [0, 1]; track copy) {
                      <span class="flex shrink-0 items-center gap-2 pr-8" [attr.aria-hidden]="copy === 1">
                        <span class="inline-flex items-center gap-1">
                          <i
                            class="bi bi-lightning-charge habit-card-field habit-card-field--accent shrink-0 text-xs"
                            aria-hidden="true"
                          ></i>
                          <span>{{ trigger1() }}</span>
                        </span>
                        <span class="leading-none opacity-50" aria-hidden="true">·</span>
                        <span class="inline-flex items-center gap-1">
                          <i
                            class="bi bi-lightning-charge habit-card-field habit-card-field--accent shrink-0 text-xs"
                            aria-hidden="true"
                          ></i>
                          <span>{{ trigger2() }}</span>
                        </span>
                        <span class="leading-none opacity-50" aria-hidden="true">·</span>
                        <span class="inline-flex items-center gap-1">
                          <i
                            class="bi bi-trophy habit-card-field habit-card-field--accent shrink-0 text-xs"
                            aria-hidden="true"
                          ></i>
                          <span>{{ motivation1() }}</span>
                        </span>
                        <span class="leading-none opacity-50" aria-hidden="true">·</span>
                        <span class="inline-flex items-center gap-1">
                          <i
                            class="bi bi-trophy habit-card-field habit-card-field--accent shrink-0 text-xs"
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
                    class="habit-card-field habit-card-field--secondary min-w-0 text-sm"
                  >
                    Mínimo: {{ minimumAction() }}
                  </p>

                  <div
                    class="habit-card-streak-status shrink-0 text-right"
                    [attr.aria-label]="streakStatusAriaLabel()"
                  >
                    @if (isDayOne() && !completed()) {
                      <p class="streak-status-title text-sm font-medium">
                        {{ dayOneMessage.title }}
                      </p>
                      <p class="streak-status-subtitle mt-0.5 text-sm">
                        {{ dayOneMessage.subtitle }}
                      </p>
                    } @else if (showMissMessage()) {
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
          </div>

          <div class="hidden shrink-0 md:block">
            @if (completed()) {
              <span
                class="habit-card-field habit-card-field--accent text-sm font-medium"
                >✓ Feito</span
              >
            } @else {
              <button
                type="button"
                class="habit-mark-btn rounded-lg bg-brand-light-primary px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
                [attr.aria-label]="'Marcar ' + name() + ' como feito'"
                (click)="markToggle.emit()"
              >
                Marcar ✓
              </button>
            }
          </div>
        </div>

        <div class="mt-1 flex flex-col gap-1 md:hidden">
          <app-weekday-schedule
            class="habit-card-weekdays"
            [selectedDays]="scheduleDays()"
            [readonly]="true"
          />

          <div
            class="habit-marquee-viewport overflow-hidden select-none"
            role="button"
            tabindex="0"
            [attr.aria-label]="marqueeAriaLabel()"
            (click)="cycleMarqueeSpeed($event)"
            (keydown.enter)="cycleMarqueeSpeed($event)"
            (keydown.space)="cycleMarqueeSpeed($event)"
          >
            <div
              #marqueeTrackMobile
              class="habit-marquee-track habit-card-field habit-card-field--secondary text-sm"
            >
              @for (copy of [0, 1]; track copy) {
                <span class="flex shrink-0 items-center gap-2 pr-8" [attr.aria-hidden]="copy === 1">
                  <span class="inline-flex items-center gap-1">
                    <i
                      class="bi bi-lightning-charge habit-card-field habit-card-field--accent shrink-0 text-xs"
                      aria-hidden="true"
                    ></i>
                    <span>{{ trigger1() }}</span>
                  </span>
                  <span class="leading-none opacity-50" aria-hidden="true">·</span>
                  <span class="inline-flex items-center gap-1">
                    <i
                      class="bi bi-lightning-charge habit-card-field habit-card-field--accent shrink-0 text-xs"
                      aria-hidden="true"
                    ></i>
                    <span>{{ trigger2() }}</span>
                  </span>
                  <span class="leading-none opacity-50" aria-hidden="true">·</span>
                  <span class="inline-flex items-center gap-1">
                    <i
                      class="bi bi-trophy habit-card-field habit-card-field--accent shrink-0 text-xs"
                      aria-hidden="true"
                    ></i>
                    <span>{{ motivation1() }}</span>
                  </span>
                  <span class="leading-none opacity-50" aria-hidden="true">·</span>
                  <span class="inline-flex items-center gap-1">
                    <i
                      class="bi bi-trophy habit-card-field habit-card-field--accent shrink-0 text-xs"
                      aria-hidden="true"
                    ></i>
                    <span>{{ motivation2() }}</span>
                  </span>
                </span>
              }
            </div>
          </div>

          <div
            class="habit-card-streak-status text-right"
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
              <p class="text-sm">
                <span class="streak-status-title font-medium">{{ mobileSequenceTitle() }}</span>
                <span class="streak-status-subtitle"> - {{ mobileSequenceSubtitle() }}</span>
              </p>
            }
          </div>

          <p
            class="habit-card-field habit-card-field--secondary text-right text-xs italic"
          >
            {{ time() }} · {{ category() }}
          </p>
        </div>

        <div class="mt-1 md:hidden">
          @if (completed()) {
            <div class="relative flex items-center justify-center py-1.5">
              <button
                type="button"
                class="habit-card-field habit-card-field--secondary absolute left-0 inline-flex items-center gap-1.5 text-xs underline-offset-2 hover:text-brand-light-text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
                [attr.aria-label]="'Desmarcar ' + name()"
                (click)="markToggle.emit()"
              >
                <i class="bi bi-arrow-counterclockwise text-[11px]" aria-hidden="true"></i>
                Desmarcar
              </button>
              <span class="habit-card-field habit-card-field--accent text-sm font-medium"
                >✓ Feito</span
              >
            </div>
          } @else {
            <div class="flex justify-end">
              <button
                type="button"
                class="habit-mark-btn w-[30%] rounded-lg bg-brand-light-primary px-3 py-1.5 text-center text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
                [attr.aria-label]="'Marcar ' + name() + ' como feito'"
                (click)="markToggle.emit()"
              >
                Marcar ✓
              </button>
            </div>
          }
        </div>

        @if (completed()) {
          <button
            type="button"
            class="habit-card-field habit-card-field--secondary mt-3 hidden items-center gap-1.5 text-xs underline-offset-2 hover:text-brand-light-text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary md:inline-flex dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
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
  private initialized = false;
  private previousCompleted = false;

  private readonly marqueeTrack = viewChild<ElementRef<HTMLElement>>('marqueeTrack');
  private readonly marqueeTrackMobile =
    viewChild<ElementRef<HTMLElement>>('marqueeTrackMobile');

  protected readonly completeSweepPhase = signal<CompleteSweepPhase>('idle');
  protected readonly marqueeSpeed = signal<MarqueeSpeed>('default');

  protected readonly showCompleteOverlay = computed(
    () => this.completed() || this.completeSweepPhase() === 'out',
  );

  protected readonly completeSweepBands = COMPLETE_SWEEP_BANDS;

  readonly name = input.required<string>();
  readonly displayMeta = input('');
  readonly scheduleDays = input.required<Weekday[]>();
  readonly time = input.required<string>();
  readonly category = input.required<string>();
  readonly trigger1 = input.required<string>();
  readonly trigger2 = input.required<string>();
  readonly motivation1 = input.required<string>();
  readonly motivation2 = input.required<string>();
  readonly minimumAction = input.required<string>();
  readonly dayCount = input<number>(0);
  readonly missCount = input<number>(0);
  readonly isDayOne = input(false);
  readonly completed = input.required<boolean>();
  readonly accent = input<HabitCardAccent>('default');

  readonly markToggle = output<void>();

  constructor() {
    effect((onCleanup) => {
      const isCompleted = this.completed();

      if (!this.initialized) {
        this.initialized = true;
        this.previousCompleted = isCompleted;
        return;
      }

      if (isCompleted && !this.previousCompleted) {
        this.completeSweepPhase.set('in');

        const timer = setTimeout(
          () => this.completeSweepPhase.set('idle'),
          COMPLETE_SWEEP_MS,
        );

        onCleanup(() => clearTimeout(timer));
      } else if (!isCompleted && this.previousCompleted) {
        this.completeSweepPhase.set('out');

        const timer = setTimeout(
          () => this.completeSweepPhase.set('idle'),
          COMPLETE_SWEEP_MS,
        );

        onCleanup(() => clearTimeout(timer));
      }

      this.previousCompleted = isCompleted;
    });
  }

  protected readonly displayTitle = computed(() =>
    formatHabitCardTitle(this.name(), this.displayMeta()),
  );

  protected readonly streakTier = computed(() => getStreakTier(this.dayCount()));

  protected readonly dayOneMessage = DAY_ONE_MESSAGE;

  /** Falta em dia esperado e ainda não marcou hoje → mensagem de risco */
  protected readonly showMissMessage = computed(
    () => !this.isDayOne() && this.missCount() > 0 && !this.completed(),
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

  protected readonly marqueeAriaLabel = computed(() => {
    const speedHint =
      this.marqueeSpeed() === 'fast'
        ? 'Velocidade rápida.'
        : this.marqueeSpeed() === 'paused'
          ? 'Pausado.'
          : 'Velocidade normal.';

    return `${this.marqueeLabel()} Toque para alterar a velocidade. ${speedHint}`;
  });

  protected cycleMarqueeSpeed(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const next = MARQUEE_SPEED_CYCLE[this.marqueeSpeed()];
    this.marqueeSpeed.set(next);
    this.applyMarqueeSpeed(next);
  }

  private applyMarqueeSpeed(speed: MarqueeSpeed): void {
    const tracks = [
      this.marqueeTrack()?.nativeElement,
      this.marqueeTrackMobile()?.nativeElement,
    ].filter((track): track is HTMLElement => track != null);

    for (const track of tracks) {
      const animation = track.getAnimations()[0];
      if (!animation) {
        continue;
      }

      switch (speed) {
        case 'fast':
          animation.playbackRate = MARQUEE_FAST_PLAYBACK_RATE;
          animation.play();
          break;
        case 'paused':
          animation.pause();
          break;
        default:
          animation.playbackRate = 1;
          animation.play();
          break;
      }
    }
  }

  protected readonly streakAtRiskHint = computed(() => {
    const remaining = STREAK_MISS_TOLERANCE - this.missCount();
    const label = remaining === 1 ? 'falta' : 'faltas';

    return `mais ${remaining} ${label} seguidas interrompem a sequência`;
  });

  protected readonly streakAtRiskEncouragement = computed(() => {
    const misses = this.missCount();
    const label = misses === 1 ? 'falta' : 'faltas';

    return `${misses} ${label}, não desanime, complete a tarefa hoje`;
  });

  protected readonly mobileSequenceTitle = computed(() => {
    if (this.isDayOne() && !this.completed()) {
      return this.dayOneMessage.title;
    }

    return this.streakTierMessage().title;
  });

  protected readonly mobileSequenceSubtitle = computed(() => {
    if (this.isDayOne() && !this.completed()) {
      return this.dayOneMessage.subtitle;
    }

    return this.streakTierMessage().subtitle;
  });

  protected readonly streakStatusAriaLabel = computed(() => {
    if (this.isDayOne() && !this.completed()) {
      return `${this.dayOneMessage.title}. ${this.dayOneMessage.subtitle}`;
    }

    if (this.showMissMessage()) {
      return `${this.streakAtRiskHint()}. ${this.streakAtRiskEncouragement()}`;
    }

    const message = this.streakTierMessage();
    return `${message.title}. ${message.subtitle}`;
  });

}
