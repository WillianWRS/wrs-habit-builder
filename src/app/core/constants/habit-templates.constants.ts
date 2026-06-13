import { ALL_WEEKDAYS } from '../models/habit.model';
import type { Weekday } from '../models/weekday.model';

export type HabitTemplateId = 'reading' | 'walking' | 'meditation';

export interface HabitTemplate {
  id: HabitTemplateId;
  label: string;
  icon: string;
  description: string;
  name: string;
  category: string;
  scheduleDays: Weekday[];
  generalGoal: string;
  minimumAction: string;
  trigger: string;
  motivation: string;
}

export const HABIT_TEMPLATES: readonly HabitTemplate[] = [
  {
    id: 'reading',
    label: 'Leitura',
    icon: 'bi-book',
    description: 'Se café da manhã, então 1 página',
    name: 'Leitura diária',
    category: 'Conhecimento',
    scheduleDays: [...ALL_WEEKDAYS],
    generalGoal: 'Ler 10 páginas',
    minimumAction: 'Ler 1 página',
    trigger: 'Se tomar café da manhã',
    motivation: 'Mente mais clara',
  },
  {
    id: 'walking',
    label: 'Caminhada',
    icon: 'bi-heart-pulse',
    description: 'Se almoço, então 10 minutos',
    name: 'Caminhada',
    category: 'Saúde',
    scheduleDays: [1, 3, 5],
    generalGoal: 'Caminhar 20 minutos',
    minimumAction: 'Caminhar 10 minutos',
    trigger: 'Se terminar o almoço',
    motivation: 'Corpo em movimento',
  },
  {
    id: 'meditation',
    label: 'Meditação',
    icon: 'bi-moon-stars',
    description: 'Se acordar, então 3 respirações',
    name: 'Meditação',
    category: 'Bem-estar',
    scheduleDays: [...ALL_WEEKDAYS],
    generalGoal: 'Meditar 10 minutos',
    minimumAction: 'Respirar 3 vezes com atenção',
    trigger: 'Se acordar',
    motivation: 'Começar o dia com calma',
  },
] as const;

export function resolveHabitTemplateId(
  value: string | null | undefined,
): HabitTemplateId | null {
  if (!value) {
    return null;
  }

  return HABIT_TEMPLATES.some((template) => template.id === value)
    ? (value as HabitTemplateId)
    : null;
}

export function getHabitTemplate(id: HabitTemplateId): HabitTemplate {
  const template = HABIT_TEMPLATES.find((entry) => entry.id === id);

  if (!template) {
    throw new Error(`Unknown habit template: ${id}`);
  }

  return template;
}
