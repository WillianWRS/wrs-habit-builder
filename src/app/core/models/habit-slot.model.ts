/** Item de gatilho ou recompensa — até 3 por hábito. */
export interface HabitSlotItem {
  text: string;
  visible: boolean;
}

export type TriggerItem = HabitSlotItem;
export type MotivationItem = HabitSlotItem;

export const MAX_HABIT_SLOTS = 3;

export function createEmptySlot(): HabitSlotItem {
  return { text: '', visible: false };
}

export function createDefaultVisibleSlot(text: string): HabitSlotItem {
  return { text, visible: true };
}

/** Garante exatamente 3 slots (slots ausentes preenchidos com visible: false). */
export function padSlots(slots: HabitSlotItem[]): HabitSlotItem[] {
  const normalized = slots.slice(0, MAX_HABIT_SLOTS).map((slot) => ({
    text: slot.text.trim(),
    visible: slot.visible,
  }));

  while (normalized.length < MAX_HABIT_SLOTS) {
    normalized.push(createEmptySlot());
  }

  return normalized;
}
