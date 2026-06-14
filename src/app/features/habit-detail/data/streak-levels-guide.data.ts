import type { MarqueeItem } from '../../../core/utils/habit-trigger-motivation.utils';
import type { Weekday } from '../../../core/models/weekday.model';
import type { StreakTier } from '../../today/components/habit-card/habit-card-streak.utils';

export interface StreakLevelGuideExample {
  level: number;
  tier: StreakTier;
  title: string;
  thresholdLabel: string;
  habitId: string;
  name: string;
  displayMeta: string;
  minimumAction: string;
  category: string;
  time: string;
  scheduleDays: Weekday[];
  dayCount: number;
  marqueeItems: MarqueeItem[];
}

export const STREAK_LEVELS_GUIDE_INTRO =
  'Os níveis celebram dias seguidos em que você cumpriu o hábito nos dias programados. ' +
  'Um dia de pausa não apaga seu histórico — a sequência recomeça quando você volta ao ritmo.';

/** Exemplos fixos do nível 5 (Perfeito) ao 1 (Começando), sempre marcados. */
export const STREAK_LEVELS_GUIDE_EXAMPLES: StreakLevelGuideExample[] = [
  {
    level: 5,
    tier: 4,
    title: 'Perfeito',
    thresholdLabel: '66+ dias',
    habitId: 'guide-perfeito',
    name: 'Meditar',
    displayMeta: 'manhã',
    minimumAction: 'Respirar 10 minutos em silêncio',
    category: 'Mindfulness',
    time: '07:00',
    scheduleDays: [1, 2, 3, 4, 5, 6, 0],
    dayCount: 72,
    marqueeItems: [
      { type: 'trigger', text: 'Depois do café' },
      { type: 'motivation', text: 'Começo o dia mais calmo' },
    ],
  },
  {
    level: 4,
    tier: 3,
    title: 'Excelente',
    thresholdLabel: '30–65 dias',
    habitId: 'guide-excelente',
    name: 'Caminhar',
    displayMeta: 'tarde',
    minimumAction: '20 minutos de passeio leve',
    category: 'Corpo',
    time: '18:30',
    scheduleDays: [1, 3, 5],
    dayCount: 45,
    marqueeItems: [
      { type: 'trigger', text: 'Ao sair do trabalho' },
      { type: 'motivation', text: 'Descomprimo antes do jantar' },
    ],
  },
  {
    level: 3,
    tier: 2,
    title: 'Ótimo',
    thresholdLabel: '21–29 dias',
    habitId: 'guide-otimo',
    name: 'Ler',
    displayMeta: 'noite',
    minimumAction: '15 minutos de leitura',
    category: 'Estudo',
    time: '22:00',
    scheduleDays: [1, 2, 3, 4, 5],
    dayCount: 24,
    marqueeItems: [
      { type: 'trigger', text: 'Antes de dormir' },
      { type: 'motivation', text: 'Fechar o dia com foco' },
    ],
  },
  {
    level: 2,
    tier: 1,
    title: 'Bom',
    thresholdLabel: '7–20 dias',
    habitId: 'guide-bom',
    name: 'Alongar',
    displayMeta: 'manhã',
    minimumAction: '5 minutos de alongamento',
    category: 'Corpo',
    time: '06:45',
    scheduleDays: [1, 2, 3, 4, 5, 6],
    dayCount: 12,
    marqueeItems: [
      { type: 'trigger', text: 'Depois de levantar' },
      { type: 'motivation', text: 'Corpo mais solto no dia' },
    ],
  },
  {
    level: 1,
    tier: 0,
    title: 'Começando',
    thresholdLabel: '0–6 dias',
    habitId: 'guide-comecando',
    name: 'Beber água',
    displayMeta: 'manhã',
    minimumAction: '1 copo ao acordar',
    category: 'Saúde',
    time: '07:15',
    scheduleDays: [1, 2, 3, 4, 5, 6, 0],
    dayCount: 4,
    marqueeItems: [
      { type: 'trigger', text: 'Ao abrir a geladeira' },
      { type: 'motivation', text: 'Hidratar antes do café' },
    ],
  },
];
