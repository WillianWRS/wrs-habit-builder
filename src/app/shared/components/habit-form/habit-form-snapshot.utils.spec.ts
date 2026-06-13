import { describe, expect, it } from 'vitest';
import {
  captureHabitFormSnapshot,
  isHabitFormSnapshotDirty,
} from './habit-form-snapshot.utils';

describe('habit-form-snapshot.utils', () => {
  const baselineValue = {
    name: 'Leitura',
    category: 'Mente',
    triggers: [{ text: 'Após café', visible: true }],
    motivations: [{ text: 'Aprender', visible: true }],
  };

  it('retorna false quando snapshot atual é igual ao baseline', () => {
    const baseline = captureHabitFormSnapshot([1, 3, 5], baselineValue);
    const current = captureHabitFormSnapshot([1, 3, 5], baselineValue);

    expect(isHabitFormSnapshotDirty(baseline, current)).toBe(false);
  });

  it('retorna true quando um campo do formulário muda', () => {
    const baseline = captureHabitFormSnapshot([1, 3, 5], baselineValue);
    const current = captureHabitFormSnapshot([1, 3, 5], {
      ...baselineValue,
      name: 'Meditação',
    });

    expect(isHabitFormSnapshotDirty(baseline, current)).toBe(true);
  });

  it('retorna true quando scheduleDays muda fora do FormGroup', () => {
    const baseline = captureHabitFormSnapshot([1, 3, 5], baselineValue);
    const current = captureHabitFormSnapshot([1, 2, 3], baselineValue);

    expect(isHabitFormSnapshotDirty(baseline, current)).toBe(true);
  });

  it('retorna true quando FormArray de triggers muda', () => {
    const baseline = captureHabitFormSnapshot([1, 3, 5], baselineValue);
    const current = captureHabitFormSnapshot([1, 3, 5], {
      ...baselineValue,
      triggers: [
        { text: 'Após café', visible: true },
        { text: 'Antes de dormir', visible: true },
      ],
    });

    expect(isHabitFormSnapshotDirty(baseline, current)).toBe(true);
  });
});
