import { describe, expect, it } from 'vitest';
import type { HabitCompletion } from '../models/habit-completion.model';
import { createTestHabit } from '../testing/test-habit.factory';
import { buildDayHistory } from './day-history.utils';

function createHabit(overrides: Parameters<typeof createTestHabit>[0] = {}) {
  return createTestHabit({
    name: 'Caminhar',
    generalGoal: '4KM',
    category: 'corpo',
    minimumAction: '1 km',
    time: '07:00',
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

describe('buildDayHistory', () => {
  it('monta entradas ordenadas por horário com --:-- por último', () => {
    const habits = [
      createHabit({
        id: 'no-reminder',
        name: 'Meditar',
        generalGoal: '10 min',
        time: '',
      }),
      createHabit({
        id: 'early',
        name: 'Caminhar',
        generalGoal: '4KM',
        time: '07:00',
      }),
      createHabit({
        id: 'late',
        name: 'Ler',
        generalGoal: '20 pág',
        time: '21:30',
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
