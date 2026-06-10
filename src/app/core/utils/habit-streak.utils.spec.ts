import { describe, expect, it } from 'vitest';
import type { HabitCompletion } from '../models/habit-completion.model';
import type { Habit } from '../models/habit.model';
import {
  STREAK_MISS_TOLERANCE,
  buildInitialScheduleDaySince,
  computeHabitStreakMetrics,
  countMissedExpectedDays,
  isExpectedScheduleDay,
  mergeScheduleDaySince,
} from './habit-streak.utils';

function createHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    name: 'Teste',
    metaGeral: '',
    metasDinamicas: false,
    weekdayGoals: [],
    category: 'outro',
    trigger1: 'Se X',
    trigger2: 'Então Y',
    trigger3: '',
    trigger1Visible: true,
    trigger2Visible: true,
    trigger3Visible: false,
    motivation1: 'Motivação',
    motivation2: 'Motivação 2',
    motivation3: '',
    motivation1Visible: true,
    motivation2Visible: true,
    motivation3Visible: false,
    minimumAction: '1 passo',
    scheduleDays: [0, 1, 2, 3, 4, 5, 6],
    scheduleDaySince: buildInitialScheduleDaySince(
      [0, 1, 2, 3, 4, 5, 6],
      '2026-01-01',
    ),
    optionalReminder: '',
    archived: false,
    createdAt: '2026-01-01T12:00:00.000Z',
    showOnToday: true,
    ...overrides,
  };
}

function completion(habitId: string, completedOn: string): HabitCompletion {
  return { id: crypto.randomUUID(), habitId, completedOn };
}

describe('habit-streak.utils', () => {
  it('conta dayCount como total de completions', () => {
    const habit = createHabit();
    const completions = [
      completion('habit-1', '2026-06-01'),
      completion('habit-1', '2026-06-03'),
      completion('habit-1', '2026-06-05'),
    ];

    expect(
      computeHabitStreakMetrics(habit, completions, new Date(2026, 5, 7)).dayCount,
    ).toBe(3);
  });

  it('marca day one quando não há completions', () => {
    const metrics = computeHabitStreakMetrics(createHabit(), [], new Date(2026, 5, 7));

    expect(metrics.isDayOne).toBe(true);
    expect(metrics.missCount).toBe(0);
  });

  it('conta 1 falta quando último complete foi há dois dias (hábito diário)', () => {
    const habit = createHabit();
    const completions = [completion('habit-1', '2026-06-05')];
    const referenceDate = new Date(2026, 5, 7);

    expect(countMissedExpectedDays(habit, completions, referenceDate)).toBe(1);
  });

  it('não conta falta no dia atual antes de virar o dia', () => {
    const habit = createHabit();
    const completions = [completion('habit-1', '2026-06-06')];
    const referenceDate = new Date(2026, 5, 7);

    expect(countMissedExpectedDays(habit, completions, referenceDate)).toBe(0);
  });

  it('conta falta só no dia da semana configurado', () => {
    const habit = createHabit({
      scheduleDays: [2],
      scheduleDaySince: buildInitialScheduleDaySince([2], '2026-01-01'),
    });
    const completions = [completion('habit-1', '2026-06-03')];
    const referenceDate = new Date(2026, 5, 12);

    expect(countMissedExpectedDays(habit, completions, referenceDate)).toBe(1);
  });

  it('ignora dias da semana adicionados depois para faltas passadas', () => {
    const habit = createHabit({
      scheduleDays: [2, 4],
      scheduleDaySince: {
        2: '2026-01-01',
        4: '2026-06-10',
      },
    });
    const completions = [completion('habit-1', '2026-06-03')];
    const referenceDate = new Date(2026, 5, 11);

    expect(countMissedExpectedDays(habit, completions, referenceDate)).toBe(1);
    expect(isExpectedScheduleDay(habit, '2026-06-05')).toBe(false);
  });

  it('sinaliza reset ao atingir o limite de faltas', () => {
    const habit = createHabit();
    const completions = [completion('habit-1', '2026-05-30')];
    const referenceDate = new Date(2026, 5, 7);

    const metrics = computeHabitStreakMetrics(habit, completions, referenceDate);

    expect(metrics.missCount).toBe(STREAK_MISS_TOLERANCE);
    expect(metrics.shouldReset).toBe(true);
  });

  it('mergeScheduleDaySince registra novos dias a partir de hoje', () => {
    const merged = mergeScheduleDaySince(
      { 2: '2026-01-01' },
      [2],
      [2, 4],
      '2026-06-10',
    );

    expect(merged[2]).toBe('2026-01-01');
    expect(merged[4]).toBe('2026-06-10');
  });
});
