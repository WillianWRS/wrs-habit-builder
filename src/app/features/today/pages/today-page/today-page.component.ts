import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppNavComponent } from '../../../../shared/components/app-nav/app-nav.component';
import { DayProgressComponent } from '../../components/day-progress/day-progress.component';
import { HabitCardAccent, HabitCardComponent } from '../../components/habit-card/habit-card.component';

/** Alterne para `true` para visualizar o empty state */
const PREVIEW_EMPTY_STATE = false;

interface MockTodayHabit {
  id: string;
  name: string;
  time: string;
  category: string;
  minimumAction: string;
  completed: boolean;
  accent: HabitCardAccent;
}

const MOCK_TODAY_HABITS: MockTodayHabit[] = [
  {
    id: '1',
    name: 'Estudar inglês',
    time: '08:00',
    category: 'Saúde',
    minimumAction: '1 flashcard',
    completed: false,
    accent: 'default',
  },
  {
    id: '2',
    name: 'Treino',
    time: '07:00',
    category: 'Corpo',
    minimumAction: '10 min mobilidade',
    completed: true,
    accent: 'physical',
  },
  {
    id: '3',
    name: 'Leitura',
    time: '21:30',
    category: 'Estudo',
    minimumAction: '1 página',
    completed: false,
    accent: 'default',
  },
  {
    id: '4',
    name: 'Meditação',
    time: '06:30',
    category: 'Mindfulness',
    minimumAction: '3 respirações profundas',
    completed: true,
    accent: 'wellness',
  },
  {
    id: '5',
    name: 'Água ao acordar',
    time: '06:00',
    category: 'Saúde',
    minimumAction: '1 copo',
    completed: false,
    accent: 'default',
  },
];

@Component({
  selector: 'app-today-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    AppNavComponent,
    DayProgressComponent,
    HabitCardComponent,
  ],
  template: `
    <app-nav activeTab="today" />

    <main class="mx-auto min-h-dvh w-full max-w-lg px-4 pb-28 pt-6 md:max-w-2xl md:pb-10 md:pt-10 lg:max-w-3xl lg:px-8">
      <header class="mb-6 space-y-4 md:mb-8">
        <h1
          class="font-display text-2xl font-semibold text-brand-light-text-primary md:text-3xl dark:text-brand-text-primary"
        >
          Hoje · {{ todayLabel() }}
        </h1>

        @if (!showEmpty()) {
          <app-day-progress [done]="doneCount()" [total]="totalCount()" />
        }
      </header>

      @if (showEmpty()) {
        <section
          class="flex flex-col items-center px-4 py-16 text-center"
          aria-labelledby="empty-title"
        >
          <span class="mb-4 text-4xl opacity-60" aria-hidden="true">🌱</span>
          <h2
            id="empty-title"
            class="font-display text-xl font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
          >
            Nenhum hábito para hoje
          </h2>
          <p class="mt-2 max-w-xs text-sm text-brand-light-text-secondary dark:text-brand-text-secondary">
            Comece com algo pequeno — por exemplo:
            <span class="text-brand-light-text-primary dark:text-brand-text-primary"
              >"Se café, então 1 página"</span
            >
          </p>
          <a
            routerLink="/habits/new"
            class="mt-6 rounded-lg bg-brand-light-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
          >
            Criar primeiro hábito
          </a>
        </section>
      } @else {
        <ul class="space-y-3" role="list">
          @for (habit of habits(); track habit.id) {
            <li>
              <app-habit-card
                [name]="habit.name"
                [time]="habit.time"
                [category]="habit.category"
                [minimumAction]="habit.minimumAction"
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
  protected readonly showEmpty = signal(PREVIEW_EMPTY_STATE);
  protected readonly habits = signal(
    MOCK_TODAY_HABITS.map((habit) => ({ ...habit })),
  );

  protected readonly todayLabel = computed(() => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(new Date());
  });

  protected readonly doneCount = computed(
    () => this.habits().filter((habit) => habit.completed).length,
  );

  protected readonly totalCount = computed(() => this.habits().length);

  protected toggleHabit(id: string): void {
    this.habits.update((list) =>
      list.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit,
      ),
    );
  }
}
