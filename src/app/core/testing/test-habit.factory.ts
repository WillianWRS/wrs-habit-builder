import { ALL_WEEKDAYS, type Habit } from '../models/habit.model';
import { padSlots } from '../models/habit-slot.model';
import { buildInitialScheduleDaySince } from '../utils/habit-streak.utils';

/** Factory compartilhada por specs — hábito mínimo válido no schema v8. */
export function createTestHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    name: 'Teste',
    generalGoal: '',
    dynamicGoals: false,
    weekdayGoals: [],
    category: 'outro',
    triggers: padSlots([
      { text: 'Se X', visible: true },
      { text: 'Então Y', visible: true },
      { text: '', visible: false },
    ]),
    motivations: padSlots([
      { text: 'Motivação', visible: true },
      { text: 'Motivação 2', visible: true },
      { text: '', visible: false },
    ]),
    minimumAction: '1 passo',
    scheduleDays: [...ALL_WEEKDAYS],
    scheduleDaySince: buildInitialScheduleDaySince([...ALL_WEEKDAYS], '2026-01-01'),
    time: '',
    archived: false,
    createdAt: '2026-01-01T12:00:00.000Z',
    showOnToday: true,
    ...overrides,
  };
}
