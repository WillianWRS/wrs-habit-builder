import { describe, expect, it } from 'vitest';
import { normalizeHabit } from './habit-normalizer';
import {
  buildMarqueeItems,
  isLegacyTriggerMotivationHabit,
  resolveTriggerMotivationFields,
} from './habit-trigger-motivation.utils';

describe('habit-trigger-motivation.utils', () => {
  it('detecta JSON legado sem 3º slot ou booleanos de visibilidade', () => {
    expect(
      isLegacyTriggerMotivationHabit({
        trigger1: 'A',
        trigger2: 'B',
        motivation1: 'C',
        motivation2: 'D',
      }),
    ).toBe(true);

    expect(
      isLegacyTriggerMotivationHabit({
        trigger1: 'A',
        trigger2: 'B',
        trigger3: '',
        motivation1: 'C',
        motivation2: 'D',
        motivation3: '',
        trigger1Visible: true,
        trigger2Visible: true,
        trigger3Visible: false,
        motivation1Visible: true,
        motivation2Visible: true,
        motivation3Visible: false,
      }),
    ).toBe(false);
  });

  it('migra legado com 2 slots visíveis e 3º oculto', () => {
    const fields = resolveTriggerMotivationFields({
      trigger1: 'Gatilho 1',
      trigger2: 'Gatilho 2',
      motivation1: 'Motivação 1',
      motivation2: 'Motivação 2',
    });

    expect(fields).toMatchObject({
      trigger3: '',
      motivation3: '',
      trigger1Visible: true,
      trigger2Visible: true,
      trigger3Visible: false,
      motivation1Visible: true,
      motivation2Visible: true,
      motivation3Visible: false,
    });
  });

  it('monta marquee apenas com slots visíveis e não vazios', () => {
    const items = buildMarqueeItems({
      trigger1: 'Apenas faça',
      trigger2: 'Oculto',
      trigger3: '',
      trigger1Visible: true,
      trigger2Visible: false,
      trigger3Visible: false,
      motivation1: 'Realização pessoal',
      motivation2: '',
      motivation3: 'Extra',
      motivation1Visible: true,
      motivation2Visible: false,
      motivation3Visible: true,
    });

    expect(items).toEqual([
      { type: 'trigger', text: 'Apenas faça' },
      { type: 'motivation', text: 'Realização pessoal' },
      { type: 'motivation', text: 'Extra' },
    ]);
  });

  it('normalizer integra campos novos a partir de hábito legado', () => {
    const habit = normalizeHabit({
      id: 'legacy-1',
      name: 'Leitura',
      trigger1: 'Após o café',
      trigger2: 'Antes de dormir',
      motivation1: 'Aprender',
      motivation2: 'Relaxar',
      category: 'Mente',
      minimumAction: '1 página',
      scheduleDays: [0, 1, 2, 3, 4, 5, 6],
    });

    expect(habit.trigger3).toBe('');
    expect(habit.motivation3).toBe('');
    expect(habit.trigger3Visible).toBe(false);
    expect(habit.motivation3Visible).toBe(false);
    expect(habit.trigger1Visible).toBe(true);
    expect(habit.trigger2Visible).toBe(true);
  });
});
