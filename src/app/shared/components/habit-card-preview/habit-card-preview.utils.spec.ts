import { describe, expect, it } from 'vitest';
import { createDefaultWeekdayGoals } from '../../../core/models/habit-weekday-goal.model';
import type { HabitCardPreviewFormState } from './habit-card-preview.model';
import {
  buildPreviewMarqueeItems,
  previewTextOrPlaceholder,
  previewTimeOrPlaceholder,
} from './habit-card-preview.utils';

function createEmptyPreviewState(): HabitCardPreviewFormState {
  return {
    name: '',
    category: '',
    scheduleDays: [1, 2, 3, 4, 5],
    metasDinamicas: false,
    metaGeral: '',
    minimumAction: '',
    optionalReminder: '',
    weekdayGoals: createDefaultWeekdayGoals(),
    trigger1: '',
    trigger2: '',
    trigger3: '',
    trigger1Visible: true,
    trigger2Visible: false,
    trigger3Visible: false,
    motivation1: '',
    motivation2: '',
    motivation3: '',
    motivation1Visible: true,
    motivation2Visible: false,
    motivation3Visible: false,
  };
}

describe('habit-card-preview.utils', () => {
  it('usa placeholder para texto vazio', () => {
    expect(previewTextOrPlaceholder('', 'Nome')).toBe('Nome');
    expect(previewTextOrPlaceholder('  Treinar  ', 'Nome')).toBe('Treinar');
  });

  it('usa --:-- para horário vazio', () => {
    expect(previewTimeOrPlaceholder('')).toBe('--:--');
    expect(previewTimeOrPlaceholder('07:30')).toBe('07:30');
  });

  it('inclui placeholders nos itens visíveis do marquee', () => {
    const items = buildPreviewMarqueeItems(createEmptyPreviewState());

    expect(items).toEqual([
      { type: 'trigger', text: 'Gatilho' },
      { type: 'motivation', text: 'Recompensa' },
    ]);
  });
});
