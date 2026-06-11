import {
  createEmptySlot,
  padSlots,
  type MotivationItem,
  type TriggerItem,
} from '../models/habit-slot.model';
import { resolveTriggerMotivationFields } from '../utils/habit-trigger-motivation.utils';

/** Hábito com campos numerados (schema v6/v7) usado apenas na cadeia de migração. */
export type NumberedFieldHabitPayload = Record<string, unknown>;

/**
 * Converte trigger1..3 / motivation1..3 + *Visible para arrays de 3 slots.
 * Slots vazios/invisíveis são mantidos com visible: false (não omitidos).
 */
export function mapNumberedFieldsToSlots(raw: NumberedFieldHabitPayload): {
  triggers: TriggerItem[];
  motivations: MotivationItem[];
} {
  const fields = resolveTriggerMotivationFields(
    raw as Parameters<typeof resolveTriggerMotivationFields>[0],
  );

  return {
    triggers: padSlots([
      { text: fields.trigger1, visible: fields.trigger1Visible },
      { text: fields.trigger2, visible: fields.trigger2Visible },
      { text: fields.trigger3, visible: fields.trigger3Visible },
    ]),
    motivations: padSlots([
      { text: fields.motivation1, visible: fields.motivation1Visible },
      { text: fields.motivation2, visible: fields.motivation2Visible },
      { text: fields.motivation3, visible: fields.motivation3Visible },
    ]),
  };
}

/** Preenche slots numerados ausentes (para normalização v5→v6). */
export function ensureNumberedFields(raw: NumberedFieldHabitPayload): NumberedFieldHabitPayload {
  const { triggers, motivations } = mapNumberedFieldsToSlots(raw);

  return {
    ...raw,
    trigger1: triggers[0]?.text ?? '',
    trigger2: triggers[1]?.text ?? '',
    trigger3: triggers[2]?.text ?? '',
    trigger1Visible: triggers[0]?.visible ?? true,
    trigger2Visible: triggers[1]?.visible ?? false,
    trigger3Visible: triggers[2]?.visible ?? false,
    motivation1: motivations[0]?.text ?? '',
    motivation2: motivations[1]?.text ?? '',
    motivation3: motivations[2]?.text ?? '',
    motivation1Visible: motivations[0]?.visible ?? true,
    motivation2Visible: motivations[1]?.visible ?? false,
    motivation3Visible: motivations[2]?.visible ?? false,
  };
}

export function emptyNumberedSlots(): {
  triggers: TriggerItem[];
  motivations: MotivationItem[];
} {
  return {
    triggers: padSlots([createEmptySlot(), createEmptySlot(), createEmptySlot()]),
    motivations: padSlots([createEmptySlot(), createEmptySlot(), createEmptySlot()]),
  };
}
