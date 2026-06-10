import type { HabitCardAccent } from '../../../core/models/today-habit-card.model';
import type { MarqueeItem } from '../../../core/utils/habit-trigger-motivation.utils';
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

export function buildPreviewMarqueeItems(state: HabitCardPreviewFormState): MarqueeItem[] {
  const items: MarqueeItem[] = [];

  const triggers: Array<{ text: string; visible: boolean }> = [
    { text: state.trigger1, visible: state.trigger1Visible },
    { text: state.trigger2, visible: state.trigger2Visible },
    { text: state.trigger3, visible: state.trigger3Visible },
  ];

  for (const entry of triggers) {
    if (entry.visible) {
      items.push({
        type: 'trigger',
        text: previewTextOrPlaceholder(entry.text, 'Gatilho não informado'),
      });
    }
  }

  const motivations: Array<{ text: string; visible: boolean }> = [
    { text: state.motivation1, visible: state.motivation1Visible },
    { text: state.motivation2, visible: state.motivation2Visible },
    { text: state.motivation3, visible: state.motivation3Visible },
  ];

  for (const entry of motivations) {
    if (entry.visible) {
      items.push({
        type: 'motivation',
        text: previewTextOrPlaceholder(entry.text, 'Recompensa não informada'),
      });
    }
  }

  return items;
}
