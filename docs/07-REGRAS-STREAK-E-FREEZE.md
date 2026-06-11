# Regras oficiais — Streak, Freeze e Modo Férias (futuro)

> Especificação de domínio aprovada para o **Habitua** (marca em adoção). Fonte de verdade para implementação, testes e copy. Data: junho/2026.

---

## 1. Princípios

| Princípio | Implicação |
|-----------|------------|
| **Completions são fatos** | `HabitCompletion[]` é append-only. Nenhuma feature deleta completions (exceto exclusão permanente do hábito pelo usuário). |
| **Streak é interpretação** | Calculada em tempo real a partir do log + eventos de freeze. Nunca gravada como estado que sobrescreve o histórico. |
| **Consistência > perfeição** | A métrica principal continua sendo **adesão (%)** (RN-04). Streak é motivação gamificada; adesão é a verdade. |
| **Tolerância com orçamento** | Freeze cobre o tropeço pontual; faltas consecutivas na mesma semana quebram a sequência. Não é impunidade total. |
| **Falha sem culpa** | Quebra de streak ≠ perda de histórico. Copy de retomada, nunca punição por apagão de dados. |

Referência científica/comportamental: tolerância a falha pontual (Lally, UCL); "never miss twice" (James Clear) — implementado via freeze semanal com teto, não via permissividade permanente.

---

## 2. Streak — regras de cálculo (RN-07)

### 2.1 Definições

| Métrica | Significado |
|---------|-------------|
| **Sequência atual** (`currentStreak`) | Dias **agendados** consecutivos concluídos, contando de hoje/ontem para trás, até a primeira quebra não coberta por freeze. |
| **Recorde** (`bestStreak`) | Maior sequência histórica já alcançada (varredura de todas as janelas no passado). |
| **Total** (`totalCompletions`) | Contagem de completions do hábito (dias em que marcou feito). |

### 2.2 Quando a sequência quebra

- A sequência **quebra na 1ª falta** em um dia agendado (`scheduleDays`), **exceto** se um freeze estiver disponível e for consumido automaticamente naquele dia.
- **Duas faltas em dias agendados na mesma semana** (calendário ISO ou semana local do usuário) **sempre quebram** a sequência — só existe 1 freeze por semana por hábito.
- Padrão "dia sim, dia não" (50% de adesão) **não** mantém sequência infinita: a 2ª falta da semana quebra.

### 2.3 Regras de borda (obrigatórias nos testes)

| Caso | Comportamento |
|------|---------------|
| Dia fora de `scheduleDays` | Não conta como falta nem como dia da sequência (RN-02). |
| Antes de `habit.createdAt` | Não retroage; sequência só considera dias a partir da criação do hábito. |
| Hoje ainda não marcado | **Não** quebra a sequência — avaliação de falta começa a partir de **ontem** (dia em curso é neutro). |
| Edição de `scheduleDays` | Usar `scheduleDaySince` (já existente) para não gerar faltas retroativas falsas. |
| Desmarcar conclusão de hoje | Recalcula sequência; pode expor falta de ontem se aplicável. |
| Virada de meia-noite | `CurrentDayService` dispara recálculo; `computed` deve depender do signal de "hoje". |

### 2.4 O que NÃO fazer (legado a remover)

- ❌ `reconcileStreakResets` e qualquer `effect()` que delete completions.
- ❌ `shouldReset` que dispara mutação de storage.
- ❌ Contagem regressiva de ameaça no card ("mais N faltas interrompem…").
- ❌ `STREAK_MISS_TOLERANCE = 7` como gatilho de apagão de histórico.

### 2.5 Exibição na UI

| Superfície | O que mostrar |
|------------|---------------|
| Card **Hoje** | Sequência atual (+ tiers visuais se mantidos). Se freeze foi consumido recentemente: copy de reasseguramento ("Protegido na terça — sequência intacta"). **Sem** inventário de escudos disponíveis. |
| **Detalhe do hábito** | Sequência atual · Recorde · Total. Inventário de freeze (ex.: 1/1 ou 2/2) e quando reabastece. |
| **Heatmap** | Dia concluído · dia falta · dia protegido por freeze (ícone de escudo). |

Copy ao quebrar (exemplo): *"Sequência atual: 0 · Recorde: 47 · Total: 132 dias. Recomece hoje no mesmo gatilho."*

---

## 3. Freeze — proteção semanal (RN-08)

### 3.1 Regras (oficializadas)

| Regra | Valor |
|-------|-------|
| Ganho | **+1 freeze por semana** por hábito |
| Consumo | **Automático** na 1ª falta da semana em dia agendado |
| Teto de acúmulo | **1** (free) · **2** (premium) |
| Reabastecimento | Início de cada semana: se estoque &lt; teto, credita +1 (não acumula além do teto) |
| Escopo | **Por hábito** (cada hábito tem seu próprio estoque) |

### 3.2 Persistência

Freeze consumido é um **evento** no log (append-only), não um booleano em cada completion:

```typescript
interface HabitFreezeUsed {
  id: string;
  habitId: string;
  dateKey: string;  // dia agendado que foi coberto
  usedAt: string;   // ISO 8601
}
```

O cálculo de streak consulta completions + eventos `freeze-used` para decidir se uma falta foi coberta.

### 3.3 UI e honestidade visual

- Heatmap: ícone de **escudo** no dia protegido (não finge conclusão).
- Card Hoje: mensagem pós-consumo quando relevante; sem mostrar "você tem 1 escudo" antes da decisão de agir.
- Detalhe: estoque atual + histórico de usos.

### 3.4 Monetização (alinhado ao relatório 04)

- Free: teto 1 freeze armazenado.
- Premium: teto 2 freezes armazenados.
- **Não** vender "conserto de streak" pós-quebra (pay-to-win contradiz a tese).

---

## 4. Modo Férias — **futuro** (Horizonte 2+)

> Não entra na Sprint 1 nem no alfa. Especificação para roadmap e design antecipado.

### 4.1 Propósito

Pausa **planejada** (viagem, cirurgia, semana off) — distinto do freeze, que cobre falha **não planejada**.

### 4.2 Regras propostas

| Regra | Valor |
|-------|-------|
| Escopo | Um hábito ou **vários hábitos de uma vez** |
| Duração máxima | Até **3 semanas** (21 dias) por período de férias |
| Agendamento | **Somente para o futuro** — não retroativo |
| Efeito na streak | **Congela** no valor atual (não cresce, não quebra) |
| Efeito em "Hoje" | Hábito(s) em férias **não aparecem** no dashboard no período |
| Efeito na adesão | Dias em férias **não entram** em dias esperados do período |
| Heatmap | Ícone que remeta a **férias** (ex.: palmeira, avião, sol) — distinto do escudo do freeze |
| Cooldown | Após o fim das férias, só pode entrar em modo férias de novo após **7 dias ativos** (dias em que o hábito voltou ao agendamento normal) |

### 4.3 Anti-abuso (design)

- Férias não retroativas eliminam "faltei a semana e liguei férias depois".
- Streak congela, não avança — quem pausa todo mês não progride.
- Adesão % permanece como âncora da verdade.
- Contador anual de dias em férias visível no detalhe (transparência).

### 4.4 Persistência (esboço)

```typescript
interface HabitVacation {
  id: string;
  habitIds: string[];       // um ou vários
  startDateKey: string;     // YYYY-MM-DD
  endDateKey: string;       // inclusive, máx. 21 dias após start
  createdAt: string;
}
```

---

## 5. Mapeamento para requisitos

| ID | Regra / RF | Sprint |
|----|------------|--------|
| RN-07 | Streak derivada; quebra na 1ª falta não coberta; recorde e total preservados | Sprint 1 (Tarefa 1) |
| RN-08 | Freeze semanal automático com teto 1/2 | Sprint 1 (Tarefa 1) ou H1 se escopo grande |
| RF-09 | Streak atual + recorde + total na UI | H1 (detalhe + cards) |
| Modo férias | Horizonte 2+ | Após alfa |

---

## 6. Referências internas

- Decisão D1 (event log imutável): `docs/03-ARQUITETURA-E-ROADMAP.md`
- Copy e UX: `docs/02-AVALIACAO-UI-UX.md` (itens 1 e 4)
- Premium / freeze: `docs/04-VISAO-DE-NEGOCIO.md`
- Implementação Sprint 1: `docs/SPRINT-1-TAREFA-01.md`
