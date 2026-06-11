import { describe, expect, it } from 'vitest';
import type { HabitCardPreviewFormState } from './habit-card-preview.model';
import { buildPreviewMarqueeItems } from './habit-card-preview.utils';

describe('habit-card-preview.utils', () => {
  it('buildPreviewMarqueeItems usa arrays triggers/motivations', () => {
    const state: HabitCardPreviewFormState = {
      name: 'Teste',
      category: 'Saúde',
      scheduleDays: [0, 1, 2, 3, 4, 5, 6],
      dynamicGoals: false,
      generalGoal: 'Meta',
      minimumAction: '1 passo',
      optionalReminder: '08:00',
      weekdayGoals: [],
      triggers: [
        { text: 'Gatilho', visible: true },
        { text: '', visible: false },
        { text: '', visible: false },
      ],
      motivations: [
        { text: 'Recompensa', visible: true },
        { text: '', visible: false },
        { text: '', visible: false },
      ],
    };

    expect(buildPreviewMarqueeItems(state)).toEqual([
      { type: 'trigger', text: 'Gatilho' },
      { type: 'motivation', text: 'Recompensa' },
    ]);
  });
});
