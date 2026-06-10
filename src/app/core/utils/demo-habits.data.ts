import { ALL_WEEKDAYS } from '../models/habit.model';
import type { TodayHabitCard } from '../models/today-habit-card.model';
import { mapDemoPoolEntryToCard } from './demo-habit-card.mapper';
import { buildDemoHabitPool } from './demo-habits-pool.data';
import { buildMarqueeItems } from './habit-trigger-motivation.utils';

function demoMarquee(
  trigger1: string,
  trigger2: string,
  motivation1: string,
  motivation2: string,
) {
  return buildMarqueeItems({
    trigger1,
    trigger2,
    trigger3: '',
    trigger1Visible: true,
    trigger2Visible: !!trigger2.trim(),
    trigger3Visible: false,
    motivation1,
    motivation2,
    motivation3: '',
    motivation1Visible: true,
    motivation2Visible: !!motivation2.trim(),
    motivation3Visible: false,
  });
}

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
        marqueeItems: demoMarquee(
          'Borda 4px fixa laranja + claro',
          'Cores fluem dentro da borda',
          'Sequência lendária',
          '66 dias ou mais',
        ),
        minimumAction: '1 unidade',
        dayCount: 72,
        missCount: 0,
        isDayOne: false,
        completed: true,
        accent: 'default',
      },
      {
        id: 'demo-4',
        name: 'Nível 4 · Ouro (50 dias)',
        displayMeta: '50 dias seguidos',
        scheduleDays: [...ALL_WEEKDAYS],
        time: '08:00',
        category: 'Preview',
        marqueeItems: demoMarquee(
          'Pulse animado no glow',
          'Borda pulsante suave',
          'Consistência de elite',
          '50 dias seguidos',
        ),
        minimumAction: '1 unidade',
        dayCount: 50,
        missCount: 0,
        isDayOne: false,
        completed: true,
        accent: 'default',
      },
      {
        id: 'demo-3',
        name: 'Nível 3 · Prata (35 dias)',
        displayMeta: '35 dias seguidos',
        scheduleDays: [1, 2, 3, 4, 5],
        time: '08:00',
        category: 'Preview',
        marqueeItems: demoMarquee(
          'Borda laranja mais intensa',
          'Glow + highlight interno',
          'Hábito consolidado',
          '35 dias seguidos',
        ),
        minimumAction: '1 unidade',
        dayCount: 35,
        missCount: 1,
        isDayOne: false,
        completed: false,
        accent: 'default',
      },
      {
        id: 'demo-2',
        name: 'Nível 2 · Bronze (15 dias)',
        displayMeta: '15 dias seguidos',
        scheduleDays: [...ALL_WEEKDAYS],
        time: '08:00',
        category: 'Preview',
        marqueeItems: demoMarquee(
          'Borda 2px com tom laranja',
          'Sombra sutil externa',
          'Primeiro marco de consistência',
          '15 dias seguidos',
        ),
        minimumAction: '1 unidade',
        dayCount: 15,
        missCount: 0,
        isDayOne: false,
        completed: false,
        accent: 'default',
      },
      {
        id: 'demo-1',
        name: 'Nível 1 · Base (0 dias)',
        displayMeta: 'Referência visual',
        scheduleDays: [...ALL_WEEKDAYS],
        time: '08:00',
        category: 'Preview',
        marqueeItems: demoMarquee(
          'Borda padrão atual',
          'Sem efeitos extras',
          'Referência visual do nível inicial',
          'A partir de 15 dias evolui',
        ),
        minimumAction: '1 unidade',
        dayCount: 0,
        missCount: 0,
        isDayOne: true,
        completed: false,
        accent: 'default',
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
