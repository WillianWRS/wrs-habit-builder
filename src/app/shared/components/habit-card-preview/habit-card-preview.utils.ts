import type { HabitCardAccent } from '../../../core/models/today-habit-card.model';
import { buildMarqueeItemsFromSlots } from '../../../core/utils/habit-trigger-motivation.utils';
import type { HabitCardPreviewFormState } from './habit-card-preview.model';

export function previewTextOrPlaceholder(value: string, placeholder: string): string {
  return value.trim() ? value.trim() : placeholder;
}

export function previewTimeOrPlaceholder(value: string): string {
  return value.trim() ? value.trim() : '--:--';
}

export function mapPreviewAccent(category: string): HabitCardAccent {
  const normalized = category.toLowerCase();

  if (normalized.includes('corpo') || normalized.includes('treino')) {
    return 'physical';
  }

  if (normalized.includes('mind') || normalized.includes('medita')) {
    return 'wellness';
  }

  return 'default';
}

export function buildPreviewMarqueeItems(state: HabitCardPreviewFormState) {
  const triggers = state.triggers.map((slot) => ({
    text: previewTextOrPlaceholder(slot.text, 'Gatilho'),
    visible: slot.visible,
  }));
  const motivations = state.motivations.map((slot) => ({
    text: previewTextOrPlaceholder(slot.text, 'Recompensa'),
    visible: slot.visible,
  }));

  return buildMarqueeItemsFromSlots(triggers, motivations);
}
