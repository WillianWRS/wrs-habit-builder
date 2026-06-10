import type { Habit } from '../models/habit.model';

function normalizeForMatch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

/** Resolve hábito ativo por nome aproximado (sem acento, parcial). */
export function findHabitByLooseName(
  habits: Habit[],
  query: string,
): Habit | undefined {
  const normalizedQuery = normalizeForMatch(query);
  const activeHabits = habits.filter((habit) => !habit.archived);

  const exactMatch = activeHabits.find(
    (habit) => normalizeForMatch(habit.name) === normalizedQuery,
  );

  if (exactMatch) {
    return exactMatch;
  }

  const forwardMatches = activeHabits.filter((habit) =>
    normalizeForMatch(habit.name).includes(normalizedQuery),
  );

  if (forwardMatches.length === 1) {
    return forwardMatches[0];
  }

  if (forwardMatches.length > 1) {
    return [...forwardMatches].sort(
      (left, right) => left.name.length - right.name.length,
    )[0];
  }

  const reverseMatches = activeHabits.filter((habit) =>
    normalizedQuery.includes(normalizeForMatch(habit.name)),
  );

  if (reverseMatches.length === 1) {
    return reverseMatches[0];
  }

  return undefined;
}
