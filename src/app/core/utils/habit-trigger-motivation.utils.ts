import type { Habit } from '../models/habit.model';

export const DEFAULT_NEW_HABIT_TRIGGER = 'Apenas faça';
export const DEFAULT_NEW_HABIT_MOTIVATION = 'Realização pessoal';

export type MarqueeItemType = 'trigger' | 'motivation';

export interface MarqueeItem {
  type: MarqueeItemType;
  text: string;
}

type TriggerMotivationFields = Pick<
  Habit,
  | 'trigger1'
  | 'trigger2'
  | 'trigger3'
  | 'motivation1'
  | 'motivation2'
  | 'motivation3'
  | 'trigger1Visible'
  | 'trigger2Visible'
  | 'trigger3Visible'
  | 'motivation1Visible'
  | 'motivation2Visible'
  | 'motivation3Visible'
>;

type LegacyTriggerMotivationHabit = Partial<TriggerMotivationFields> & {
  triggerText?: string;
};

/** Detecta hábito em JSON legado (sem 3º slot ou sem booleanos de visibilidade). */
export function isLegacyTriggerMotivationHabit(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') {
    return false;
  }

  const habit = raw as Record<string, unknown>;

  return (
    !('trigger3' in habit) ||
    !('motivation3' in habit) ||
    !('trigger1Visible' in habit) ||
    !('trigger2Visible' in habit) ||
    !('trigger3Visible' in habit) ||
    !('motivation1Visible' in habit) ||
    !('motivation2Visible' in habit) ||
    !('motivation3Visible' in habit)
  );
}

function resolveTriggerVisibility(
  raw: LegacyTriggerMotivationHabit,
  slot: 1 | 2 | 3,
): boolean {
  const visibilityKey = `trigger${slot}Visible` as const;

  if (typeof raw[visibilityKey] === 'boolean') {
    return raw[visibilityKey]!;
  }

  if (slot === 3) {
    return false;
  }

  if (slot === 1) {
    return true;
  }

  return !!(raw.trigger2?.trim());
}

function resolveMotivationVisibility(
  raw: LegacyTriggerMotivationHabit,
  slot: 1 | 2 | 3,
): boolean {
  const visibilityKey = `motivation${slot}Visible` as const;

  if (typeof raw[visibilityKey] === 'boolean') {
    return raw[visibilityKey]!;
  }

  if (slot === 3) {
    return false;
  }

  if (slot === 1) {
    return true;
  }

  return !!(raw.motivation2?.trim());
}

export function resolveTriggerMotivationFields(
  raw: LegacyTriggerMotivationHabit,
): TriggerMotivationFields {
  const trigger1 = raw.trigger1?.trim() || raw.triggerText?.trim() || '';

  return {
    trigger1,
    trigger2: raw.trigger2?.trim() ?? '',
    trigger3: raw.trigger3?.trim() ?? '',
    motivation1: raw.motivation1?.trim() || 'Consistência em construção',
    motivation2: raw.motivation2?.trim() || 'Um passo de cada vez',
    motivation3: raw.motivation3?.trim() ?? '',
    trigger1Visible: resolveTriggerVisibility(raw, 1),
    trigger2Visible: resolveTriggerVisibility(raw, 2),
    trigger3Visible: resolveTriggerVisibility(raw, 3),
    motivation1Visible: resolveMotivationVisibility(raw, 1),
    motivation2Visible: resolveMotivationVisibility(raw, 2),
    motivation3Visible: resolveMotivationVisibility(raw, 3),
  };
}

export function buildMarqueeItems(habit: TriggerMotivationFields): MarqueeItem[] {
  const items: MarqueeItem[] = [];

  const triggers: Array<{ text: string; visible: boolean }> = [
    { text: habit.trigger1, visible: habit.trigger1Visible },
    { text: habit.trigger2, visible: habit.trigger2Visible },
    { text: habit.trigger3, visible: habit.trigger3Visible },
  ];

  for (const entry of triggers) {
    const trimmed = entry.text.trim();

    if (entry.visible && trimmed) {
      items.push({ type: 'trigger', text: trimmed });
    }
  }

  const motivations: Array<{ text: string; visible: boolean }> = [
    { text: habit.motivation1, visible: habit.motivation1Visible },
    { text: habit.motivation2, visible: habit.motivation2Visible },
    { text: habit.motivation3, visible: habit.motivation3Visible },
  ];

  for (const entry of motivations) {
    const trimmed = entry.text.trim();

    if (entry.visible && trimmed) {
      items.push({ type: 'motivation', text: trimmed });
    }
  }

  return items;
}

export function formatMarqueeLabel(items: MarqueeItem[]): string {
  if (items.length === 0) {
    return '';
  }

  return `${items.map((item) => item.text).join('. ')}.`;
}
