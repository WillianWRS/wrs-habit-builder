import type { Habit } from '../models/habit.model';
import type { HabitSlotItem } from '../models/habit-slot.model';

export const DEFAULT_NEW_HABIT_TRIGGER = 'Apenas faça';
export const DEFAULT_NEW_HABIT_MOTIVATION = 'Realização pessoal';

export type MarqueeItemType = 'trigger' | 'motivation';

export interface MarqueeItem {
  type: MarqueeItemType;
  text: string;
}

interface LegacyNumberedFields {
  triggerText?: string;
  trigger1?: string;
  trigger2?: string;
  trigger3?: string;
  trigger1Visible?: boolean;
  trigger2Visible?: boolean;
  trigger3Visible?: boolean;
  motivation1?: string;
  motivation2?: string;
  motivation3?: string;
  motivation1Visible?: boolean;
  motivation2Visible?: boolean;
  motivation3Visible?: boolean;
}

/** Resolve campos numerados legados — usado apenas na cadeia de migração v5→v8. */
export function resolveTriggerMotivationFields(raw: LegacyNumberedFields): {
  trigger1: string;
  trigger2: string;
  trigger3: string;
  motivation1: string;
  motivation2: string;
  motivation3: string;
  trigger1Visible: boolean;
  trigger2Visible: boolean;
  trigger3Visible: boolean;
  motivation1Visible: boolean;
  motivation2Visible: boolean;
  motivation3Visible: boolean;
} {
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

function resolveTriggerVisibility(raw: LegacyNumberedFields, slot: 1 | 2 | 3): boolean {
  const visibilityKey = `trigger${slot}Visible` as keyof LegacyNumberedFields;
  const value = raw[visibilityKey];

  if (typeof value === 'boolean') {
    return value;
  }

  if (slot === 3) {
    return false;
  }

  if (slot === 1) {
    return true;
  }

  return !!(raw.trigger2?.trim());
}

function resolveMotivationVisibility(raw: LegacyNumberedFields, slot: 1 | 2 | 3): boolean {
  const visibilityKey = `motivation${slot}Visible` as keyof LegacyNumberedFields;
  const value = raw[visibilityKey];

  if (typeof value === 'boolean') {
    return value;
  }

  if (slot === 3) {
    return false;
  }

  if (slot === 1) {
    return true;
  }

  return !!(raw.motivation2?.trim());
}

export function buildMarqueeItems(
  habit: Pick<Habit, 'triggers' | 'motivations'>,
): MarqueeItem[] {
  const items: MarqueeItem[] = [];

  for (const entry of habit.triggers) {
    const trimmed = entry.text.trim();

    if (entry.visible && trimmed) {
      items.push({ type: 'trigger', text: trimmed });
    }
  }

  for (const entry of habit.motivations) {
    const trimmed = entry.text.trim();

    if (entry.visible && trimmed) {
      items.push({ type: 'motivation', text: trimmed });
    }
  }

  return items;
}

export function buildMarqueeItemsFromSlots(
  triggers: HabitSlotItem[],
  motivations: HabitSlotItem[],
): MarqueeItem[] {
  return buildMarqueeItems({ triggers, motivations });
}

export function formatMarqueeLabel(items: MarqueeItem[]): string {
  if (items.length === 0) {
    return '';
  }

  return `${items.map((item) => item.text).join('. ')}.`;
}

/** Slots visíveis do formulário → array de 3 slots para persistência. */
export function mapVisibleFormSlotsToStorage(slots: HabitSlotItem[]): HabitSlotItem[] {
  const padded: HabitSlotItem[] = slots.map((slot) => ({
    text: slot.text.trim(),
    visible: true,
  }));

  while (padded.length < 3) {
    padded.push({ text: '', visible: false });
  }

  return padded.slice(0, 3);
}

/** Array persistido → slots visíveis para o formulário (1–3). */
export function mapStorageSlotsToVisibleForm(slots: HabitSlotItem[]): HabitSlotItem[] {
  const visible = slots.filter((slot) => slot.visible);

  if (visible.length === 0 && slots.length > 0) {
    return [{ text: slots[0].text, visible: true }];
  }

  return visible.map((slot) => ({ text: slot.text, visible: true }));
}

export function countVisibleSlots(slots: HabitSlotItem[]): number {
  return slots.filter((slot) => slot.visible).length;
}
