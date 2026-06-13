import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DemoModeService } from '../../../../core/services/demo-mode.service';
import { HabitStorageService } from '../../../../core/services/habit-storage.service';
import { ToastService } from '../../../../core/services/toast.service';
import { buildHabitNewLink } from '../../../../core/utils/habit-form-return-url.utils';
import { AppNavComponent } from '../../../../shared/components/app-nav/app-nav.component';
import type { HabitListCardView } from '../../../../core/models/today-habit-card.model';
import {
  sortHabitsByPreference,
  type HabitSort,
} from '../../../../core/utils/habit-sort.utils';
import { HabitListCardComponent } from '../../components/habit-list-card/habit-list-card.component';
import { HabitDeleteConfirmModalComponent } from '../../../../shared/components/habit-delete-confirm-modal/habit-delete-confirm-modal.component';
import { HabitSortSelectComponent } from '../../../../shared/components/habit-sort-select/habit-sort-select.component';
import { HabitTemplatePickerComponent } from '../../../../shared/components/habit-template-picker/habit-template-picker.component';

interface PendingDelete { id: string; name: string }

export type HabitsFilter = 'active' | 'archived' | 'today';

const FILTER_OPTIONS: readonly { id: HabitsFilter; label: string }[] = [
  { id: 'active', label: 'Ativos' },
  { id: 'today', label: 'Na tela Hoje' },
  { id: 'archived', label: 'Arquivados' },
];
const LIST_ITEM_ANIMATION_MS = 320;

@Component({
  selector: 'app-habits-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppNavComponent,
    HabitListCardComponent,
    HabitDeleteConfirmModalComponent,
    HabitSortSelectComponent,
    HabitTemplatePickerComponent,
    RouterLink,
  ],
  styles: `
    .habit-list-item {
      overflow: hidden;
      transform-origin: top;
    }

    .habit-list-item--exiting {
      pointer-events: none;
      animation: habit-list-item-collapse ${LIST_ITEM_ANIMATION_MS}ms ease-out
        forwards;
    }

    .habit-list-item--entering {
      animation: habit-list-item-expand ${LIST_ITEM_ANIMATION_MS}ms ease-out;
    }

    @keyframes habit-list-item-collapse {
      from {
        max-height: 32rem;
        opacity: 1;
        transform: translateY(0);
      }

      to {
        max-height: 0;
        opacity: 0;
        transform: translateY(-4px);
      }
    }

    @keyframes habit-list-item-expand {
      from {
        max-height: 0;
        opacity: 0;
        transform: translateY(-4px);
      }

      to {
        max-height: 32rem;
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .habit-list-item--exiting,
      .habit-list-item--entering {
        animation: none;
      }
    }
  `,
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

      @if (!showEmpty()) {
        <div class="mb-6 grid grid-cols-[1fr_auto] items-center gap-4">
          <div class="flex flex-col gap-2">
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

            <app-habit-sort-select
              controlId="habits-sort"
              labelText="Ordenar"
              [value]="sort()"
              (valueChange)="sort.set($event)"
            />
          </div>

          @if (!demoMode.isActive()) {
            <a
              [routerLink]="newHabitLink.route"
              [queryParams]="newHabitLink.queryParams"
              class="inline-flex h-9 shrink-0 items-center justify-center gap-2 self-center rounded-lg bg-brand-light-primary px-4 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
              aria-label="Novo hábito"
            >
              <i class="bi bi-plus-lg text-sm" aria-hidden="true"></i>
              <span class="hidden md:inline">Novo hábito</span>
            </a>
          }
        </div>
      } @else {
        <div class="mb-6 flex flex-col gap-3">
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
        </div>
      }

      @if (showEmpty()) {
        <section
          class="flex flex-col items-center rounded-2xl border px-8 py-8 text-center md:px-10 md:py-10"
          [class]="
            showCreateEmptyCta()
              ? 'relative w-full overflow-hidden border-brand-light-border bg-brand-light-surface shadow-sm dark:border-brand-border dark:bg-brand-surface'
              : 'border-dashed border-brand-light-border bg-brand-light-surface dark:border-brand-border dark:bg-brand-surface'
          "
          aria-labelledby="habits-empty-title"
        >
          @if (showCreateEmptyCta()) {
            <div
              class="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-brand-light-primary/10 blur-2xl dark:bg-brand-primary/10"
              aria-hidden="true"
            ></div>
            <div
              class="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full bg-brand-light-primary/5 blur-3xl dark:bg-brand-primary/5"
              aria-hidden="true"
            ></div>

            <h2
              id="habits-empty-title"
              class="relative max-w-md font-display text-2xl font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
            >
              {{ emptyTitle() }}
            </h2>

            <a
              [routerLink]="newHabitLink.route"
              [queryParams]="newHabitLink.queryParams"
              class="relative mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-light-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
            >
              <i class="bi bi-plus-lg text-xs" aria-hidden="true"></i>
              Criar primeiro hábito
            </a>

            <p
              class="relative mt-5 text-xs font-semibold uppercase tracking-wide text-brand-light-text-secondary dark:text-brand-text-secondary"
            >
              OU
            </p>
            <div class="relative mt-4 w-full max-w-3xl">
              <app-habit-template-picker returnPath="/habits" />
            </div>
          } @else {
            <i
              class="bi bi-funnel text-3xl text-brand-light-text-secondary dark:text-brand-text-secondary"
              aria-hidden="true"
            ></i>
            <h2
              id="habits-empty-title"
              class="mt-4 font-display text-xl font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
            >
              @if (filter() === 'today') {
                Nenhum hábito na tela
                <span class="text-brand-light-primary dark:text-brand-primary">Hoje</span>
              } @else {
                {{ emptyTitle() }}
              }
            </h2>
            <p class="mt-2 max-w-sm text-sm text-brand-light-text-secondary dark:text-brand-text-secondary">
              {{ emptyMessage() }}
            </p>
          }
        </section>
      } @else {
        <ul class="space-y-3" role="list">
          @for (habit of habits(); track habit.id) {
            <li
              class="habit-list-item"
              [class.habit-list-item--exiting]="isExiting(habit.id)"
              [class.habit-list-item--entering]="isEntering(habit.id)"
            >
              <app-habit-list-card
                [name]="habit.name"
                [displayMeta]="habit.displayMeta"
                [time]="habit.time"
                [category]="habit.category"
                [marqueeItems]="habit.marqueeItems"
                [minimumAction]="habit.minimumAction"
                [accent]="habit.accent"
                [archived]="habit.archived"
                (openDetail)="openDetail(habit.id)"
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
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly demoMode = inject(DemoModeService);
  protected readonly newHabitLink = buildHabitNewLink('/habits');

  protected readonly filterOptions = FILTER_OPTIONS;
  protected readonly filter = signal<HabitsFilter>('active');
  protected readonly sort = signal<HabitSort>('time-asc');
  protected readonly pendingDelete = signal<PendingDelete | null>(null);
  private readonly exitingIds = signal<Set<string>>(new Set());
  private readonly enteringIds = signal<Set<string>>(new Set());
  private readonly pendingRestoreAnimations = signal<Set<string>>(new Set());

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

  protected readonly showCreateEmptyCta = computed(
    () =>
      this.showEmpty() &&
      this.filter() === 'active' &&
      this.filterCounts().active === 0 &&
      !this.demoMode.isActive(),
  );

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
        return 'Crie seu primeiro hábito para começar a acompanhar sua consistência.';
    }
  });

  constructor() {
    effect(() => {
      const visibleIds = new Set(this.habits().map((habit) => habit.id));
      const pending = this.pendingRestoreAnimations();
      const toAnimate = [...pending].filter((id) => visibleIds.has(id));

      if (toAnimate.length === 0) {
        return;
      }

      this.enteringIds.update((current) => {
        const next = new Set(current);
        toAnimate.forEach((id) => next.add(id));
        return next;
      });

      this.pendingRestoreAnimations.update((current) => {
        const next = new Set(current);
        toAnimate.forEach((id) => next.delete(id));
        return next;
      });

      setTimeout(() => {
        this.enteringIds.update((current) => {
          const next = new Set(current);
          toAnimate.forEach((id) => next.delete(id));
          return next;
        });
      }, LIST_ITEM_ANIMATION_MS + 40);
    });
  }

  protected setFilter(value: HabitsFilter): void {
    this.filter.set(value);
  }

  protected editHabit(habitId: string): void {
    void this.router.navigate(['/habits', habitId, 'edit']);
  }

  protected openDetail(habitId: string): void {
    void this.router.navigate(['/habits', habitId]);
  }

  protected archiveHabit(habitId: string): void {
    this.runCollapseBeforeMutation(habitId, () => {
      this.storage.archiveHabit(habitId);

      this.toast.showUndo(
        'Hábito arquivado',
        () => {
          this.queueRestoreAnimation(habitId);
          this.storage.restoreHabit(habitId);
        },
        { icon: 'archive' },
      );
    });
  }

  protected restoreHabit(habitId: string): void {
    this.runCollapseBeforeMutation(habitId, () => {
      this.storage.restoreHabit(habitId);
      this.toast.showSuccess('Hábito reativado', 'refresh');
    });
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

    const habitId = pending.id;
    this.pendingDelete.set(null);

    this.runCollapseBeforeMutation(habitId, () => {
      if (!this.storage.stagePermanentDelete(habitId)) {
        return;
      }

      this.toast.showUndo(
        'Hábito excluído',
        () => {
          this.queueRestoreAnimation(habitId);
          this.storage.restorePendingDelete(habitId);
        },
        {
          icon: 'trash',
          onCommit: () => {
            this.storage.commitPendingDelete(habitId);
          },
        },
      );
    });
  }

  protected isExiting(habitId: string): boolean {
    return this.exitingIds().has(habitId);
  }

  protected isEntering(habitId: string): boolean {
    return this.enteringIds().has(habitId);
  }

  private queueRestoreAnimation(habitId: string): void {
    this.pendingRestoreAnimations.update((current) => {
      const next = new Set(current);
      next.add(habitId);
      return next;
    });
  }

  private runCollapseBeforeMutation(
    habitId: string,
    action: () => void,
  ): void {
    if (this.exitingIds().has(habitId)) {
      return;
    }

    this.exitingIds.update((current) => {
      const next = new Set(current);
      next.add(habitId);
      return next;
    });

    setTimeout(() => {
      this.exitingIds.update((current) => {
        const next = new Set(current);
        next.delete(habitId);
        return next;
      });
      action();
    }, LIST_ITEM_ANIMATION_MS);
  }
}
