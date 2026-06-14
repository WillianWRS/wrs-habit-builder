import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoModeService } from '../../../../core/services/demo-mode.service';
import { CurrentDayService } from '../../../../core/services/current-day.service';
import { HabitStorageService } from '../../../../core/services/habit-storage.service';
import { ToastService } from '../../../../core/services/toast.service';
import { buildHabitNewLink } from '../../../../core/utils/habit-form-return-url.utils';
import { ViewportService } from '../../../../core/services/viewport.service';
import {
  captureListItemPositions,
  flipListItems,
  shouldAnimateHabitList,
} from '../../../../core/utils/habit-list-flip.utils';
import { formatTodayHeaderLabel } from '../../../../core/utils/date.utils';
import {
  sortHabitsByPreference,
  type HabitSort,
} from '../../../../core/utils/habit-sort.utils';
import { formatHabitCompletionAnnouncement } from '../../utils/today-completion-announcement.utils';
import { AppNavComponent } from '../../../../shared/components/app-nav/app-nav.component';
import { HabitSortSelectComponent } from '../../../../shared/components/habit-sort-select/habit-sort-select.component';
import { HabitTemplatePickerComponent } from '../../../../shared/components/habit-template-picker/habit-template-picker.component';
import { DayProgressComponent } from '../../components/day-progress/day-progress.component';
import { HabitCardComponent } from '../../components/habit-card/habit-card.component';

type TodayEmptyState = 'none' | 'no-habits' | 'rest-day';

@Component({
  selector: 'app-today-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppNavComponent, DayProgressComponent, HabitCardComponent, HabitSortSelectComponent, HabitTemplatePickerComponent, RouterLink],
  template: `
    <app-nav activeTab="today" />

    <main
      class="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pb-28 pt-6 md:px-6 md:pb-10 md:pt-10 lg:px-8"
    >
      <header
        class="sticky top-0 z-10 -mx-4 mb-6 space-y-4 border-b border-brand-light-border/50 bg-brand-light-bg/95 px-4 pb-4 pt-3 backdrop-blur-md backdrop-saturate-150 dark:border-brand-border/50 dark:bg-brand-bg/95 md:top-[4.25rem] md:-mx-6 md:mb-8 md:border-b-0 md:px-6 md:pb-6 md:pt-4 lg:-mx-8 lg:px-8"
      >
        <h1
          class="font-display text-2xl font-semibold text-brand-light-text-primary md:text-3xl dark:text-brand-text-primary"
        >
          Hoje · {{ todayLabel() }}
        </h1>

        <app-day-progress [done]="doneCount()" [total]="totalCount()" />
      </header>

      @if (showEmpty()) {
        <section
          class="relative flex w-full flex-col items-center overflow-hidden rounded-2xl border border-brand-light-border bg-brand-light-surface px-8 py-8 text-center shadow-sm dark:border-brand-border dark:bg-brand-surface md:px-10 md:py-10"
          aria-labelledby="empty-title"
        >
          <div
            class="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-brand-light-primary/10 blur-2xl dark:bg-brand-primary/10"
            aria-hidden="true"
          ></div>
          <div
            class="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full bg-brand-light-primary/5 blur-3xl dark:bg-brand-primary/5"
            aria-hidden="true"
          ></div>

          <div
            class="relative flex size-16 items-center justify-center rounded-2xl border border-brand-light-border bg-brand-light-bg dark:border-brand-border dark:bg-brand-bg"
            aria-hidden="true"
          >
            @if (emptyState() === 'rest-day') {
              <i
                class="bi bi-moon-stars text-3xl text-brand-light-text-secondary dark:text-brand-text-secondary"
              ></i>
            } @else {
              <i
                class="bi bi-inbox text-3xl text-brand-light-text-secondary dark:text-brand-text-secondary"
              ></i>
            }
          </div>

          <h2
            id="empty-title"
            class="relative mt-5 max-w-md font-display text-2xl font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
          >
            {{ emptyTitle() }}
          </h2>

          <a
            [routerLink]="newHabitLink.route"
            [queryParams]="newHabitLink.queryParams"
            class="relative mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-light-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
          >
            <i class="bi bi-plus-lg text-xs" aria-hidden="true"></i>
            {{ emptyCtaLabel() }}
          </a>

          @if (showTemplateOnboarding()) {
            <p
              class="relative mt-5 text-xs font-semibold uppercase tracking-wide text-brand-light-text-secondary dark:text-brand-text-secondary"
            >
              OU
            </p>
            <div class="relative mt-4 w-full max-w-3xl">
              <app-habit-template-picker returnPath="/today" />
            </div>
          }
        </section>
      } @else {
        @if (demoMode.isActive()) {
          <div class="mb-4 flex flex-col items-center gap-3">
            <p
              class="w-full rounded-lg border border-brand-light-primary/25 bg-brand-light-primary/5 px-4 py-2 text-center text-xs text-brand-light-text-secondary dark:border-brand-primary/25 dark:bg-brand-primary/5 dark:text-brand-text-secondary"
            >
              Modo demonstrativo — alterações não são salvas no navegador.
            </p>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg border border-brand-light-primary px-5 py-2.5 text-sm font-semibold text-brand-light-primary transition-colors hover:bg-brand-light-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:border-brand-primary dark:text-brand-primary dark:hover:bg-brand-primary/10 dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
              (click)="exitDemoMode()"
            >
              Sair do modo demonstrativo
            </button>
          </div>
        }

        <div class="mb-3 flex min-h-9 items-center justify-between gap-3">
          <app-habit-sort-select
            controlId="today-sort"
            labelText="Ordenar"
            [value]="sort()"
            (valueChange)="sort.set($event)"
          />

          @if (!demoMode.isActive()) {
            <a
              [routerLink]="newHabitLink.route"
              [queryParams]="newHabitLink.queryParams"
              class="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-light-primary px-4 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg md:px-4"
              aria-label="Novo hábito"
            >
              <i class="bi bi-plus-lg text-sm" aria-hidden="true"></i>
              <span class="hidden md:inline">Novo hábito</span>
            </a>
          }
        </div>

        <div
          class="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ completionAnnouncement() }}
        </div>

        <ul #habitList class="space-y-3" role="list">
          @for (habit of habits(); track habit.id) {
            <li [attr.data-habit-id]="habit.id" class="will-change-transform">
              <app-habit-card
                [habitId]="habit.id"
                [name]="habit.name"
                [displayMeta]="habit.displayMeta"
                [scheduleDays]="habit.scheduleDays"
                [time]="habit.time"
                [category]="habit.category"
                [marqueeItems]="habit.marqueeItems"
                [minimumAction]="habit.minimumAction"
                [dayCount]="habit.dayCount"
                [freezeReassurance]="habit.freezeReassurance"
                [dailyNote]="habit.dailyNote"
                [isDayOne]="habit.isDayOne"
                [completed]="habit.completed"
                [accent]="habit.accent"
                (markToggle)="toggleHabit(habit.id)"
                (dailyNoteChange)="saveDailyNote(habit.id, $event)"
              />
            </li>
          }
        </ul>
      }
    </main>
  `,
})
export class TodayPageComponent {
  private readonly storage = inject(HabitStorageService);
  private readonly currentDay = inject(CurrentDayService);
  private readonly viewport = inject(ViewportService);
  private readonly injector = inject(Injector);
  private readonly toast = inject(ToastService);
  protected readonly demoMode = inject(DemoModeService);
  protected readonly newHabitLink = buildHabitNewLink('/today');

  private readonly habitListRef = viewChild<ElementRef<HTMLUListElement>>('habitList');
  private pendingFlipPositions: Map<string, DOMRect> | null = null;

  protected readonly sort = signal<HabitSort>('time-asc');
  protected readonly completionAnnouncement = signal('');

  protected readonly habits = computed(() => {
    const source = this.demoMode.isActive()
      ? this.demoMode.cards()
      : this.storage.todayHabitCards();

    return sortHabitsByPreference(source, this.sort());
  });

  protected readonly emptyState = computed<TodayEmptyState>(() => {
    if (this.demoMode.isActive() || this.unsortedCount() > 0) {
      return 'none';
    }

    return this.storage.getActiveHabits().length > 0 ? 'rest-day' : 'no-habits';
  });

  protected readonly showEmpty = computed(() => this.emptyState() !== 'none');

  protected readonly emptyTitle = computed(() => {
    if (this.emptyState() === 'rest-day') {
      const count = this.storage.getActiveHabits().length;
      const habitsLabel = count === 1 ? '1 hábito ativo' : `${count} hábitos ativos`;
      const verb = count === 1 ? 'não é' : 'não são';

      return `Você tem ${habitsLabel} mas ${verb} para hoje, aproveite o dia ou crie um hábito pra hoje agora`;
    }

    return 'Construa hábitos agora';
  });

  protected readonly emptyCtaLabel = computed(() =>
    this.emptyState() === 'rest-day'
      ? 'Criar hábito pra hoje'
      : 'Criar primeiro hábito',
  );

  protected readonly showTemplateOnboarding = computed(
    () => this.showEmpty() && !this.demoMode.isActive(),
  );

  protected readonly todayLabel = computed(() => {
    const date = this.currentDay.today();
    return formatTodayHeaderLabel(date, this.viewport.isMobile());
  });

  protected readonly doneCount = computed(
    () => this.habits().filter((habit) => habit.completed).length,
  );

  protected readonly totalCount = computed(() => this.habits().length);

  private readonly unsortedCount = computed(() =>
    this.demoMode.isActive()
      ? this.demoMode.cards().length
      : this.storage.todayHabitCards().length,
  );

  protected exitDemoMode(): void {
    this.demoMode.deactivate();
  }

  protected toggleHabit(id: string): void {
    const habit = this.habits().find((entry) => entry.id === id);

    if (!habit) {
      return;
    }

    const wasCompleted = habit.completed;
    const doneBefore = this.doneCount();
    const total = this.totalCount();

    if (shouldAnimateHabitList()) {
      const list = this.habitListRef()?.nativeElement;

      if (list) {
        this.pendingFlipPositions = captureListItemPositions(list);
      }
    }

    if (this.demoMode.isActive()) {
      this.demoMode.toggleHabit(id);
    } else {
      this.storage.toggleCompletion(id);
    }

    const doneAfter = wasCompleted ? doneBefore - 1 : doneBefore + 1;
    const isNowCompleted = !wasCompleted;

    this.announceCompletion(
      formatHabitCompletionAnnouncement(
        habit.name,
        isNowCompleted,
        doneAfter,
        total,
      ),
    );

    this.scheduleListFlip();
  }

  protected saveDailyNote(habitId: string, note: string): void {
    if (this.demoMode.isActive()) {
      return;
    }

    this.storage.upsertDailyNote(habitId, this.currentDay.todayKey(), note);
    this.toast.showSuccess('Nota salva');
  }

  private announceCompletion(message: string): void {
    this.completionAnnouncement.set('');
    queueMicrotask(() => this.completionAnnouncement.set(message));
  }

  private scheduleListFlip(): void {
    if (!this.pendingFlipPositions) {
      return;
    }

    const previousPositions = this.pendingFlipPositions;
    this.pendingFlipPositions = null;

    afterNextRender(
      () => {
        const list = this.habitListRef()?.nativeElement;

        if (!list) {
          return;
        }

        flipListItems(list, previousPositions);
      },
      { injector: this.injector },
    );
  }
}
