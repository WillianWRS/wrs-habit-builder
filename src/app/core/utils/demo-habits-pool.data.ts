import { ALL_WEEKDAYS } from '../models/habit.model';
import type { DemoHabitPoolEntry } from '../models/demo-habit-pool-entry.model';
import {
  createDefaultWeekdayGoals,
  type HabitWeekdayGoal,
} from '../models/habit-weekday-goal.model';
import type { Weekday } from '../models/weekday.model';

const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5];
const WEEKEND: Weekday[] = [0, 6];

interface HabitBlueprint {
  name: string;
  category: string;
  trigger1: string;
  trigger2: string;
  motivation1: string;
  motivation2: string;
  minimumAction: string;
  optionalReminder: string;
  metaGeral: string;
}

function withWeekdayGoals(
  goals: Partial<Record<Weekday, Partial<Pick<HabitWeekdayGoal, 'meta' | 'minimumAction' | 'optionalReminder'>>>>,
): HabitWeekdayGoal[] {
  return createDefaultWeekdayGoals().map((entry) => ({
    ...entry,
    ...goals[entry.weekday],
  }));
}

function generalHabit(
  blueprint: HabitBlueprint,
  scheduleDays: Weekday[],
  overrides: Partial<Pick<DemoHabitPoolEntry, 'metaGeral' | 'minimumAction' | 'optionalReminder'>> = {},
): DemoHabitPoolEntry {
  return {
    ...blueprint,
    ...overrides,
    metasDinamicas: false,
    weekdayGoals: createDefaultWeekdayGoals(),
    scheduleDays,
  };
}

function dynamicHabit(
  blueprint: HabitBlueprint,
  scheduleDays: Weekday[],
  weekdayGoals: HabitWeekdayGoal[],
): DemoHabitPoolEntry {
  return {
    ...blueprint,
    metaGeral: '',
    metasDinamicas: true,
    weekdayGoals,
    scheduleDays,
  };
}

const BLUEPRINTS: HabitBlueprint[] = [
  {
    name: 'Caminhada matinal',
    category: 'Corpo',
    trigger1: 'Ao calçar o tênis na varanda',
    trigger2: 'Depois de escovar os dentes',
    motivation1: 'Começar o dia em movimento',
    motivation2: 'Clarear a mente antes do trabalho',
    minimumAction: 'Caminhar 10 minutos',
    optionalReminder: '06:30',
    metaGeral: '30 minutos',
  },
  {
    name: 'Leitura diária',
    category: 'Estudo',
    trigger1: 'Ao sentar no sofá após o jantar',
    trigger2: 'Quando fechar o notebook do trabalho',
    motivation1: 'Crescer um pouco todo dia',
    motivation2: 'Substituir scroll por conteúdo bom',
    minimumAction: 'Ler 2 páginas',
    optionalReminder: '21:00',
    metaGeral: '15 páginas',
  },
  {
    name: 'Meditação guiada',
    category: 'Mindfulness',
    trigger1: 'Ao abrir o app de meditação',
    trigger2: 'Depois de desligar o despertador',
    motivation1: 'Menos ansiedade ao longo do dia',
    motivation2: 'Responder com mais calma',
    minimumAction: 'Meditar 3 minutos',
    optionalReminder: '07:00',
    metaGeral: '10 minutos',
  },
  {
    name: 'Treino de musculação',
    category: 'Corpo',
    trigger1: 'Ao vestir a roupa de treino',
    trigger2: 'Ao chegar na academia',
    motivation1: 'Ficar mais forte aos poucos',
    motivation2: 'Honrar o compromisso comigo',
    minimumAction: 'Fazer 1 série de qualquer exercício',
    optionalReminder: '18:30',
    metaGeral: '45 minutos',
  },
  {
    name: 'Alongamento',
    category: 'Corpo',
    trigger1: 'Ao abrir o tapete na sala',
    trigger2: 'Depois de fechar o laptop',
    motivation1: 'Aliviar tensão do pescoço',
    motivation2: 'Dormir com menos dor',
    minimumAction: 'Alongar pescoço e ombros por 2 min',
    optionalReminder: '22:00',
    metaGeral: '8 minutos',
  },
  {
    name: 'Beber água',
    category: 'Saúde',
    trigger1: 'Ao ver a garrafa na mesa',
    trigger2: 'Depois de cada ida ao banheiro',
    motivation1: 'Menos dor de cabeça',
    motivation2: 'Manter energia estável',
    minimumAction: 'Beber 1 copo cheio',
    optionalReminder: '09:00',
    metaGeral: '2 litros',
  },
  {
    name: 'Estudar inglês',
    category: 'Estudo',
    trigger1: 'Ao abrir o app de idiomas',
    trigger2: 'Depois do café da manhã',
    motivation1: 'Abrir portas profissionais',
    motivation2: 'Assistir séries sem legenda',
    minimumAction: 'Completar 1 lição curta',
    optionalReminder: '08:00',
    metaGeral: '20 minutos',
  },
  {
    name: 'Escrever no diário',
    category: 'Mindfulness',
    trigger1: 'Ao abrir o caderno na mesa',
    trigger2: 'Antes de apagar a luz',
    motivation1: 'Organizar pensamentos',
    motivation2: 'Lembrar do que importou no dia',
    minimumAction: 'Escrever 3 linhas',
    optionalReminder: '22:30',
    metaGeral: '1 página',
  },
  {
    name: 'Preparar marmita',
    category: 'Alimentação',
    trigger1: 'Ao abrir a geladeira no domingo',
    trigger2: 'Depois do almoço de sábado',
    motivation1: 'Comer melhor na semana',
    motivation2: 'Gastar menos com delivery',
    minimumAction: 'Separar 1 porção de proteína',
    optionalReminder: '11:00',
    metaGeral: '4 marmitas',
  },
  {
    name: 'Dormir no horário',
    category: 'Saúde',
    trigger1: 'Ao desligar a TV',
    trigger2: 'Quando o alarme de sono tocar',
    motivation1: 'Acordar sem ressaca de cansaço',
    motivation2: 'Ter energia para treinar',
    minimumAction: 'Deitar no horário combinado',
    optionalReminder: '23:00',
    metaGeral: '7h30 de sono',
  },
  {
    name: 'Acordar sem soneca',
    category: 'Saúde',
    trigger1: 'Ao tocar o primeiro alarme',
    trigger2: 'Quando os pés tocarem o chão',
    motivation1: 'Ganhar tempo útil de manhã',
    motivation2: 'Não começar o dia correndo',
    minimumAction: 'Levantar na primeira tentativa',
    optionalReminder: '06:45',
    metaGeral: 'Sem soneca',
  },
  {
    name: 'Praticar violão',
    category: 'Criatividade',
    trigger1: 'Ao tirar o violão do suporte',
    trigger2: 'Depois de jantar',
    motivation1: 'Tocar uma música inteira',
    motivation2: 'Relaxar fazendo algo manual',
    minimumAction: 'Praticar 1 escala devagar',
    optionalReminder: '20:00',
    metaGeral: '25 minutos',
  },
  {
    name: 'Estudar programação',
    category: 'Estudo',
    trigger1: 'Ao abrir o editor de código',
    trigger2: 'Depois de fechar o e-mail',
    motivation1: 'Construir projetos próprios',
    motivation2: 'Ficar mais confiante no trabalho',
    minimumAction: 'Resolver 1 exercício pequeno',
    optionalReminder: '19:00',
    metaGeral: '1 pomodoro',
  },
  {
    name: 'Revisar finanças',
    category: 'Finanças',
    trigger1: 'Ao abrir a planilha de gastos',
    trigger2: 'No último domingo do mês',
    motivation1: 'Saber para onde vai o dinheiro',
    motivation2: 'Guardar para viagens',
    minimumAction: 'Registrar 1 despesa pendente',
    optionalReminder: '10:00',
    metaGeral: 'Revisar extrato',
  },
  {
    name: 'Organizar a mesa',
    category: 'Casa',
    trigger1: 'Ao fechar o expediente',
    trigger2: 'Antes de começar a trabalhar',
    motivation1: 'Entrar no dia sem bagunça',
    motivation2: 'Focar sem distrações visuais',
    minimumAction: 'Guardar 3 itens fora do lugar',
    optionalReminder: '17:45',
    metaGeral: 'Mesa limpa',
  },
  {
    name: 'Ligar para a família',
    category: 'Relacionamentos',
    trigger1: 'Ao ver o lembrete no celular',
    trigger2: 'Depois do almoço de domingo',
    motivation1: 'Manter laços vivos',
    motivation2: 'Não deixar semanas passarem',
    minimumAction: 'Mandar 1 mensagem de voz',
    optionalReminder: '19:30',
    metaGeral: '1 ligação',
  },
  {
    name: 'Gratidão antes de dormir',
    category: 'Mindfulness',
    trigger1: 'Ao apoiar a cabeça no travesseiro',
    trigger2: 'Depois de escovar os dentes à noite',
    motivation1: 'Fechar o dia com leveza',
    motivation2: 'Notar o que deu certo',
    minimumAction: 'Anotar 1 coisa boa do dia',
    optionalReminder: '22:45',
    metaGeral: '3 gratidões',
  },
  {
    name: 'Café sem açúcar',
    category: 'Alimentação',
    trigger1: 'Ao preparar o café',
    trigger2: 'Antes da primeira reunião',
    motivation1: 'Reduzir picos de energia',
    motivation2: 'Cuidar da saúde a longo prazo',
    minimumAction: 'Tomar 1 xícara sem açúcar',
    optionalReminder: '07:30',
    metaGeral: 'Zero açúcar',
  },
  {
    name: 'Banho gelado',
    category: 'Saúde',
    trigger1: 'Ao terminar o banho morno',
    trigger2: 'Depois do treino',
    motivation1: 'Acordar o corpo de verdade',
    motivation2: 'Treinar desconforto controlado',
    minimumAction: '30 segundos de água fria',
    optionalReminder: '06:50',
    metaGeral: '2 minutos',
  },
  {
    name: 'Yoga em casa',
    category: 'Corpo',
    trigger1: 'Ao abrir o vídeo de yoga',
    trigger2: 'Depois de acordar',
    motivation1: 'Mobilidade para o dia inteiro',
    motivation2: 'Respirar com mais espaço',
    minimumAction: 'Fazer 1 postura com calma',
    optionalReminder: '07:15',
    metaGeral: '20 minutos',
  },
  {
    name: 'Corrida leve',
    category: 'Corpo',
    trigger1: 'Ao amarrar o cadarço na rua',
    trigger2: 'Depois do alongamento inicial',
    motivation1: 'Melhorar condicionamento',
    motivation2: 'Clarear a cabeça',
    minimumAction: 'Correr 5 minutos',
    optionalReminder: '06:00',
    metaGeral: '5 km',
  },
  {
    name: 'Pular corda',
    category: 'Corpo',
    trigger1: 'Ao pegar a corda na garagem',
    trigger2: 'Antes do banho da noite',
    motivation1: 'Treino rápido e eficiente',
    motivation2: 'Gastar energia acumulada',
    minimumAction: 'Pular 1 minuto',
    optionalReminder: '18:00',
    metaGeral: '10 minutos',
  },
  {
    name: 'Cuidar das plantas',
    category: 'Casa',
    trigger1: 'Ao pegar o regador',
    trigger2: 'Depois de abrir a janela',
    motivation1: 'Manter a casa viva',
    motivation2: 'Pausa consciente do trabalho',
    minimumAction: 'Regar 1 vaso',
    optionalReminder: '08:30',
    metaGeral: 'Todas as plantas',
  },
  {
    name: 'Limpar a caixa de entrada',
    category: 'Trabalho',
    trigger1: 'Ao abrir o e-mail profissional',
    trigger2: 'Antes da primeira tarefa',
    motivation1: 'Responder com mais clareza',
    motivation2: 'Não perder prazos',
    minimumAction: 'Arquivar ou responder 1 e-mail',
    optionalReminder: '09:15',
    metaGeral: 'Inbox zero',
  },
  {
    name: 'Pomodoro de foco',
    category: 'Trabalho',
    trigger1: 'Ao iniciar o timer',
    trigger2: 'Depois de fechar o chat',
    motivation1: 'Entregar trabalho profundo',
    motivation2: 'Evitar multitarefa',
    minimumAction: '25 min sem interrupções',
    optionalReminder: '14:00',
    metaGeral: '2 pomodoros',
  },
];

function buildVariants(blueprint: HabitBlueprint, index: number): DemoHabitPoolEntry[] {
  const variants: DemoHabitPoolEntry[] = [];

  variants.push(generalHabit(blueprint, [...ALL_WEEKDAYS]));

  variants.push(
    generalHabit(blueprint, [...WEEKDAYS], {
      optionalReminder: shiftTime(blueprint.optionalReminder, 30),
      minimumAction: shortenMinimum(blueprint.minimumAction),
    }),
  );

  variants.push(
    generalHabit(blueprint, [...WEEKEND], {
      metaGeral: blueprint.metaGeral ? `${blueprint.metaGeral} (fim de semana)` : '',
    }),
  );

  if (index % 3 === 0) {
    variants.push(
      dynamicHabit(
        { ...blueprint, metaGeral: '' },
        [...ALL_WEEKDAYS],
        withWeekdayGoals({
          1: {
            meta: 'Leve',
            minimumAction: shortenMinimum(blueprint.minimumAction),
            optionalReminder: '07:00',
          },
          3: {
            meta: 'Moderado',
            minimumAction: blueprint.minimumAction,
            optionalReminder: blueprint.optionalReminder,
          },
          5: {
            meta: 'Intenso',
            minimumAction: intensifyMinimum(blueprint.minimumAction),
            optionalReminder: shiftTime(blueprint.optionalReminder, 60),
          },
          6: {
            meta: 'Recuperação',
            minimumAction: shortenMinimum(blueprint.minimumAction),
            optionalReminder: '10:00',
          },
        }),
      ),
    );
  } else {
    variants.push(
      generalHabit(blueprint, index % 2 === 0 ? [...WEEKDAYS] : [1, 3, 5], {
        metaGeral: '',
      }),
    );
  }

  return variants;
}

function shiftTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const total = hours * 60 + mins + minutes;
  const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);

  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`;
}

function shortenMinimum(action: string): string {
  if (action.length <= 24) {
    return action;
  }

  return action.split(' ').slice(0, 4).join(' ');
}

function intensifyMinimum(action: string): string {
  return action.replace(/\d+/g, (match) => String(Number(match) * 2));
}

/** Pool fixo com 100 hábitos realistas e preenchimentos variados. */
export function buildDemoHabitPool(): DemoHabitPoolEntry[] {
  const pool = BLUEPRINTS.flatMap((blueprint, index) => buildVariants(blueprint, index));

  return pool.slice(0, 100);
}
