import { ALL_WEEKDAYS } from '../models/habit.model';
import type { TodayHabitCard } from '../models/today-habit-card.model';
import { mapDemoPoolEntryToCard } from './demo-habit-card.mapper';
import { buildDemoHabitPool } from './demo-habits-pool.data';

function shuffleIndices(length: number): number[] {
  const indices = Array.from({ length }, (_, index) => index);

  for (let index = indices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indices[index], indices[swapIndex]] = [indices[swapIndex], indices[index]];
  }

  return indices;
}

/** Fornece os 5 hábitos de preview visual para o modo demonstrativo pré-definido. */
export class DemoHabitsData {
  private static readonly pool = buildDemoHabitPool();

  static getPredefinedCards(): TodayHabitCard[] {
    return [
      {
        id: 'demo-5',
        name: 'Nível 5 · Lendário (66+ dias)',
        displayMeta: 'Manter o topo',
        scheduleDays: [...ALL_WEEKDAYS],
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
        previousDayCompleted: true,
      },
      {
        id: 'demo-4',
        name: 'Nível 4 · Ouro (50 dias)',
        displayMeta: '50 dias seguidos',
        scheduleDays: [...ALL_WEEKDAYS],
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
        previousDayCompleted: true,
      },
      {
        id: 'demo-3',
        name: 'Nível 3 · Prata (35 dias)',
        displayMeta: '35 dias seguidos',
        scheduleDays: [1, 2, 3, 4, 5],
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
        previousDayCompleted: true,
      },
      {
        id: 'demo-2',
        name: 'Nível 2 · Bronze (15 dias)',
        displayMeta: '15 dias seguidos',
        scheduleDays: [...ALL_WEEKDAYS],
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
        previousDayCompleted: true,
      },
      {
        id: 'demo-1',
        name: 'Nível 1 · Base (0 dias)',
        displayMeta: 'Referência visual',
        scheduleDays: [...ALL_WEEKDAYS],
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
        previousDayCompleted: false,
      },
    ];
  }

  static getRandomCards(count = 5): TodayHabitCard[] {
    const picks = shuffleIndices(this.pool.length).slice(0, count);

    return picks.map((poolIndex, pickIndex) =>
      mapDemoPoolEntryToCard(
        this.pool[poolIndex],
        `demo-rand-${pickIndex}-${poolIndex}`,
        poolIndex + pickIndex * 11,
      ),
    );
  }

  /** Mantém compatibilidade com chamadas antigas. */
  static getCards(): TodayHabitCard[] {
    return this.getPredefinedCards();
  }

  static getPoolSize(): number {
    return this.pool.length;
  }
}
