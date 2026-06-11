---
name: habit-builder-product
description: >-
  Domain rules, routes, and product decisions for WRS Habit Builder (Angular,
  localStorage, no auth). Use when implementing features, business logic,
  copy/microcopy, metrics, or validating behavior against product requirements.
---

# Habit Builder — Produto

## Decisões fixas (não negociar)

| Decisão | Valor |
|---------|-------|
| Autenticação | **Nenhuma** — app abre direto no fluxo principal |
| Persistência | **localStorage** no browser (sem API/backend no MVP) |
| Modo demo | **Não existe** — dados reais do usuário desde o primeiro uso |
| Idioma | **PT-BR** em labels, copy e empty states |
| Nome | **Habitua** (marca em adoção); repo `wrs-habit-builder` |

Se o relatório de descoberta mencionar JWT, Spring ou PostgreSQL, **ignore** — escopo atual é frontend-only.

## Tese de design (guia de decisão)

| Princípio | Implicação no app |
|-----------|-------------------|
| Gatilho explícito | Todo hábito tem `triggerText` (formato "Se X, então Y") |
| Ação mínima (Fogg) | Campo obrigatório `minimumAction`, máx. 140 caracteres |
| Consistência > perfeição | Métrica principal = **taxa de adesão (%)**, não streak frágil |
| Falha sem culpa | Copy neutra: "Recomeçar amanhã no mesmo gatilho" — nunca "Você falhou" |
| Frequência flexível | Dias da semana configuráveis (ex.: seg/qua/sex) |

## Modelo de domínio

```typescript
type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=dom … 6=sáb

interface Habit {
  id: string;           // UUID v4
  name: string;
  category: HabitCategory;
  triggerText: string;  // intenção "Se … então …"
  minimumAction: string;
  scheduleDays: Weekday[];
  optionalReminder?: string; // "HH:mm" ou omitido
  archived: boolean;
  createdAt: string;    // ISO 8601
}

interface HabitCompletion {
  id: string;
  habitId: string;
  completedOn: string;  // "YYYY-MM-DD" (data local do usuário)
}

type HabitCategory =
  | 'saude'
  | 'estudo'
  | 'corpo'
  | 'mindfulness'
  | 'outro';
```

Detalhes de persistência: skill `habit-builder-localstorage`.

## Regras de negócio

| ID | Regra |
|----|-------|
| RN-01 | Um hábito só pode ser marcado **uma vez por dia** |
| RN-02 | Frequência respeita `scheduleDays` |
| RN-03 | Fora do dia configurado, hábito **não aparece** em "Hoje" |
| RN-04 | Adesão = dias concluídos ÷ dias **esperados** no período (7 ou 30 dias) |
| RN-05 | Arquivar **não apaga** histórico de completions |
| RN-06 | `minimumAction` limitado a **140 caracteres** |
| RN-07 | Streak **derivada** do log; quebra na 1ª falta em dia agendado não coberta por freeze; recorde e total **nunca** regridem |
| RN-08 | Freeze: **+1/semana/hábito**, consumo **automático** na falta, teto **1** (free) / **2** (premium); gravado como evento `freeze-used` |

### Cálculo de adesão (RN-04)

```
diasEsperados = count(dias no período onde weekday ∈ habit.scheduleDays)
diasConcluidos = count(completions no período para habitId)
adesão = diasEsperados > 0 ? round(diasConcluidos / diasEsperados * 100) : 0
```

Períodos padrão na UI: **7 dias** e **30 dias** (rolling, incluindo hoje).

### Streak e freeze (RN-07, RN-08)

Especificação completa: `docs/07-REGRAS-STREAK-E-FREEZE.md`.

**Streak (interpretação, não estado gravado):**

- `currentStreak`: dias agendados consecutivos concluídos, de hoje/ontem para trás, até quebra não coberta.
- `bestStreak`: maior sequência histórica.
- `totalCompletions`: total de dias marcados.
- Quebra na **1ª falta** em dia agendado, salvo freeze automático; **2ª falta na mesma semana** sempre quebra.
- Hoje não marcado **não** quebra; dias fora de `scheduleDays` não contam como falta; não retroagir antes de `createdAt`.
- **Nunca** deletar completions para “zerar” streak.

**Freeze (por hábito):**

- +1 por semana; consumo automático na falta; teto 1 (free) / 2 (premium).
- Evento append-only: `HabitFreezeUsed { habitId, dateKey, usedAt }`.
- Heatmap: escudo no dia protegido (não finge conclusão). Card Hoje: sem inventário de escudos; detalhe do hábito mostra estoque.

**Modo férias (futuro — Horizonte 2+):** pausa planejada de 1+ hábitos, até 3 semanas, só agendamento futuro, ícone de férias no heatmap, cooldown de 7 dias ativos antes de nova pausa. Ver `docs/07-REGRAS-STREAK-E-FREEZE.md` §4.

## Rotas

| Rota | Tela |
|------|------|
| `/` ou `/today` | Hoje (dashboard) |
| `/habits` | Lista de hábitos |
| `/habits/new` | Criar hábito |
| `/habits/:id` | Detalhe |
| `/habits/:id/edit` | Editar hábito |

**Não criar** `/auth`, guards de login ou rotas protegidas.

Redirect padrão: `/` → dashboard Hoje.

## Requisitos funcionais (prioridade)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-01 | CRUD hábito: nome, categoria, frequência | P0 |
| RF-02 | Gatilho + ação mínima no formulário | P0 |
| RF-03 | Listar hábitos do **dia atual** (pendente/concluído) | P0 |
| RF-04 | Marcar conclusão em **1 ação** | P0 |
| RF-05 | Desmarcar conclusão do dia | P1 |
| RF-06 | Editar e arquivar hábito | P1 |
| RF-07 | Detalhe: heatmap 30–66 dias | P1 |
| RF-08 | Taxa de adesão 7d / 30d | P1 |
| RF-09 | Streak atual + recorde + total; freeze semanal | P1 (Sprint 1) |

## Fluxo principal (sem auth)

```
Abrir app → Dashboard Hoje
  → sem hábitos? empty state + CTA criar
  → com hábitos? listar do dia → marcar → feedback visual → atualizar métricas
```

## Copy e tom

- Encorajador, objetivo, **sem culpa**
- Empty state Hoje: exemplo "Se café, então 1 página"
- Modal "Por que ação mínima?": citar Fogg (comportamento = motivação × habilidade × prompt)
- Falha/neutro: "Recomeçar amanhã no mesmo gatilho"

## Estrutura de pastas sugerida

```
src/app/
├── core/           # serviços singleton, storage, date utils
├── features/
│   ├── today/
│   ├── habits/
│   └── habit-detail/
├── shared/         # componentes reutilizáveis, pipes
└── models/         # tipos de domínio
```

## Checklist antes de considerar feature pronta

- [ ] Respeita RN-01 a RN-08
- [ ] Sem auth, sem chamadas HTTP para persistência
- [ ] Copy em PT-BR, tom sem culpa
- [ ] Hábito fora de `scheduleDays` não aparece em Hoje
- [ ] Arquivar preserva completions

## Referência

Brief completo de descoberta (contexto histórico): `docs/RELATORIO-DESCOBERTA-HABIT-BUILDER.md` se existir no workspace; decisões desta skill **prevalecem** sobre auth/backend do relatório.
