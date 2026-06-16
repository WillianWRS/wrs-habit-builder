import { describe, expect, it } from 'vitest';
import type { HabitFreezeUsed } from '../models/habit-freeze-used.model';
import type { HabitCompletion } from '../models/habit-completion.model';
import { createTestHabit } from '../testing/test-habit.factory';
import { addDays, parseDateKey, toDateKey } from './date.utils';
import {
  buildInitialScheduleDaySince,
  computeBestStreak,
  computeCurrentStreak,
  computeFreezeBalance,
  computeTotalCompletions,
  detectAutomaticFreezesNeeded,
  getFreezeForReassuranceDay,
  getScheduledDaysWalk,
  mergeScheduleDaySince,
  isExpectedScheduleDay,
} from './habit-streak.utils';

function createHabit(overrides: Parameters<typeof createTestHabit>[0] = {}) {
  return createTestHabit(overrides);
}

function completion(habitId: string, completedOn: string): HabitCompletion {
  return { id: crypto.randomUUID(), habitId, completedOn };
}

function freeze(habitId: string, dateKey: string): HabitFreezeUsed {
  return {
    id: crypto.randomUUID(),
    habitId,
    dateKey,
    usedAt: `${dateKey}T12:00:00.000Z`,
  };
}

function dateRangeCompletions(
  habitId: string,
  startKey: string,
  count: number,
): HabitCompletion[] {
  const result: HabitCompletion[] = [];
  let cursor = parseDateKey(startKey);

  for (let index = 0; index < count; index += 1) {
    result.push(completion(habitId, toDateKey(cursor)));
    cursor = addDays(cursor, 1);
  }

  return result;
}

describe('habit-streak.utils — streak derivada (RN-07)', () => {
  it('1 · 5 dias agendados seguidos concluídos → currentStreak = 5', () => {
    const habit = createHabit();
    const referenceDate = new Date(2026, 5, 5);
    const completions = dateRangeCompletions('habit-1', '2026-06-01', 5);

    expect(
      computeCurrentStreak(habit, completions, [], referenceDate),
    ).toBe(5);
  });

  it('2 · 1 falta isolada na semana com freeze → freeze consumido, streak intacta', () => {
    const habit = createHabit();
    const referenceDate = new Date(2026, 5, 8);
    const completions = [
      completion('habit-1', '2026-06-01'),
      completion('habit-1', '2026-06-02'),
      completion('habit-1', '2026-06-04'),
      completion('habit-1', '2026-06-05'),
      completion('habit-1', '2026-06-06'),
      completion('habit-1', '2026-06-07'),
      completion('habit-1', '2026-06-08'),
    ];

    const autoFreezes = detectAutomaticFreezesNeeded(
      habit,
      completions,
      [],
      referenceDate,
    );

    expect(autoFreezes).toHaveLength(1);
    expect(autoFreezes[0]?.dateKey).toBe('2026-06-03');

    const freezeEvents = autoFreezes;
    expect(
      computeCurrentStreak(habit, completions, freezeEvents, referenceDate),
    ).toBe(7);
  });

  it('3 · 2 faltas na mesma semana → 1ª coberta, 2ª quebra → currentStreak = 0', () => {
    const habit = createHabit();
    const referenceDate = new Date(2026, 5, 4);
    const completions = [completion('habit-1', '2026-06-01')];

    const freezeEvents = detectAutomaticFreezesNeeded(
      habit,
      completions,
      [],
      referenceDate,
    );

    expect(freezeEvents).toHaveLength(1);
    expect(freezeEvents[0]?.dateKey).toBe('2026-06-02');
    expect(
      computeCurrentStreak(habit, completions, freezeEvents, referenceDate),
    ).toBe(0);
  });

  it('4 · hábito seg/qua/sex — terça e quinta não contam como falta', () => {
    const habit = createHabit({
      scheduleDays: [1, 3, 5],
      scheduleDaySince: buildInitialScheduleDaySince([1, 3, 5], '2026-01-01'),
    });
    const referenceDate = new Date(2026, 5, 10);
    const completions = [
      completion('habit-1', '2026-06-01'),
      completion('habit-1', '2026-06-03'),
      completion('habit-1', '2026-06-05'),
      completion('habit-1', '2026-06-08'),
    ];

    expect(
      computeCurrentStreak(habit, completions, [], referenceDate),
    ).toBe(4);
    expect(getScheduledDaysWalk(habit, '2026-06-01', '2026-06-09')).toEqual([
      '2026-06-01',
      '2026-06-03',
      '2026-06-05',
      '2026-06-08',
    ]);
  });

  it('5 · hábito criado há 3 dias não retroage antes de createdAt', () => {
    const habit = createHabit({
      createdAt: '2026-06-07T12:00:00.000Z',
      scheduleDaySince: buildInitialScheduleDaySince(
        [0, 1, 2, 3, 4, 5, 6],
        '2026-06-07',
      ),
    });
    const referenceDate = new Date(2026, 5, 9);
    const completions = [
      completion('habit-1', '2026-06-07'),
      completion('habit-1', '2026-06-08'),
      completion('habit-1', '2026-06-09'),
    ];

    expect(
      computeCurrentStreak(habit, completions, [], referenceDate),
    ).toBe(3);
  });

  it('6 · hoje agendado não marcado → streak baseada em ontem', () => {
    const habit = createHabit();
    const referenceDate = new Date(2026, 5, 10);
    const completions = dateRangeCompletions('habit-1', '2026-06-01', 9);

    expect(
      computeCurrentStreak(habit, completions, [], referenceDate),
    ).toBe(9);
  });

  it('7 · 90 dias + 1 falta que quebra → completions intactas, total = 90, recorde preservado', () => {
    const habit = createHabit();
    const referenceDate = new Date(2026, 3, 2);
    const completions = dateRangeCompletions('habit-1', '2026-01-01', 90);

    expect(completions).toHaveLength(90);
    expect(computeTotalCompletions('habit-1', completions)).toBe(90);
    expect(
      computeBestStreak(habit, completions, [], new Date(2026, 2, 31)),
    ).toBe(90);
    expect(
      computeCurrentStreak(habit, completions, [], referenceDate),
    ).toBe(0);
    expect(
      computeBestStreak(habit, completions, [], referenceDate),
    ).toBe(90);
  });

  it('8 · padrão alternado 4 semanas → quebra na 2ª falta de cada semana', () => {
    const habit = createHabit();
    const referenceDate = new Date(2026, 0, 31);
    const completions: HabitCompletion[] = [];

    for (let week = 0; week < 4; week += 1) {
      const weekStart = parseDateKey('2026-01-04');
      const base = addDays(weekStart, week * 7);

      for (let day = 0; day < 7; day += 1) {
        const date = addDays(base, day);
        const dateKey = toDateKey(date);

        if (day % 2 === 0) {
          completions.push(completion('habit-1', dateKey));
        }
      }
    }

    const freezeEvents = detectAutomaticFreezesNeeded(
      habit,
      completions,
      [],
      referenceDate,
    );

    expect(freezeEvents).toHaveLength(4);

    const streakWithoutFreeze = computeCurrentStreak(
      habit,
      completions,
      [],
      referenceDate,
    );
    const streakWithFreeze = computeCurrentStreak(
      habit,
      completions,
      freezeEvents,
      referenceDate,
    );

    expect(streakWithoutFreeze).toBeLessThanOrEqual(1);
    expect(streakWithFreeze).toBeLessThanOrEqual(1);
  });
});

describe('habit-streak.utils — freeze semanal (RN-08)', () => {
  it('9 · virada de semana → freeze creditado até cap 1', () => {
    const habit = createHabit();
    const weekOneEnd = new Date(2026, 5, 6);
    const weekTwoStart = new Date(2026, 5, 8);

    expect(computeFreezeBalance(habit, [], 'free', weekOneEnd)).toEqual({
      available: 1,
      cap: 1,
    });

    const afterFirstMiss = detectAutomaticFreezesNeeded(
      habit,
      [completion('habit-1', '2026-06-01')],
      [],
      weekOneEnd,
    );

    expect(afterFirstMiss).toHaveLength(1);
    expect(
      computeFreezeBalance(habit, afterFirstMiss, 'free', weekOneEnd),
    ).toEqual({
      available: 0,
      cap: 1,
    });

    expect(
      computeFreezeBalance(habit, afterFirstMiss, 'free', weekTwoStart),
    ).toEqual({
      available: 1,
      cap: 1,
    });
  });
});

describe('habit-streak.utils — utilitários de agenda', () => {
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

  it('ignora dias da semana adicionados depois para faltas passadas', () => {
    const habit = createHabit({
      scheduleDays: [2, 4],
      scheduleDaySince: {
        2: '2026-01-01',
        4: '2026-06-10',
      },
    });

    expect(isExpectedScheduleDay(habit, '2026-06-05')).toBe(false);
  });

  it('detectAutomaticFreezesNeeded não duplica eventos existentes', () => {
    const habit = createHabit();
    const referenceDate = new Date(2026, 5, 5);
    const completions = [
      completion('habit-1', '2026-06-01'),
      completion('habit-1', '2026-06-02'),
      completion('habit-1', '2026-06-04'),
    ];
    const existing = [freeze('habit-1', '2026-06-03')];

    expect(
      detectAutomaticFreezesNeeded(habit, completions, existing, referenceDate),
    ).toEqual([]);
  });
});

describe('getFreezeForReassuranceDay', () => {
  it('retorna freeze quando ontem foi o dia protegido', () => {
    const freezeEvent = freeze('habit-1', '2026-06-09');
    const referenceDate = new Date(2026, 5, 10);

    expect(
      getFreezeForReassuranceDay('habit-1', [freezeEvent], referenceDate),
    ).toEqual(freezeEvent);
  });

  it('retorna undefined no dia do freeze e dois dias depois', () => {
    const freezeEvent = freeze('habit-1', '2026-06-09');

    expect(
      getFreezeForReassuranceDay(
        'habit-1',
        [freezeEvent],
        new Date(2026, 5, 9),
      ),
    ).toBeUndefined();

    expect(
      getFreezeForReassuranceDay(
        'habit-1',
        [freezeEvent],
        new Date(2026, 5, 11),
      ),
    ).toBeUndefined();
  });

  it('ignora freeze de outro hábito', () => {
    const freezeEvent = freeze('habit-2', '2026-06-09');

    expect(
      getFreezeForReassuranceDay(
        'habit-1',
        [freezeEvent],
        new Date(2026, 5, 10),
      ),
    ).toBeUndefined();
  });
});
