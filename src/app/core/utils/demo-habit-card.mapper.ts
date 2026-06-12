import type { DemoHabitPoolEntry } from '../models/demo-habit-pool-entry.model';
import { padSlots } from '../models/habit-slot.model';
import type { HabitCardAccent, TodayHabitCard } from '../models/today-habit-card.model';
import { buildMarqueeItems } from './habit-trigger-motivation.utils';
import {
  resolveHabitDisplayMeta,
  resolveHabitDisplayMinimumAction,
  resolveHabitDisplayReminder,
} from './habit-meta.utils';

function demoEntryDisplaySource(entry: DemoHabitPoolEntry) {
  return {
    generalGoal: entry.metaGeral,
    dynamicGoals: entry.metasDinamicas,
    minimumAction: entry.minimumAction,
    time: entry.time,
    weekdayGoals: entry.weekdayGoals,
  };
}

function demoEntryMarqueeSource(entry: DemoHabitPoolEntry) {
  return {
    triggers: padSlots([
      { text: entry.trigger1, visible: true },
      { text: entry.trigger2, visible: !!entry.trigger2.trim() },
    ]),
    motivations: padSlots([
      { text: entry.motivation1, visible: true },
      { text: entry.motivation2, visible: !!entry.motivation2.trim() },
    ]),
  };
}

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
    displayMeta: resolveHabitDisplayMeta(demoEntryDisplaySource(entry), date),
    scheduleDays: [...entry.scheduleDays],
    time: resolveHabitDisplayReminder(demoEntryDisplaySource(entry), date),
    category: entry.category,
    marqueeItems: buildMarqueeItems(demoEntryMarqueeSource(entry)),
    minimumAction: resolveHabitDisplayMinimumAction(demoEntryDisplaySource(entry), date),
    dayCount,
    bestStreak: dayCount,
    totalCompletions: dayCount + (streakSeed % 10),
    isDayOne: dayCount === 0,
    freezeReassurance: streakSeed % 11 === 0 ? 'Protegido na terça — sequência intacta' : null,
    completed,
    accent: mapAccent(entry.category),
  };
}
