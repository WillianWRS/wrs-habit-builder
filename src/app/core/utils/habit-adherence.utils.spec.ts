import { describe, expect, it } from 'vitest';
import type { HabitCompletion } from '../models/habit-completion.model';
import { createTestHabit } from '../testing/test-habit.factory';
import {
  computeHabitAdherence,
  computeHabitAdherenceSnapshot,
  resolveAdherenceWindowLabel,
} from './habit-adherence.utils';

function completion(habitId: string, completedOn: string): HabitCompletion {
  return { id: crypto.randomUUID(), habitId, completedOn };
}

describe('habit-adherence.utils', () => {
  it('calcula adesão 7d em dias esperados', () => {
    const habit = createTestHabit();
    const completions = [
      completion(habit.id, '2026-06-04'),
      completion(habit.id, '2026-06-05'),
      completion(habit.id, '2026-06-06'),
      completion(habit.id, '2026-06-08'),
    ];

    const adherence = computeHabitAdherence(
      habit,
      completions,
      7,
      new Date(2026, 5, 10),
    );

    expect(adherence.expectedDays).toBe(7);
    expect(adherence.completedDays).toBe(4);
    expect(adherence.percentage).toBe(57);
    expect(adherence.windowLabel).toBe('7d');
  });

  it('não retroage faltas para weekday adicionado hoje', () => {
    const habit = createTestHabit({
      scheduleDays: [1, 3],
      scheduleDaySince: {
        1: '2026-01-01',
        3: '2026-06-10',
      },
    });
    const completions = [
      completion(habit.id, '2026-05-18'),
      completion(habit.id, '2026-05-25'),
      completion(habit.id, '2026-06-01'),
      completion(habit.id, '2026-06-08'),
      completion(habit.id, '2026-06-10'),
    ];

    const adherence = computeHabitAdherence(
      habit,
      completions,
      30,
      new Date(2026, 5, 10),
    );

    expect(adherence.expectedDays).toBe(5);
    expect(adherence.completedDays).toBe(5);
    expect(adherence.percentage).toBe(100);
  });

  it('retorna 0 quando não há dias esperados na janela', () => {
    const habit = createTestHabit({
      scheduleDays: [0],
      scheduleDaySince: { 0: '2026-12-01' },
    });

    const adherence = computeHabitAdherence(habit, [], 7, new Date(2026, 5, 10));

    expect(adherence.expectedDays).toBe(0);
    expect(adherence.completedDays).toBe(0);
    expect(adherence.percentage).toBe(0);
  });

  it('usa rótulo progressivo para hábito recente', () => {
    const habit = createTestHabit({
      createdAt: '2026-06-08T12:00:00.000Z',
      scheduleDaySince: {
        0: '2026-06-08',
        1: '2026-06-08',
        2: '2026-06-08',
        3: '2026-06-08',
        4: '2026-06-08',
        5: '2026-06-08',
        6: '2026-06-08',
      },
    });

    const snapshot = computeHabitAdherenceSnapshot(
      habit,
      [completion(habit.id, '2026-06-09')],
      new Date(2026, 5, 10),
    );

    expect(snapshot.thirtyDays.trackedDays).toBe(3);
    expect(snapshot.thirtyDays.windowLabel).toBe('3d');
    expect(resolveAdherenceWindowLabel(30, 3)).toBe('3d');
  });
});
