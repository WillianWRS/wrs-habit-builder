import { describe, expect, it } from 'vitest';
import type { HabitCompletion } from '../models/habit-completion.model';
import type { Habit } from '../models/habit.model';
import {
  buildMonthHeatmapCells,
  resolveHeatmapIntensity,
  shiftMonth,
} from './month-heatmap.utils';

function createHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    name: 'Caminhar',
    metaGeral: '4KM',
    metasDinamicas: false,
    weekdayGoals: [],
    category: 'corpo',
    trigger1: '',
    trigger2: '',
    trigger3: '',
    trigger1Visible: false,
    trigger2Visible: false,
    trigger3Visible: false,
    motivation1: '',
    motivation2: '',
    motivation3: '',
    motivation1Visible: false,
    motivation2Visible: false,
    motivation3Visible: false,
    minimumAction: '1 km',
    scheduleDays: [0, 1, 2, 3, 4, 5, 6],
    scheduleDaySince: {
      0: '2026-01-01',
      1: '2026-01-01',
      2: '2026-01-01',
      3: '2026-01-01',
      4: '2026-01-01',
      5: '2026-01-01',
      6: '2026-01-01',
    },
    optionalReminder: '07:00',
    archived: false,
    createdAt: '2026-01-01T12:00:00.000Z',
    showOnToday: true,
    ...overrides,
  };
}

describe('resolveHeatmapIntensity', () => {
  it('retorna 0 sem hábitos esperados ou conclusões', () => {
    expect(resolveHeatmapIntensity(0, 0)).toBe(0);
    expect(resolveHeatmapIntensity(0, 3)).toBe(0);
  });

  it('retorna 3 quando todos os hábitos foram concluídos', () => {
    expect(resolveHeatmapIntensity(1, 1)).toBe(3);
    expect(resolveHeatmapIntensity(4, 4)).toBe(3);
  });

  it('retorna 2 com metade ou mais concluída, mas não todos', () => {
    expect(resolveHeatmapIntensity(1, 2)).toBe(2);
    expect(resolveHeatmapIntensity(2, 3)).toBe(2);
  });

  it('retorna 1 com pelo menos uma conclusão abaixo da metade', () => {
    expect(resolveHeatmapIntensity(1, 3)).toBe(1);
    expect(resolveHeatmapIntensity(1, 4)).toBe(1);
  });
});

describe('buildMonthHeatmapCells', () => {
  it('marca dias futuros como não clicáveis', () => {
    const habits = [createHabit()];
    const cells = buildMonthHeatmapCells(
      2026,
      5,
      habits,
      [],
      '2026-06-10',
    );

    const todayCell = cells.find((cell) => cell.dateKey === '2026-06-10');
    const futureCell = cells.find((cell) => cell.dateKey === '2026-06-11');

    expect(todayCell?.isClickable).toBe(true);
    expect(futureCell?.isFuture).toBe(true);
    expect(futureCell?.isClickable).toBe(false);
  });

  it('inclui dias adjacentes no grid com número e sem clique', () => {
    const cells = buildMonthHeatmapCells(
      2026,
      5,
      [createHabit()],
      [],
      '2026-06-15',
    );

    const previousMonthCell = cells.find((cell) => cell.dateKey === '2026-05-31');
    const nextMonthCell = cells.find((cell) => cell.dateKey === '2026-07-01');

    expect(previousMonthCell).toMatchObject({
      kind: 'padding',
      inCurrentMonth: false,
      dayNumber: 31,
      isClickable: false,
    });
    expect(nextMonthCell).toMatchObject({
      kind: 'padding',
      inCurrentMonth: false,
      dayNumber: 1,
      isClickable: false,
    });
  });

  it('aplica intensidade máxima quando todos os hábitos do dia foram concluídos', () => {
    const habits = [
      createHabit({ id: 'h1' }),
      createHabit({ id: 'h2', name: 'Ler' }),
    ];
    const completions: HabitCompletion[] = [
      { id: 'c1', habitId: 'h1', completedOn: '2026-06-10' },
      { id: 'c2', habitId: 'h2', completedOn: '2026-06-10' },
    ];

    const cells = buildMonthHeatmapCells(
      2026,
      5,
      habits,
      completions,
      '2026-06-15',
    );
    const dayCell = cells.find((cell) => cell.dateKey === '2026-06-10');

    expect(dayCell?.completionCount).toBe(2);
    expect(dayCell?.intensity).toBe(3);
    expect(dayCell?.hasExpectedHabits).toBe(true);
  });
});

describe('shiftMonth', () => {
  it('avança e retrocede meses', () => {
    expect(shiftMonth(2026, 0, 1)).toEqual({ year: 2026, month: 1 });
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
  });
});
