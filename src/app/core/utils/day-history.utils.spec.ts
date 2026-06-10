import { describe, expect, it } from 'vitest';
import type { HabitCompletion } from '../models/habit-completion.model';
import type { Habit } from '../models/habit.model';
import { buildDayHistory } from './day-history.utils';

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

describe('buildDayHistory', () => {
  it('monta entradas ordenadas por horário com --:-- por último', () => {
    const habits = [
      createHabit({
        id: 'no-reminder',
        name: 'Meditar',
        metaGeral: '10 min',
        optionalReminder: '',
      }),
      createHabit({
        id: 'early',
        name: 'Caminhar',
        metaGeral: '4KM',
        optionalReminder: '07:00',
      }),
      createHabit({
        id: 'late',
        name: 'Ler',
        metaGeral: '20 pág',
        optionalReminder: '21:30',
      }),
    ];
    const completions: HabitCompletion[] = [
      {
        id: 'c1',
        habitId: 'early',
        completedOn: '2026-06-10',
      },
    ];

    const snapshot = buildDayHistory('2026-06-10', habits, completions);

    expect(snapshot.entries.map((entry) => entry.habitId)).toEqual([
      'early',
      'late',
      'no-reminder',
    ]);
    expect(snapshot.entries[0]).toMatchObject({
      reminderDisplay: '07:00',
      name: 'Caminhar',
      meta: '4KM',
      status: 'done',
    });
    expect(snapshot.entries[2]).toMatchObject({
      reminderDisplay: '--:--',
      name: 'Meditar',
      meta: '10 min',
      status: 'not_done',
    });
  });

  it('ignora hábitos arquivados e fora do schedule', () => {
    const habits = [
      createHabit({ id: 'active' }),
      createHabit({ id: 'archived', archived: true }),
      createHabit({
        id: 'weekend-only',
        scheduleDays: [0, 6],
        scheduleDaySince: { 0: '2026-01-01', 6: '2026-01-01' },
      }),
    ];

    const snapshot = buildDayHistory('2026-06-10', habits, []);

    expect(snapshot.entries).toHaveLength(1);
    expect(snapshot.entries[0]?.habitId).toBe('active');
  });
});
