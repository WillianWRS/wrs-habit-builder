import { describe, expect, it } from 'vitest';
import { computeWeeklySummary } from './weekly-summary.utils';
import type { Habit } from '../models/habit.model';
import type { HabitCompletion } from '../models/habit-completion.model';

function makeHabit(id: string, name: string, scheduleDays: Habit['scheduleDays']): Habit {
  return {
    id,
    name,
    generalGoal: '',
    dynamicGoals: false,
    weekdayGoals: [],
    category: 'outro',
    triggers: [],
    motivations: [],
    minimumAction: 'teste',
    scheduleDays,
    scheduleDaySince: {},
    time: '',
    archived: false,
    createdAt: new Date().toISOString(),
    showOnToday: true,
  };
}

describe('computeWeeklySummary', () => {
  it('retorna empty state quando não há dias esperados', () => {
    const result = computeWeeklySummary([], [], new Date('2026-06-13T12:00:00'));
    expect(result.hasEnoughData).toBe(false);
  });

  it('calcula melhores/piores métricas em 7 dias rolling', () => {
    const habits: Habit[] = [
      makeHabit('h1', 'Leitura', [1, 2, 3, 4, 5]),
      makeHabit('h2', 'Treino', [1, 3, 5]),
    ];
    const completions: HabitCompletion[] = [
      { id: 'c1', habitId: 'h1', completedOn: '2026-06-08' },
      { id: 'c2', habitId: 'h1', completedOn: '2026-06-09' },
      { id: 'c3', habitId: 'h2', completedOn: '2026-06-09' },
    ];

    const result = computeWeeklySummary(habits, completions, new Date('2026-06-13T12:00:00'));

    expect(result.hasEnoughData).toBe(true);
    expect(result.topHabit.label).toBe('Leitura');
    expect(result.lowHabit.label).toBe('Treino');
  });
});
