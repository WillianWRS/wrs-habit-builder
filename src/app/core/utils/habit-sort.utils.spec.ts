import {
  compareHabitsByPreference,
  sortHabitsByPreference,
} from './habit-sort.utils';

type TestHabit = {
  dayCount: number;
  name: string;
  time: string;
};

function habit(
  name: string,
  time = '',
  dayCount = 0,
): TestHabit {
  return { name, time, dayCount };
}

describe('compareHabitsByPreference', () => {
  describe('time-asc', () => {
    it('ordena por horário crescente', () => {
      expect(
        compareHabitsByPreference(
          habit('B', '09:00'),
          habit('A', '08:00'),
          'time-asc',
        ),
      ).toBeGreaterThan(0);
    });

    it('coloca hábitos sem horário ao final', () => {
      expect(
        compareHabitsByPreference(
          habit('Sem horário'),
          habit('Com horário', '07:00'),
          'time-asc',
        ),
      ).toBeGreaterThan(0);
    });

    it('desempata por nome A→Z quando horário é igual', () => {
      expect(
        compareHabitsByPreference(
          habit('Zebra', '08:00'),
          habit('Alpha', '08:00'),
          'time-asc',
        ),
      ).toBeGreaterThan(0);
    });

    it('desempata por nome A→Z quando ambos não têm horário', () => {
      expect(
        compareHabitsByPreference(habit('Zebra'), habit('Alpha'), 'time-asc'),
      ).toBeGreaterThan(0);
    });
  });

  describe('time-desc', () => {
    it('ordena por horário decrescente', () => {
      expect(
        compareHabitsByPreference(
          habit('Manhã', '07:00'),
          habit('Tarde', '18:00'),
          'time-desc',
        ),
      ).toBeGreaterThan(0);
    });

    it('coloca hábitos sem horário ao final', () => {
      expect(
        compareHabitsByPreference(
          habit('Sem horário'),
          habit('Com horário', '22:00'),
          'time-desc',
        ),
      ).toBeGreaterThan(0);
    });

    it('desempata por nome A→Z quando horário é igual', () => {
      expect(
        compareHabitsByPreference(
          habit('Zebra', '20:00'),
          habit('Alpha', '20:00'),
          'time-desc',
        ),
      ).toBeGreaterThan(0);
    });
  });

  describe('outras ordenações', () => {
    it('ordena por dias decrescente', () => {
      expect(
        compareHabitsByPreference(
          habit('A', '', 3),
          habit('B', '', 7),
          'days-desc',
        ),
      ).toBeGreaterThan(0);
    });

    it('ordena por nome A→Z', () => {
      expect(
        compareHabitsByPreference(habit('Zebra'), habit('Alpha'), 'name-asc'),
      ).toBeGreaterThan(0);
    });
  });
});

describe('sortHabitsByPreference', () => {
  it('ordena lista por horário ASC como padrão esperado', () => {
    const sorted = sortHabitsByPreference(
      [
        habit('Tarde', '18:00'),
        habit('Sem horário'),
        habit('Manhã', '07:30'),
        habit('Meio-dia', '12:00'),
      ],
      'time-asc',
    );

    expect(sorted.map((item) => item.name)).toEqual([
      'Manhã',
      'Meio-dia',
      'Tarde',
      'Sem horário',
    ]);
  });

  it('ordena lista por horário DESC', () => {
    const sorted = sortHabitsByPreference(
      [
        habit('Manhã', '07:30'),
        habit('Sem horário'),
        habit('Tarde', '18:00'),
        habit('Meio-dia', '12:00'),
      ],
      'time-desc',
    );

    expect(sorted.map((item) => item.name)).toEqual([
      'Tarde',
      'Meio-dia',
      'Manhã',
      'Sem horário',
    ]);
  });
});
