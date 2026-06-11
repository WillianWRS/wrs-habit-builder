import type { DemoHabitPoolEntry } from '../models/demo-habit-pool-entry.model';
import type { HabitCardAccent, TodayHabitCard } from '../models/today-habit-card.model';
import { buildMarqueeItems } from './habit-trigger-motivation.utils';
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
  const date = new Date();

  return {
    id,
    name: entry.name,
    displayMeta: resolveHabitDisplayMeta(entry, date),
    scheduleDays: [...entry.scheduleDays],
    time: resolveHabitDisplayReminder(entry, date),
    category: entry.category,
    marqueeItems: buildMarqueeItems({
      trigger1: entry.trigger1,
      trigger2: entry.trigger2,
      trigger3: '',
      trigger1Visible: true,
      trigger2Visible: !!entry.trigger2.trim(),
      trigger3Visible: false,
      motivation1: entry.motivation1,
      motivation2: entry.motivation2,
      motivation3: '',
      motivation1Visible: true,
      motivation2Visible: !!entry.motivation2.trim(),
      motivation3Visible: false,
    }),
    minimumAction: resolveHabitDisplayMinimumAction(entry, date),
    dayCount,
    bestStreak: dayCount,
    totalCompletions: dayCount + (streakSeed % 10),
    isDayOne: dayCount === 0,
    freezeReassurance: streakSeed % 11 === 0 ? 'Protegido na terça — sequência intacta' : null,
    completed,
    accent: mapAccent(entry.category),
  };
}
