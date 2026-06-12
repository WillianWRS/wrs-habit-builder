import { describe, expect, it } from 'vitest';
import { formatHabitCompletionAnnouncement } from './today-completion-announcement.utils';

describe('formatHabitCompletionAnnouncement', () => {
  it('anuncia hábito marcado com progresso do dia', () => {
    expect(formatHabitCompletionAnnouncement('Leitura', true, 3, 5)).toBe(
      'Leitura marcada, 3 de 5 concluídos',
    );
  });

  it('anuncia hábito desmarcado com progresso do dia', () => {
    expect(formatHabitCompletionAnnouncement('Leitura', false, 2, 5)).toBe(
      'Leitura desmarcada, 2 de 5 concluídos',
    );
  });
});
