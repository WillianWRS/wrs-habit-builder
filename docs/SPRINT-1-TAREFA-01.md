# Sprint 1 — Tarefa 1: Streak derivada + remoção do reset destrutivo + Freeze

> Card pronto para o Trello. Bloqueia o alfa e todas as features de métricas (H1). Especificação completa: `docs/07-REGRAS-STREAK-E-FREEZE.md`.

---

## Título (Trello)

**Remover reset destrutivo e implementar streak derivada com freeze semanal**

---

## Contexto

Hoje o `HabitStorageService` chama `reconcileStreakResets()` via `effect()` e **deleta todas as completions** de um hábito após 7 faltas (`STREAK_MISS_TOLERANCE`). Isso já causou perda de dados reais e motivou o patch `COMPLETION_RESTORE_PATCH` (removido na Tarefa 2).

A streak passa a ser **100% calculada** a partir do log de completions + eventos de freeze. Quebrar a sequência **não apaga o passado** — só zera a contagem atual; recorde e total permanecem.

---

## Escopo IN

### A. Remover mutação destrutiva

- [ ] Remover `reconcileStreakResets()` e a chamada no `effect()` do construtor em `habit-storage.service.ts`.
- [ ] Remover `shouldReset` como gatilho de persistência (manter só se for flag de UI derivada, sem side effect).
- [ ] Garantir que nenhum outro caminho delete completions exceto exclusão permanente do hábito.

### B. Refatorar `habit-streak.utils.ts`

Substituir o modelo atual (`missCount`, `shouldReset`, tolerância 7) por funções puras:

```typescript
// Assinaturas sugeridas (ajustar nomes ao padrão do repo)
computeCurrentStreak(habit, completions, freezeEvents, referenceDate): number
computeBestStreak(habit, completions, freezeEvents): number
computeTotalCompletions(habitId, completions): number
computeFreezeBalance(habitId, freezeEvents, tier: 'free' | 'premium', referenceDate): { available: number; cap: number }
getScheduledDaysWalk(habit, fromDateKey, toDateKey): string[]  // só dias agendados, respeitando createdAt + scheduleDaySince
```

**Regra de quebra (RN-07):**

1. Caminhar de `referenceDate` (ou ontem, se hoje ainda não fechou) para trás, dia agendado a dia agendado.
2. Se o dia tem completion → conta +1 na sequência.
3. Se o dia não tem completion:
   - Se existe `freeze-used` para aquele `dateKey` → sequência continua (dia não quebra).
   - Senão → **para**; sequência atual = dias contados até aqui.
4. `computeBestStreak`: mesma lógica em varredura histórica de todas as janelas.

**Freeze (RN-08) — lógica de domínio nesta tarefa:**

- Por hábito: +1 freeze creditado no início de cada semana se `balance < cap`.
- Cap: **1** (assumir free até existir billing; constante configurável).
- Na detecção de falta em dia agendado: se `balance > 0`, consumir 1 freeze (gerar evento) e **não** quebrar a sequência naquele dia.
- Segunda falta na mesma semana sem freeze disponível → quebra.

> **Nota:** persistir `HabitFreezeUsed` pode ficar no storage nesta tarefa ou em stub in-memory até Tarefa 2/8 — mas o **cálculo** e os **testes** devem existir. Preferência: modelo + persistência mínima no mesmo PR.

### C. Modelo de dados

Adicionar ao schema (nova versão de migração se necessário, ou campo opcional em `AppStorage`):

```typescript
interface HabitFreezeUsed {
  id: string;
  habitId: string;
  dateKey: string;
  usedAt: string;
}
// AppStorage.freezeUsed: HabitFreezeUsed[]
```

Consumo automático: ao recalcular streak no fim do dia ou no `load()` do dia seguinte, **ou** explicitamente em função `applyAutomaticFreezeIfNeeded(habit, dateKey)` chamada pelo mapper — escolher um único ponto para não duplicar consumo.

### D. Atualizar consumidores

- [ ] `today-habit.mapper.ts` — usar novas métricas (`currentStreak`, `bestStreak`, `totalCompletions`).
- [ ] `habit-card.component.ts` — remover copy de ameaça (`mais N faltas…`, `STREAK_MISS_TOLERANCE`).
- [ ] Adicionar copy de reasseguramento quando freeze consumido na semana corrente (se card mostrar contexto de streak).
- [ ] `habit-streak.utils.spec.ts` — reescrever specs para o novo modelo.
- [ ] `demo-habit-card.mapper.ts` — remover dependência de `STREAK_MISS_TOLERANCE`.

### E. Testes obrigatórios (Vitest)

| # | Cenário | Resultado esperado |
|---|---------|-------------------|
| 1 | 5 dias agendados seguidos concluídos | `currentStreak = 5` |
| 2 | 1 falta isolada na semana com freeze disponível | Freeze consumido; `currentStreak` intacta |
| 3 | 2 faltas na mesma semana | 1ª coberta por freeze; 2ª quebra → `currentStreak = 0` após 2ª |
| 4 | Hábito seg/qua/sex; terça e quinta no meio | Não contam como falta |
| 5 | Hábito criado há 3 dias | Streak não retroage antes de `createdAt` |
| 6 | Hoje agendado, ainda não marcado | Streak baseada em ontem; hoje não quebra |
| 7 | 90 dias de histórico + 1 falta que quebra | Completions intactas; `totalCompletions = 90`; `bestStreak` preserva recorde anterior |
| 8 | Padrão alternado (feito/falta/feito/falta) por 4 semanas | Streak quebra na 2ª falta de cada semana, não permanece infinita |
| 9 | Virada de semana | Freeze creditado até o cap; não ultrapassa 1 (free) |
| 10 | `npm test` completo | Verde |

---

## Escopo OUT (outras tarefas / H1)

- ❌ Modo férias (ver `docs/07-REGRAS-STREAK-E-FREEZE.md` §4 — futuro).
- ❌ Remoção do `COMPLETION_RESTORE_PATCH` (Tarefa 2).
- ❌ UI completa de detalhe do hábito com inventário de freeze (H1 — `/habits/:id`).
- ❌ Ícone de escudo no heatmap (H1 — quando heatmap individual existir; agregado pode vir depois).
- ❌ Billing / cap 2 no premium (monetização futura).
- ❌ `HabitMetricsService` dedicado (pode ser utils puras nesta tarefa; extrair serviço na Fase 2).

---

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/core/services/habit-storage.service.ts` | Remover effect destrutivo |
| `src/app/core/utils/habit-streak.utils.ts` | Reescrever cálculo |
| `src/app/core/utils/habit-streak.utils.spec.ts` | Novos casos |
| `src/app/core/models/app-storage.model.ts` | Campo `freezeUsed` (se persistir) |
| `src/app/core/utils/today-habit.mapper.ts` | Novas métricas no card |
| `src/app/features/today/components/habit-card/habit-card.component.ts` | Remover ameaça; copy gentil |
| `src/app/core/utils/demo-habit-card.mapper.ts` | Ajustar demo |

---

## Critérios de aceite (Definition of Done)

1. **Zero** deleção de completions por streak em todo o codebase (`rg` por `filter.*habitId` em reconcile / delete completions em effect).
2. Streak atual, recorde e total calculados por funções puras testadas.
3. Regra de quebra: 1ª falta/semana coberta por freeze automático; 2ª falta na semana quebra.
4. Freeze: +1/semana, teto 1, consumo automático, evento persistido.
5. Card "Hoje" sem contagem regressiva de faltas.
6. Todos os testes da tabela §E passando; `npm test` verde.
7. Comportamento validado manualmente: simular 7+ dias de ausência → heatmap e completions **intactos**, sequência atual = 0.

---

## Ordem de implementação sugerida

1. Escrever testes novos em `habit-streak.utils.spec.ts` (red).
2. Implementar funções puras de streak + freeze.
3. Remover `reconcileStreakResets` e effect.
4. Wire no mapper + card.
5. Persistência de `freezeUsed` + consumo automático no ponto único.
6. Green + smoke manual.

---

## Dependências

- **Bloqueia:** Tarefas 7 (testes storage), H1 (métricas na UI), alfa com irmãos.
- **Paralelo:** Tarefas 3–4 (testes quebrados, gitignore) podem rodar em paralelo se não tocar os mesmos arquivos.

---

## Referência

Especificação de domínio: [`docs/07-REGRAS-STREAK-E-FREEZE.md`](./07-REGRAS-STREAK-E-FREEZE.md)
