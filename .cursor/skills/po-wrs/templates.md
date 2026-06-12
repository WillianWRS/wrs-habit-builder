# Templates de saída — PO WRS

Formatos padronizados para Modo A (status) e Modo B (sprint). Preencher após protocolo de descoberta.

---

## § Status — Relatório de estado do projeto

```markdown
# Status do projeto — Habitua (WRS Habit Builder)

**Data:** {YYYY-MM-DD}
**Sprint concluída:** {N} de 6
**Fase:** {Fundação | Alfa | Beta | Lançamento}
**Próxima sprint:** Sprint {N+1}

---

## Resumo executivo

- {bullet 1 — maior conquista recente}
- {bullet 2 — principal gap}
- {bullet 3 — risco ou bloqueio}
- {bullet 4 — recomendação em uma frase}

---

## Onde estamos na linha do tempo

| Marco | Sprint | Status |
|-------|--------|--------|
| Fundação | 1 | {Concluída / —} |
| Alfa | 2–4 | {Em andamento: sprint X / Pendente} |
| Beta | 5 | {Pendente / …} |
| Lançamento | 6 | {Pendente / …} |

---

## Dimensões

### 1. Código e qualidade (doc 01)

| Item | Status | Evidência |
|------|--------|-----------|
| CI lint/test/build | {…} | `.github/workflows/ci.yml` |
| Testes | {…} | `npm test` — {N} passando |
| Dívidas críticas | {…} | {arquivo ou "nenhuma"} |
| Dívidas médias | {…} | {lista curta} |

**Veredito:** {Concluído | Parcial | Pendente | Bloqueado}

### 2. Produto e RF (habit-builder-product)

| RF/RN | Status | Nota |
|-------|--------|------|
| RF-01 … RF-06 | {…} | |
| RF-07 Detalhe | {…} | rota `/habits/:id` {existe/não} |
| RF-08 Adesão | {…} | |
| RF-09 Streak/freeze | {…} | RN-07/08 |

**Veredito:** {…}

### 3. UI/UX (doc 02)

| Item | Status | Nota |
|------|--------|------|
| Toasts/undo | {…} | |
| Form barreira entrada | {…} | |
| Nav mobile Histórico | {…} | |
| A11y modais | {…} | |

**Veredito:** {…}

### 4. Arquitetura (doc 03)

| Item | Status | Nota |
|------|--------|------|
| Event log imutável (D1) | {…} | |
| Migração versionada (D4) | {…} | v{CURRENT} |
| PWA / Fase 2 | {…} | |
| SSR vs SSG (D2) | {…} | |

**Veredito:** {…}

### 5. Negócio e lançamento (docs 04–06)

| Item | Status | Nota |
|------|--------|------|
| Pronto para monetizar | Não (esperado até pós-launch) | |
| Critérios alfa | {% ou lista} | ver backlog-reference |
| Landing / beta prep | {…} | |

**Veredito:** {…}

---

## Riscos ativos (top 3)

1. **{Risco}** — {mitigação sugerida}
2. **{Risco}** — {mitigação}
3. **{Risco}** — {mitigação}

---

## Próximo passo recomendado

**Sprint {N+1} — {tema em uma frase}**

Prioridade imediata: {1 tarefa}, porque {razão valor/risco}.

---

## Delta desde última avaliação (opcional)

{Commits ou merges relevantes do git log}
```

---

## § Sprint card — Formato Trello

Usar **um arquivo markdown por tarefa** em `docs/SPRINT-{N}-TAREFA-{K}.md` ou entregar blocos separados na resposta.

```markdown
# Sprint {N} — Tarefa {K}: {título curto}

> Card pronto para o Trello. {Referência spec se houver}.

---

## Título (Trello)

**{título acionável para o board}**

---

## Contexto

{Por que agora; o que bloqueia se não fizer; link doc/skill}

---

## Escopo IN

- [ ] {item verificável 1}
- [ ] {item 2}
- [ ] {item 3}

---

## Escopo OUT

- ❌ {explicitamente fora desta tarefa}
- ❌ {…}

---

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `{path}` | {Criar / Editar / Remover} |
| `{path}` | {…} |

---

## Critérios de aceite (Definition of Done)

1. {critério testável}
2. {critério testável}
3. `npm test` verde
4. {validação manual se aplicável}

---

## Testes obrigatórios (se aplicável)

| # | Cenário | Resultado esperado |
|---|---------|-------------------|
| 1 | {…} | {…} |
| 2 | {…} | {…} |

---

## Dependências

- **Bloqueia:** {tarefas ou marcos downstream}
- **Paralelo:** {o que pode rodar junto}
- **Skills:** `{habit-builder-product}` | `{habit-builder-screens}` | …

---

## Ordem de implementação sugerida

1. {passo}
2. {passo}
3. {passo}
```

---

## § Exemplo preenchido — Sprint 2, Tarefa 1

Copiar/adaptar ao gerar cards reais.

```markdown
# Sprint 2 — Tarefa 1: Utils de adesão + regra de exibição progressiva

> Card pronto para o Trello. RN-04, RF-08. Skill: `habit-builder-product`.

---

## Título (Trello)

**Implementar cálculo de adesão (7d/30d) e regra de exibição progressiva**

---

## Contexto

A métrica central do produto é **adesão** (dias concluídos ÷ dias esperados), não streak. Sprint 1 entregou streak/freeze; os dados (`completions`, `scheduleDays`, `scheduleDaySince`, `createdAt`) já existem — falta a camada de cálculo e a regra de UI acordada: **não exibir `30d` no dia 2**; usar janela adaptativa ou contagem até ≥7 dias de história.

Sem esta tarefa, Sprint 3 (detalhe do hábito e chips na lista) fica bloqueada.

---

## Escopo IN

- [ ] Criar `src/app/core/utils/habit-adherence.utils.ts` com funções puras:
  - `getExpectedDaysInPeriod(habit, fromKey, toKey)`
  - `computeAdherence(habit, completions, periodDays, referenceDate)` → `{ percent, completed, expected }`
  - Respeitar `createdAt`, `scheduleDaySince`, `scheduleDays` (mesma semântica de `habit-streak.utils`)
- [ ] Criar `formatAdherenceDisplay(habit, snapshot, referenceDate)` → label adaptativo:
  - Idade < 7 dias agendados: `"2 de 2 dias"` ou `"100% · 2d"` (nunca `30d`)
  - ≥ 7 dias: permitir `7d`
  - ≥ 30 dias de amostra: permitir `30d`
- [ ] Specs Vitest cobrindo: hábito novo, seg/qua/sex, período parcial, zero dias esperados
- [ ] Documentar regra em comentário no util ou entrada curta em `habit-builder-product` (precisa aprovação se alterar skill)
- [ ] Integração mínima no mapper (`today-habit.mapper` / `habit-list`) — **somente campo no view-model**, sem redesign de card (UI completa = Sprint 3)

---

## Escopo OUT

- ❌ Tela `/habits/:id` (Sprint 3)
- ❌ Chips visuais polidos na lista (Sprint 3)
- ❌ Resumo agregado no Histórico (Sprint 3)
- ❌ `HabitMetricsService` dedicado (opcional Fase 2; utils puras bastam aqui)
- ❌ Monetização ou gates premium

---

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/core/utils/habit-adherence.utils.ts` | Criar |
| `src/app/core/utils/habit-adherence.utils.spec.ts` | Criar |
| `src/app/core/utils/today-habit.mapper.ts` | Editar (campo adherence no card model) |
| `src/app/core/models/today-habit-card.model.ts` | Editar (tipo opcional) |

---

## Critérios de aceite (Definition of Done)

1. Adesão = concluídos ÷ esperados no período; arredondamento inteiro 0–100
2. Período não retroage antes de `createdAt` nem conta dias fora de `scheduleDays`
3. `formatAdherenceDisplay` nunca retorna `30d` para hábito com < 30 dias de amostra útil (regra acordada PO)
4. Specs cobrem ≥ 6 cenários incluindo hábito de 2 dias e seg/qua/sex
5. `npm test` verde; nenhuma regressão em streak specs
6. View-model expõe adherence label; card Hoje **pode** omitir exibição nos primeiros dias (flag ou label vazio)

---

## Testes obrigatórios

| # | Cenário | Resultado esperado |
|---|---------|-------------------|
| 1 | Hábito diário, 5/5 concluídos em 7d | `percent = 100` |
| 2 | seg/qua/sex, ter/qui no meio | Não entram em esperados |
| 3 | Hábito criado há 2 dias, 2/2 | `expected = 2`, display sem `30d` |
| 4 | 0 dias esperados no período | `percent = 0`, sem divisão por zero |
| 5 | 10 concluídos / 12 esperados em 30d | `percent = 83` (round) |
| 6 | `npm test` completo | Verde |

---

## Dependências

- **Bloqueia:** Sprint 3 (detalhe, chips lista, histórico)
- **Paralelo:** Sprint 2 Tarefa 3 (toasts) — arquivos diferentes
- **Skills:** `habit-builder-product` (RN-04), `habit-builder-localstorage` (se touch storage)

---

## Ordem de implementação sugerida

1. Escrever specs em `habit-adherence.utils.spec.ts` (red)
2. Implementar funções puras de adesão
3. Implementar `formatAdherenceDisplay`
4. Wire no mapper + tipo do card
5. Green + smoke manual com hábito de 2 dias
```

---

## § Exemplo resumido — Sprint 2 backlog (lista para o usuário)

Quando o usuário pedir "liste a sprint 2" sem cards completos, usar formato compacto:

```markdown
# Sprint 2 — Métricas + feedback UX

**Marco:** Alfa (1/3)
**Tema:** Desbloquear RF-08 e confiança na UX

| # | Tarefa | P | Esforço |
|---|--------|---|---------|
| 1 | Utils adesão + exibição progressiva | P0 | M |
| 2 | Toast service + undo arquivar | P0 | M |
| 3 | Limpezas item 8 Sprint 1 | P1 | S |
| 4 | formPreviewVersion → toSignal | P2 | S |

**Fora de escopo:** detalhe `/habits/:id`, PWA, templates, monetização.

**Entregável alfa após S2+S3+S4:** ver Definition of Alpha em backlog-reference.md.
```
