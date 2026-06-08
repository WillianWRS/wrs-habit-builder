import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HabitFormModalService } from '../../../../core/services/habit-form-modal.service';
import { HabitStorageService } from '../../../../core/services/habit-storage.service';
import { AppNavComponent } from '../../../../shared/components/app-nav/app-nav.component';
import type { HabitListCardView } from '../../../../core/models/today-habit-card.model';
import {
  HABIT_SORT_OPTIONS,
  sortHabitsByPreference,
  type HabitSort,
} from '../../../../core/utils/habit-sort.utils';
import { HabitListCardComponent } from '../../components/habit-list-card/habit-list-card.component';
import { HabitDeleteConfirmModalComponent } from '../../../../shared/components/habit-delete-confirm-modal/habit-delete-confirm-modal.component';

type PendingDelete = { id: string; name: string };

export type HabitsFilter = 'active' | 'archived' | 'today';

const FILTER_OPTIONS: ReadonlyArray<{ id: HabitsFilter; label: string }> = [
  { id: 'active', label: 'Ativos' },
  { id: 'archived', label: 'Arquivados' },
  { id: 'today', label: 'Na tela Hoje' },
];

@Component({
  selector: 'app-habits-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppNavComponent, HabitListCardComponent, HabitDeleteConfirmModalComponent],
  template: `
    <app-nav activeTab="habits" />

    <main
      class="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pb-28 pt-6 md:px-6 md:pb-10 md:pt-10 lg:px-8"
    >
      <header class="mb-4 flex items-center justify-between gap-4 md:mb-6">
        <h1
          class="font-display text-2xl font-semibold text-brand-light-text-primary md:text-3xl dark:text-brand-text-primary"
        >
          Meus hábitos
        </h1>
        <span
          class="rounded-full border border-brand-light-border px-3 py-1 text-xs font-medium text-brand-light-text-secondary dark:border-brand-border dark:text-brand-text-secondary"
        >
          {{ habits().length }}
          {{ habits().length === 1 ? 'hábito' : 'hábitos' }}
        </span>
      </header>

      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          class="flex flex-wrap gap-2"
          role="group"
          aria-label="Filtrar hábitos"
        >
          @for (option of filterOptions; track option.id) {
            <button
              type="button"
              class="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:focus-visible:ring-brand-primary"
              [class]="
                filter() === option.id
                  ? 'border-brand-light-primary bg-brand-light-primary text-white dark:border-brand-primary dark:bg-brand-primary dark:text-brand-bg'
                  : 'border-brand-light-border text-brand-light-text-secondary hover:border-brand-light-primary/40 hover:text-brand-light-text-primary dark:border-brand-border dark:text-brand-text-secondary dark:hover:border-brand-primary/40 dark:hover:text-brand-text-primary'
              "
              [attr.aria-pressed]="filter() === option.id"
              (click)="setFilter(option.id)"
            >
              <span class="inline-flex items-center gap-1.5">
                {{ option.label }}
                <span
                  class="tabular-nums"
                  [class.opacity-75]="filter() === option.id"
                >
                  {{ filterCounts()[option.id] }}
                </span>
              </span>
            </button>
          }
        </div>

        <div class="flex items-center gap-2">
          <label
            for="habits-sort"
            class="shrink-0 text-xs font-medium text-brand-light-text-secondary dark:text-brand-text-secondary"
          >
            Ordenar
          </label>
          <select
            id="habits-sort"
            class="min-w-[11rem] rounded-lg border border-brand-light-border bg-brand-light-bg px-3 py-1.5 text-xs text-brand-light-text-primary outline-none transition-colors focus:border-brand-light-primary focus:ring-1 focus:ring-brand-light-primary dark:border-brand-border dark:bg-brand-bg dark:text-brand-text-primary dark:focus:border-brand-primary dark:focus:ring-brand-primary"
            [value]="sort()"
            (change)="onSortChange($event)"
          >
            @for (option of sortOptions; track option.id) {
              <option [value]="option.id">{{ option.label }}</option>
            }
          </select>
        </div>
      </div>

      @if (showEmpty()) {
        <section
          class="flex flex-col items-center rounded-2xl border border-dashed border-brand-light-border bg-brand-light-surface px-8 py-12 text-center dark:border-brand-border dark:bg-brand-surface"
          aria-labelledby="habits-empty-title"
        >
          <i
            class="bi bi-funnel text-3xl text-brand-light-text-secondary dark:text-brand-text-secondary"
            aria-hidden="true"
          ></i>
          <h2
            id="habits-empty-title"
            class="mt-4 font-display text-xl font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
          >
            {{ emptyTitle() }}
          </h2>
          <p class="mt-2 max-w-sm text-sm text-brand-light-text-secondary dark:text-brand-text-secondary">
            {{ emptyMessage() }}
          </p>
        </section>
      } @else {
        <ul class="space-y-3" role="list">
          @for (habit of habits(); track habit.id) {
            <li>
              <app-habit-list-card
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
                [accent]="habit.accent"
                [archived]="habit.archived"
                (edit)="editHabit(habit.id)"
                (archive)="archiveHabit(habit.id)"
                (restore)="restoreHabit(habit.id)"
                (deletePermanently)="openDeleteConfirm(habit.id, habit.name)"
              />
            </li>
          }
        </ul>
      }
    </main>

    @if (pendingDelete(); as pending) {
      <app-habit-delete-confirm-modal
        [habitName]="pending.name"
        (confirmed)="confirmDelete()"
        (dismissed)="cancelDelete()"
      />
    }
  `,
})
export class HabitsPageComponent {
  private readonly storage = inject(HabitStorageService);
  private readonly habitFormModal = inject(HabitFormModalService);

  protected readonly filterOptions = FILTER_OPTIONS;
  protected readonly sortOptions = HABIT_SORT_OPTIONS;
  protected readonly filter = signal<HabitsFilter>('active');
  protected readonly sort = signal<HabitSort>('days-desc');
  protected readonly pendingDelete = signal<PendingDelete | null>(null);

  protected readonly filterCounts = computed(() => {
    const all = this.storage.habitListCards();

    return {
      active: all.filter((habit) => !habit.archived).length,
      archived: all.filter((habit) => habit.archived).length,
      today: all.filter(
        (habit) => !habit.archived && this.storage.isHabitOnToday(habit.id),
      ).length,
    } satisfies Record<HabitsFilter, number>;
  });

  protected readonly habits = computed(() => {
    const all = this.storage.habitListCards();
    const currentFilter = this.filter();
    let filtered: HabitListCardView[];

    if (currentFilter === 'archived') {
      filtered = all.filter((habit) => habit.archived);
    } else if (currentFilter === 'today') {
      filtered = all.filter(
        (habit) => !habit.archived && this.storage.isHabitOnToday(habit.id),
      );
    } else {
      filtered = all.filter((habit) => !habit.archived);
    }

    return sortHabitsByPreference(filtered, this.sort());
  });

  protected readonly showEmpty = computed(() => this.habits().length === 0);

  protected readonly emptyTitle = computed(() => {
    switch (this.filter()) {
      case 'archived':
        return 'Nenhum hábito arquivado';
      case 'today':
        return 'Nenhum hábito na tela Hoje';
      default:
        return 'Nenhum hábito cadastrado';
    }
  });

  protected readonly emptyMessage = computed(() => {
    switch (this.filter()) {
      case 'archived':
        return 'Hábitos arquivados aparecem aqui. O histórico de conclusões é preservado.';
      case 'today':
        return 'Marque "Exibir na tela Hoje" ao criar ou editar um hábito ativo.';
      default:
        return 'Crie seu primeiro hábito pelo botão Novo hábito na navbar.';
    }
  });

  protected setFilter(value: HabitsFilter): void {
    this.filter.set(value);
  }

  protected onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as HabitSort;
    this.sort.set(value);
  }

  protected editHabit(habitId: string): void {
    this.habitFormModal.openForEdit(habitId);
  }

  protected archiveHabit(habitId: string): void {
    this.storage.archiveHabit(habitId);
  }

  protected restoreHabit(habitId: string): void {
    this.storage.restoreHabit(habitId);
  }

  protected openDeleteConfirm(habitId: string, habitName: string): void {
    this.pendingDelete.set({ id: habitId, name: habitName });
  }

  protected cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  protected confirmDelete(): void {
    const pending = this.pendingDelete();

    if (!pending) {
      return;
    }

    this.storage.permanentlyDeleteHabit(pending.id);
    this.pendingDelete.set(null);
  }
}
