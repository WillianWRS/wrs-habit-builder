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
  trigger1: string;
  trigger2: string;
  motivation1: string;
  motivation2: string;
  minimumAction: string;
  dayCount: number;
  completed: boolean;
  accent: HabitCardAccent;
}

/** Cards de preview — um por nível de borda (66+ · 50 · 35 · 15 · 0 dias) */
const MOCK_TODAY_HABITS: MockTodayHabit[] = [
  {
    id: '5',
    name: 'Nível 5 · Lendário (66+ dias)',
    time: '08:00',
    category: 'Preview',
    trigger1: 'Borda 4px fixa laranja + claro',
    trigger2: 'Cores fluem dentro da borda',
    motivation1: 'Sequência lendária',
    motivation2: '66 dias ou mais',
    minimumAction: '1 unidade',
    dayCount: 72,
    completed: true,
    accent: 'default',
  },
  {
    id: '4',
    name: 'Nível 4 · Ouro (50 dias)',
    time: '08:00',
    category: 'Preview',
    trigger1: 'Pulse animado no glow',
    trigger2: 'Borda pulsante suave',
    motivation1: 'Consistência de elite',
    motivation2: '50 dias seguidos',
    minimumAction: '1 unidade',
    dayCount: 50,
    completed: true,
    accent: 'default',
  },
  {
    id: '3',
    name: 'Nível 3 · Prata (35 dias)',
    time: '08:00',
    category: 'Preview',
    trigger1: 'Borda laranja mais intensa',
    trigger2: 'Glow + highlight interno',
    motivation1: 'Hábito consolidado',
    motivation2: '35 dias seguidos',
    minimumAction: '1 unidade',
    dayCount: 35,
    completed: false,
    accent: 'default',
  },
  {
    id: '2',
    name: 'Nível 2 · Bronze (15 dias)',
    time: '08:00',
    category: 'Preview',
    trigger1: 'Borda 2px com tom laranja',
    trigger2: 'Sombra sutil externa',
    motivation1: 'Primeiro marco de consistência',
    motivation2: '15 dias seguidos',
    minimumAction: '1 unidade',
    dayCount: 15,
    completed: false,
    accent: 'default',
  },
  {
    id: '1',
    name: 'Nível 1 · Base (0 dias)',
    time: '08:00',
    category: 'Preview',
    trigger1: 'Borda padrão atual',
    trigger2: 'Sem efeitos extras',
    motivation1: 'Referência visual do nível inicial',
    motivation2: 'A partir de 15 dias evolui',
    minimumAction: '1 unidade',
    dayCount: 0,
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

    <main class="mx-auto min-h-dvh w-full max-w-5xl px-4 pb-28 pt-6 md:px-6 md:pb-10 md:pt-10 lg:px-8">
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
                [trigger1]="habit.trigger1"
                [trigger2]="habit.trigger2"
                [motivation1]="habit.motivation1"
                [motivation2]="habit.motivation2"
                [minimumAction]="habit.minimumAction"
                [dayCount]="habit.dayCount"
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
      weekday: 'long',
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
      list.map((habit) => {
        if (habit.id !== id) {
          return habit;
        }

        const completed = !habit.completed;

        return {
          ...habit,
          completed,
          dayCount: completed ? habit.dayCount + 1 : habit.dayCount - 1,
        };
      }),
    );
  }
}
