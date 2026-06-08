import type { DemoHabitPoolEntry } from '../models/demo-habit-pool-entry.model';
import type { HabitCardAccent, TodayHabitCard } from '../models/today-habit-card.model';
import {
  resolveHabitDisplayMeta,
  resolveHabitDisplayMinimumAction,
  resolveHabitDisplayReminder,
} from './habit-meta.utils';

function mapAccent(category: string): HabitCardAccent {
  const normalized = category.toLowerCase();

  if (
    normalized.includes('corpo') ||
    normalized.includes('treino') ||
    normalized.includes('movimento')
  ) {
    return 'physical';
  }

  if (
    normalized.includes('mind') ||
    normalized.includes('medita') ||
    normalized.includes('calma')
  ) {
    return 'wellness';
  }

  return 'default';
}

export function mapDemoPoolEntryToCard(
  entry: DemoHabitPoolEntry,
  id: string,
  streakSeed: number,
): TodayHabitCard {
  const dayCount = streakSeed % 68;
  const completed = streakSeed % 5 < 2;
  const previousDayCompleted = streakSeed % 7 !== 0;
  const date = new Date();

  return {
    id,
    name: entry.name,
    displayMeta: resolveHabitDisplayMeta(entry, date),
    scheduleDays: [...entry.scheduleDays],
    time: resolveHabitDisplayReminder(entry, date),
    category: entry.category,
    trigger1: entry.trigger1,
    trigger2: entry.trigger2,
    motivation1: entry.motivation1,
    motivation2: entry.motivation2,
    minimumAction: resolveHabitDisplayMinimumAction(entry, date),
    dayCount,
    completed,
    accent: mapAccent(entry.category),
    previousDayCompleted,
  };
}
