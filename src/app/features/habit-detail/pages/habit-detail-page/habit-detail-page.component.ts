import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { WEEKDAY_SCHEDULE_ITEMS } from '../../../../core/constants/weekday-schedule.constants';
import { CurrentDayService } from '../../../../core/services/current-day.service';
import { HabitStorageService } from '../../../../core/services/habit-storage.service';
import { resolveHabitDisplayMeta } from '../../../../core/utils/habit-meta.utils';
import { computeHabitAdherenceSnapshot } from '../../../../core/utils/habit-adherence.utils';
import {
  computeFreezeBalance,
  computeHabitStreakSnapshot,
} from '../../../../core/utils/habit-streak.utils';
import { AppNavComponent } from '../../../../shared/components/app-nav/app-nav.component';
import { MonthHeatmapComponent } from '../../../progress/components/month-heatmap/month-heatmap.component';
import { StreakLevelsModalComponent } from '../../components/streak-levels-modal/streak-levels-modal.component';
import {
  getStreakTier,
  getStreakTierTitle,
} from '../../../today/components/habit-card/habit-card-streak.utils';

@Component({
  selector: 'app-habit-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppNavComponent, RouterLink, MonthHeatmapComponent, StreakLevelsModalComponent],
  template: `
    <app-nav activeTab="habits" />

    <main
      class="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pb-28 pt-6 md:px-6 md:pb-10 md:pt-10 lg:px-8"
    >
      <header class="mb-6 flex items-center justify-between gap-3 md:mb-8">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-brand-light-text-secondary transition-colors hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:text-brand-text-secondary dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
          aria-label="Voltar para hábitos"
          (click)="goBack()"
        >
          <i class="bi bi-arrow-left" aria-hidden="true"></i>
          Voltar
        </button>

        @if (habit(); as currentHabit) {
          <a
            [routerLink]="['/habits', currentHabit.id, 'edit']"
            class="inline-flex items-center gap-1.5 rounded-lg border border-brand-light-border px-3 py-1.5 text-sm font-medium text-brand-light-text-secondary transition-colors hover:border-brand-light-primary/50 hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:border-brand-border dark:text-brand-text-secondary dark:hover:border-brand-primary/50 dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
          >
            <i class="bi bi-pencil" aria-hidden="true"></i>
            Editar
          </a>
        }
      </header>

      @if (habit(); as currentHabit) {
        <section class="mb-6 rounded-2xl border border-brand-light-card-border bg-brand-light-surface p-5 shadow-sm dark:border-brand-border dark:bg-brand-surface">
          <p class="text-xs uppercase tracking-wide text-brand-light-text-secondary dark:text-brand-text-secondary">
            Progresso do hábito
          </p>
          <h1 class="mt-2 font-display text-2xl font-semibold text-brand-light-text-primary md:text-3xl dark:text-brand-text-primary">
            {{ currentHabit.name }}
          </h1>
          <p class="mt-2 text-sm text-brand-light-text-secondary dark:text-brand-text-secondary">
            {{ habitSummary() }}
          </p>

          <div class="mt-4 flex flex-wrap gap-2">
            <span
              class="inline-flex items-center rounded-full bg-brand-light-primary/10 px-3 py-1 text-xs font-semibold text-brand-light-primary dark:bg-brand-primary/15 dark:text-brand-primary"
              [attr.aria-label]="'Adesão ' + adherence().sevenDays.windowLabel"
            >
              {{ adherence().sevenDays.percentage }}% · {{ adherence().sevenDays.windowLabel }}
            </span>
            <span
              class="inline-flex items-center rounded-full bg-brand-light-primary/10 px-3 py-1 text-xs font-semibold text-brand-light-primary dark:bg-brand-primary/15 dark:text-brand-primary"
              [attr.aria-label]="'Adesão ' + adherence().thirtyDays.windowLabel"
            >
              {{ adherence().thirtyDays.percentage }}% · {{ adherence().thirtyDays.windowLabel }}
            </span>
          </div>
        </section>

        <section class="mb-6 flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.45fr)_minmax(16rem,0.85fr)] lg:items-start lg:gap-5">
          <div class="w-full md:max-w-lg md:self-start lg:max-w-xl lg:justify-self-start">
            <app-month-heatmap
              mode="habit"
              [year]="visibleYear()"
              [month]="visibleMonth()"
              [habit]="currentHabit"
              [habits]="[currentHabit]"
              [completions]="habitCompletions()"
              [freezeUsed]="habitFreezeUsed()"
              [todayKey]="currentDay.todayKey()"
              (monthChange)="onMonthChange($event)"
            />

            <div class="mt-3 flex flex-wrap items-center gap-3 text-xs text-brand-light-text-secondary dark:text-brand-text-secondary">
              <span class="inline-flex items-center gap-1.5">
                <span class="size-2.5 rounded-full bg-brand-light-primary dark:bg-brand-primary"></span>
                Feito
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="size-2.5 rounded-full bg-sky-500/70 dark:bg-sky-400/70"></span>
                Protegido
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="size-2.5 rounded-full bg-zinc-500/35 dark:bg-zinc-400/30"></span>
                Perdido
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="size-2.5 rounded-full bg-brand-light-bg dark:bg-brand-bg"></span>
                Não esperado
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-1">
            <article class="rounded-xl border border-brand-light-border bg-brand-light-surface p-4 dark:border-brand-border dark:bg-brand-surface">
              <p class="text-xs uppercase tracking-wide text-brand-light-text-secondary dark:text-brand-text-secondary">Recorde</p>
              <p class="mt-2 text-xl font-semibold text-brand-light-text-primary dark:text-brand-text-primary">
                {{ streak().bestStreak }} dias
              </p>
            </article>

            <article class="rounded-xl border border-brand-light-border bg-brand-light-surface p-4 dark:border-brand-border dark:bg-brand-surface">
              <p class="text-xs uppercase tracking-wide text-brand-light-text-secondary dark:text-brand-text-secondary">Sequência atual</p>
              <p class="mt-2 text-xl font-semibold text-brand-light-text-primary dark:text-brand-text-primary">
                {{ streak().currentStreak }} dias
              </p>
            </article>

            <article class="rounded-xl border border-brand-light-border bg-brand-light-surface p-4 dark:border-brand-border dark:bg-brand-surface">
              <div class="flex items-start justify-between gap-2">
                <p class="text-xs uppercase tracking-wide text-brand-light-text-secondary dark:text-brand-text-secondary">
                  Nível atual
                </p>
                <button
                  type="button"
                  class="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-brand-light-primary/60 text-[11px] font-semibold text-brand-light-primary transition-colors hover:bg-brand-light-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:border-brand-primary/60 dark:text-brand-primary dark:hover:bg-brand-primary/10 dark:focus-visible:ring-brand-primary"
                  aria-label="Entender níveis de sequência"
                  (click)="openStreakLevelsModal()"
                >
                  ?
                </button>
              </div>
              <p class="mt-2 text-xl font-semibold text-brand-light-text-primary dark:text-brand-text-primary">
                {{ streakLevelTitle() }}
              </p>
            </article>

            <article class="rounded-xl border border-brand-light-border bg-brand-light-surface p-4 dark:border-brand-border dark:bg-brand-surface">
              <p class="text-xs uppercase tracking-wide text-brand-light-text-secondary dark:text-brand-text-secondary">Adesão 30d</p>
              <p class="mt-2 text-xl font-semibold text-brand-light-text-primary dark:text-brand-text-primary">
                {{ adherence().thirtyDays.percentage }}%
              </p>
              <p class="mt-1 text-xs text-brand-light-text-secondary dark:text-brand-text-secondary">
                {{ adherence().thirtyDays.completedDays }} de
                {{ adherence().thirtyDays.expectedDays }} dias feitos
              </p>
            </article>

            <article class="rounded-xl border border-brand-light-border bg-brand-light-surface p-4 dark:border-brand-border dark:bg-brand-surface">
              <div class="flex items-start justify-between gap-2">
                <p class="text-xs uppercase tracking-wide text-brand-light-text-secondary dark:text-brand-text-secondary">
                  Proteção da semana
                </p>
                <div class="relative">
                  <button
                    type="button"
                    class="inline-flex size-5 items-center justify-center rounded-full border border-brand-light-primary/60 text-[11px] font-semibold text-brand-light-primary transition-colors hover:bg-brand-light-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:border-brand-primary/60 dark:text-brand-primary dark:hover:bg-brand-primary/10 dark:focus-visible:ring-brand-primary"
                    aria-label="Entender proteção da semana"
                    [attr.aria-expanded]="showProtectionTooltip()"
                    (click)="toggleProtectionTooltip()"
                    (blur)="hideProtectionTooltip()"
                  >
                    ?
                  </button>

                  @if (showProtectionTooltip()) {
                    <div
                      role="tooltip"
                      class="absolute bottom-full right-0 z-20 mb-2 w-60 rounded-md border border-brand-light-primary/45 bg-brand-light-surface px-3 py-2 text-[11px] font-medium leading-relaxed text-brand-light-primary shadow-lg dark:border-brand-primary/45 dark:bg-brand-surface dark:text-brand-primary"
                    >
                      A proteção cobre automaticamente uma falta em dia esperado
                      na semana, mantendo sua sequência.
                    </div>
                  }
                </div>
              </div>
              <p class="mt-2 text-xl font-semibold text-brand-light-text-primary dark:text-brand-text-primary">
                {{ freezeBalance().available }}/{{ freezeBalance().cap }}
              </p>
              <p class="mt-1 text-xs text-brand-light-text-secondary dark:text-brand-text-secondary">
                Total concluído: {{ streak().totalCompletions }}
              </p>
            </article>
          </div>
        </section>

        @if (showStreakLevelsModal()) {
          <app-streak-levels-modal (dismissed)="closeStreakLevelsModal()" />
        }

        <section class="rounded-2xl border border-brand-light-border bg-brand-light-surface p-5 dark:border-brand-border dark:bg-brand-surface">
          <h2 class="font-display text-lg font-semibold text-brand-light-text-primary dark:text-brand-text-primary">
            Contexto do hábito
          </h2>
          <dl class="mt-4 space-y-3">
            <div>
              <dt class="text-xs uppercase tracking-wide text-brand-light-text-secondary dark:text-brand-text-secondary">Gatilho</dt>
              <dd class="mt-1 text-sm text-brand-light-text-primary dark:text-brand-text-primary">{{ triggerText() }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-brand-light-text-secondary dark:text-brand-text-secondary">Ação mínima</dt>
              <dd class="mt-1 text-sm text-brand-light-text-primary dark:text-brand-text-primary">{{ currentHabit.minimumAction }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-brand-light-text-secondary dark:text-brand-text-secondary">Frequência</dt>
              <dd class="mt-1 text-sm text-brand-light-text-primary dark:text-brand-text-primary">{{ scheduleLabel() }}</dd>
            </div>
          </dl>
        </section>
      }
    </main>
  `,
})
export class HabitDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly storage = inject(HabitStorageService);
  protected readonly currentDay = inject(CurrentDayService);

  protected readonly visibleYear = signal(this.currentDay.today().getFullYear());
  protected readonly visibleMonth = signal(this.currentDay.today().getMonth());
  protected readonly showProtectionTooltip = signal(false);
  protected readonly showStreakLevelsModal = signal(false);

  private readonly routeHabitId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: this.route.snapshot.paramMap.get('id') },
  );

  protected readonly habit = computed(() => {
    const id = this.routeHabitId();

    if (!id) {
      return null;
    }

    return this.storage.getHabitById(id) ?? null;
  });

  protected readonly habitCompletions = computed(() => {
    const habit = this.habit();

    if (!habit) {
      return [];
    }

    return this.storage
      .completionsReadonly()
      .filter((completion) => completion.habitId === habit.id);
  });

  protected readonly habitFreezeUsed = computed(() => {
    const habit = this.habit();

    if (!habit) {
      return [];
    }

    return this.storage
      .freezeUsedReadonly()
      .filter((event) => event.habitId === habit.id);
  });

  protected readonly adherence = computed(() => {
    const habit = this.habit();

    if (!habit) {
      return {
        sevenDays: { windowDays: 7 as const, windowLabel: '7d', trackedDays: 0, expectedDays: 0, completedDays: 0, percentage: 0 },
        thirtyDays: { windowDays: 30 as const, windowLabel: '30d', trackedDays: 0, expectedDays: 0, completedDays: 0, percentage: 0 },
      };
    }

    return computeHabitAdherenceSnapshot(
      habit,
      this.storage.completionsReadonly(),
      this.currentDay.today(),
    );
  });

  protected readonly streak = computed(() => {
    const habit = this.habit();

    if (!habit) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        totalCompletions: 0,
        isDayOne: true,
      };
    }

    return computeHabitStreakSnapshot(
      habit,
      this.storage.completionsReadonly(),
      this.storage.freezeUsedReadonly(),
      this.currentDay.today(),
    );
  });

  protected readonly streakLevelTitle = computed(() =>
    getStreakTierTitle(getStreakTier(this.streak().currentStreak)),
  );

  protected readonly freezeBalance = computed(() => {
    const habit = this.habit();

    if (!habit) {
      return { available: 0, cap: 1 };
    }

    return computeFreezeBalance(
      habit,
      this.storage.freezeUsedReadonly(),
      'free',
      this.currentDay.today(),
    );
  });

  protected readonly scheduleLabel = computed(() => {
    const habit = this.habit();

    if (!habit || habit.scheduleDays.length === 0) {
      return 'Sem frequência definida';
    }

    return habit.scheduleDays
      .slice()
      .sort((left, right) => left - right)
      .map(
        (weekday) =>
          WEEKDAY_SCHEDULE_ITEMS.find((item) => item.weekday === weekday)
            ?.fullLabel ?? '',
      )
      .filter(Boolean)
      .join(' · ');
  });

  protected readonly habitSummary = computed(() => {
    const habit = this.habit();

    if (!habit) {
      return '';
    }

    return resolveHabitDisplayMeta(habit, this.currentDay.today());
  });

  protected readonly triggerText = computed(() => {
    const habit = this.habit();

    if (!habit) {
      return '';
    }

    const visibleTriggers = habit.triggers
      .filter((trigger) => trigger.visible && trigger.text.trim().length > 0)
      .map((trigger) => trigger.text.trim());

    if (visibleTriggers.length === 0) {
      return 'Defina um gatilho para facilitar a consistência.';
    }

    return visibleTriggers.join(' · ');
  });

  constructor() {
    effect(() => {
      const id = this.routeHabitId();

      if (!id) {
        void this.router.navigate(['/habits']);
        return;
      }

      if (!this.habit()) {
        void this.router.navigate(['/habits']);
      }
    });
  }

  protected onMonthChange(next: { year: number; month: number }): void {
    this.visibleYear.set(next.year);
    this.visibleMonth.set(next.month);
  }

  protected goBack(): void {
    void this.router.navigate(['/habits']);
  }

  protected toggleProtectionTooltip(): void {
    this.showProtectionTooltip.update((visible) => !visible);
  }

  protected hideProtectionTooltip(): void {
    this.showProtectionTooltip.set(false);
  }

  protected openStreakLevelsModal(): void {
    this.showStreakLevelsModal.set(true);
  }

  protected closeStreakLevelsModal(): void {
    this.showStreakLevelsModal.set(false);
  }
}
