import { describe, expect, it } from 'vitest';
import type { MonthHeatmapCell } from '../models/day-history.model';
import type { HabitCompletion } from '../models/habit-completion.model';
import { createTestHabit } from '../testing/test-habit.factory';
import {
  buildHabitMonthHeatmapCells,
  buildMonthHeatmapCells,
  formatCorrectionResultMessage,
  resolveCorrectionPulseDelay,
  resolveHabitCorrectionDayIntent,
  resolveHeatmapIntensity,
  shiftMonth,
} from './month-heatmap.utils';

function createHabit(overrides: Parameters<typeof createTestHabit>[0] = {}) {
  return createTestHabit({
    name: 'Caminhar',
    generalGoal: '4KM',
    category: 'corpo',
    minimumAction: '1 km',
    triggers: [
      { text: '', visible: false },
      { text: '', visible: false },
      { text: '', visible: false },
    ],
    motivations: [
      { text: '', visible: false },
      { text: '', visible: false },
      { text: '', visible: false },
    ],
    ...overrides,
  });
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

  it('sempre renderiza 6 semanas (42 células) para altura estável na transição', () => {
    const habits = [createHabit()];
    const months = [
      { year: 2026, month: 1 },
      { year: 2026, month: 4 },
      { year: 2026, month: 5 },
    ];

    for (const { year, month } of months) {
      const cells = buildMonthHeatmapCells(year, month, habits, [], '2026-12-31');
      expect(cells).toHaveLength(42);
    }
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

describe('buildHabitMonthHeatmapCells', () => {
  it('diferencia dias feitos, protegidos, perdidos e não esperados', () => {
    const habit = createHabit({
      id: 'h1',
      scheduleDays: [1, 2, 3, 4, 5],
      scheduleDaySince: {
        1: '2026-01-01',
        2: '2026-01-01',
        3: '2026-01-01',
        4: '2026-01-01',
        5: '2026-01-01',
      },
    });
    const completions: HabitCompletion[] = [
      { id: 'c1', habitId: 'h1', completedOn: '2026-06-09' },
    ];
    const freezeUsed = [
      {
        id: 'f1',
        habitId: 'h1',
        dateKey: '2026-06-10',
        usedAt: '2026-06-11T00:00:00.000Z',
      },
    ];

    const cells = buildHabitMonthHeatmapCells(
      2026,
      5,
      habit,
      completions,
      freezeUsed,
      '2026-06-11',
    );

    expect(cells.find((cell) => cell.dateKey === '2026-06-09')?.status).toBe('done');
    expect(cells.find((cell) => cell.dateKey === '2026-06-10')?.status).toBe(
      'protected',
    );
    expect(cells.find((cell) => cell.dateKey === '2026-06-11')?.status).toBe(
      'missed',
    );
    expect(cells.find((cell) => cell.dateKey === '2026-06-07')?.status).toBe(
      'skipped',
    );
  });

  it('marca como feito qualquer dia com conclusão, mesmo fora do agendamento', () => {
    const habit = createHabit({
      id: 'h1',
      scheduleDays: [1, 2, 3, 4, 5],
      scheduleDaySince: {
        1: '2026-01-01',
        2: '2026-01-01',
        3: '2026-01-01',
        4: '2026-01-01',
        5: '2026-01-01',
      },
    });
    const completions: HabitCompletion[] = [
      { id: 'c1', habitId: 'h1', completedOn: '2026-06-07' },
    ];

    const cells = buildHabitMonthHeatmapCells(
      2026,
      5,
      habit,
      completions,
      [],
      '2026-06-11',
    );

    expect(cells.find((cell) => cell.dateKey === '2026-06-07')?.status).toBe(
      'done',
    );
  });
});

describe('resolveHabitCorrectionDayIntent', () => {
  const habitId = 'h1';
  const todayKey = '2026-06-11';

  function createCell(
    overrides: Partial<MonthHeatmapCell> & Pick<MonthHeatmapCell, 'dateKey'>,
  ): MonthHeatmapCell {
    return {
      kind: 'day',
      dayNumber: 10,
      inCurrentMonth: true,
      completionCount: 0,
      expectedCount: 1,
      intensity: 0,
      isFuture: false,
      isClickable: true,
      hasExpectedHabits: true,
      ...overrides,
    };
  }

  it('retorna mark para dias anteriores sem conclusão', () => {
    const completions: HabitCompletion[] = [];

    expect(
      resolveHabitCorrectionDayIntent(
        createCell({ dateKey: '2026-06-10', status: 'missed' }),
        todayKey,
        habitId,
        completions,
      ),
    ).toBe('mark');
    expect(
      resolveHabitCorrectionDayIntent(
        createCell({
          dateKey: '2026-06-07',
          status: 'skipped',
          hasExpectedHabits: false,
          expectedCount: 0,
        }),
        todayKey,
        habitId,
        completions,
      ),
    ).toBe('mark');
  });

  it('retorna unmark para dias anteriores com conclusão', () => {
    const completions: HabitCompletion[] = [
      { id: 'c1', habitId, completedOn: '2026-06-09' },
    ];

    expect(
      resolveHabitCorrectionDayIntent(
        createCell({ dateKey: '2026-06-09', status: 'done' }),
        todayKey,
        habitId,
        completions,
      ),
    ).toBe('unmark');
  });

  it('retorna null para hoje, futuro e padding do grid', () => {
    const completions: HabitCompletion[] = [];

    expect(
      resolveHabitCorrectionDayIntent(
        createCell({ dateKey: '2026-06-11', status: 'missed' }),
        todayKey,
        habitId,
        completions,
      ),
    ).toBeNull();
    expect(
      resolveHabitCorrectionDayIntent(
        createCell({ dateKey: '2026-06-12', status: 'future', isFuture: true }),
        todayKey,
        habitId,
        completions,
      ),
    ).toBeNull();
    expect(
      resolveHabitCorrectionDayIntent(
        createCell({
          dateKey: '2026-05-31',
          inCurrentMonth: false,
          kind: 'padding',
        }),
        todayKey,
        habitId,
        completions,
      ),
    ).toBeNull();
  });
});

describe('formatCorrectionResultMessage', () => {
  it('discrimina marcações e desmarcações no toast', () => {
    expect(formatCorrectionResultMessage(1, 0)).toBe(
      'Correção efetivada: 1 dia marcado',
    );
    expect(formatCorrectionResultMessage(2, 1)).toBe(
      'Correção efetivada: 2 dias marcados · 1 dia desmarcado',
    );
    expect(formatCorrectionResultMessage(0, 2)).toBe(
      'Correção efetivada: 2 dias desmarcados',
    );
  });
});

describe('resolveCorrectionPulseDelay', () => {
  it('retorna atraso negativo sincronizado com o relógio global', () => {
    const anchorMs = 1_000;
    const nowMs = 1_325;

    expect(resolveCorrectionPulseDelay(anchorMs, nowMs, 750)).toBe('-325ms');
    expect(resolveCorrectionPulseDelay(anchorMs, 1_750, 750)).toBe('0ms');
  });

  it('retorna 0ms sem âncora', () => {
    expect(resolveCorrectionPulseDelay(null)).toBe('0ms');
  });
});
