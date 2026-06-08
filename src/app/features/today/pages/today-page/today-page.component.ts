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
import { DemoModeService } from '../../../../core/services/demo-mode.service';
import { HabitFormModalService } from '../../../../core/services/habit-form-modal.service';
import { HabitStorageService } from '../../../../core/services/habit-storage.service';
import {
  captureListItemPositions,
  flipListItems,
  shouldAnimateHabitList,
} from '../../../../core/utils/habit-list-flip.utils';
import {
  HABIT_SORT_OPTIONS,
  sortHabitsByPreference,
  type HabitSort,
} from '../../../../core/utils/habit-sort.utils';
import { AppNavComponent } from '../../../../shared/components/app-nav/app-nav.component';
import { DayProgressComponent } from '../../components/day-progress/day-progress.component';
import { HabitCardComponent } from '../../components/habit-card/habit-card.component';

type TodayEmptyState = 'none' | 'no-habits' | 'rest-day';

@Component({
  selector: 'app-today-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppNavComponent, DayProgressComponent, HabitCardComponent],
  template: `
    <app-nav activeTab="today" [hideNewHabit]="emptyState() === 'no-habits'" />

    <main
      class="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pb-28 md:px-6 md:pb-10 lg:px-8"
      [class]="showEmpty() ? 'pt-4 md:pt-5' : 'pt-6 md:pt-10'"
    >
      @if (!showEmpty()) {
        <header class="mb-6 space-y-4 md:mb-8">
          <h1
            class="font-display text-2xl font-semibold text-brand-light-text-primary md:text-3xl dark:text-brand-text-primary"
          >
            Hoje · {{ todayLabel() }}
          </h1>

          <app-day-progress [done]="doneCount()" [total]="totalCount()" />
        </header>
      }

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

          <button
            type="button"
            class="relative mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-light-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
            (click)="openHabitForm()"
          >
            <i class="bi bi-plus-lg text-xs" aria-hidden="true"></i>
            {{ emptyCtaLabel() }}
          </button>
        </section>
      } @else {
        @if (demoMode.isActive()) {
          <p
            class="mb-4 rounded-lg border border-brand-light-primary/25 bg-brand-light-primary/5 px-4 py-2 text-center text-xs text-brand-light-text-secondary dark:border-brand-primary/25 dark:bg-brand-primary/5 dark:text-brand-text-secondary"
          >
            Modo demonstrativo — alterações não são salvas no navegador.
          </p>
        }

        <div
          class="mb-3 flex min-h-9 items-center gap-3"
          [class.justify-end]="!editMode()"
          [class.justify-between]="editMode()"
        >
          @if (editMode()) {
            <div class="flex items-center gap-2">
              <label
                for="today-sort"
                class="shrink-0 text-xs font-medium text-brand-light-text-secondary dark:text-brand-text-secondary"
              >
                Ordenar
              </label>
              <select
                id="today-sort"
                class="min-w-[11rem] rounded-lg border border-brand-light-border bg-brand-light-bg px-3 py-1.5 text-xs text-brand-light-text-primary outline-none transition-colors focus:border-brand-light-primary focus:ring-1 focus:ring-brand-light-primary dark:border-brand-border dark:bg-brand-bg dark:text-brand-text-primary dark:focus:border-brand-primary dark:focus:ring-brand-primary"
                [value]="sort()"
                (change)="onSortChange($event)"
              >
                @for (option of sortOptions; track option.id) {
                  <option [value]="option.id">{{ option.label }}</option>
                }
              </select>
            </div>
          }

          <button
            type="button"
            class="rounded-lg border border-brand-light-border p-2 text-brand-light-text-secondary transition-colors hover:border-brand-light-primary/40 hover:bg-brand-light-bg hover:text-brand-light-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:border-brand-border dark:text-brand-text-secondary dark:hover:border-brand-primary/40 dark:hover:bg-brand-bg dark:hover:text-brand-primary dark:focus-visible:ring-brand-primary"
            [attr.aria-label]="editMode() ? 'Salvar ordenação' : 'Ordenar lista'"
            [attr.aria-pressed]="editMode()"
            (click)="toggleEditMode()"
          >
            @if (editMode()) {
              <i class="bi bi-check-lg text-sm" aria-hidden="true"></i>
            } @else {
              <i class="bi bi-funnel text-sm" aria-hidden="true"></i>
            }
          </button>
        </div>

        <ul #habitList class="space-y-3" role="list">
          @for (habit of habits(); track habit.id) {
            <li [attr.data-habit-id]="habit.id" class="will-change-transform">
              <app-habit-card
                [name]="habit.name"
                [displayMeta]="habit.displayMeta"
                [scheduleDays]="habit.scheduleDays"
                [time]="habit.time"
                [category]="habit.category"
                [trigger1]="habit.trigger1"
                [trigger2]="habit.trigger2"
                [motivation1]="habit.motivation1"
                [motivation2]="habit.motivation2"
                [minimumAction]="habit.minimumAction"
                [dayCount]="habit.dayCount"
                [missCount]="habit.missCount"
                [isDayOne]="habit.isDayOne"
                [completed]="habit.completed"
                [accent]="habit.accent"
                (markToggle)="toggleHabit(habit.id)"
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
  private readonly habitFormModal = inject(HabitFormModalService);
  private readonly injector = inject(Injector);
  protected readonly demoMode = inject(DemoModeService);

  private readonly habitListRef = viewChild<ElementRef<HTMLUListElement>>('habitList');
  private pendingFlipPositions: Map<string, DOMRect> | null = null;

  protected readonly sortOptions = HABIT_SORT_OPTIONS;
  protected readonly editMode = signal(false);
  protected readonly sort = signal<HabitSort>('days-desc');

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

  protected readonly todayLabel = computed(() => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date());
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

  protected toggleEditMode(): void {
    this.editMode.update((active) => !active);
  }

  protected onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as HabitSort;
    this.sort.set(value);
  }

  protected openHabitForm(): void {
    this.habitFormModal.open();
  }

  protected toggleHabit(id: string): void {
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

    this.scheduleListFlip();
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
