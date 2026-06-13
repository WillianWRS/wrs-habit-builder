# Sprint 4 — Detalhe do hábito + adesão visível

> Projeto: **WRS Habit Builder** (nome oficial pendente pré-alfa)  
> Marco: **Alfa (3/3)** · Sprint anterior: **Sprint 3 (concluída)** · Capacidade: ~1 semana dev solo  
> Objetivo: entregar a camada de **métricas por hábito** na UI com rota de detalhe (`/habits/:id`), adesão 7d/30d, heatmap individual e navegação da lista para o detalhe.  
> **Status: CONCLUÍDA (parcial S4-05/06/07)** (13/06/2026) · commit `1935ab1` · ~99 testes verdes

---

## Resumo executivo pós-entrega

- Rota `/habits/:id` funcional com heatmap individual, métricas (adesão, streak, freeze) e fallback para `/habits`.
- Utils de adesão em `habit-adherence.utils.ts` com specs de retroatividade (`scheduleDaySince`).
- Chips de adesão no detalhe e em `/progress` (não em Hoje/Hábitos — decisão de produto).
- **Débitos transferidos para Sprint 5 (S5-06):** card clicável (hoje botão “Visualizar”), rótulos progressivos `7d`/`30d` na UI, specs de componente do detalhe e teste lista→detalhe.

---

## Visão geral

| # | ID | Tarefa | Prioridade | Esforço | Status |
|---|-----|--------|------------|---------|--------|
| 1 | S4-01 | Utils de adesão (7d/30d) e formatação progressiva | P0 | M | ✅ |
| 2 | S4-02 | Rota e página de detalhe `/habits/:id` | P0 | M | ✅ |
| 3 | S4-03 | Heatmap individual 30–66 dias no detalhe | P0 | M | ✅ |
| 4 | S4-04 | Bloco de métricas no detalhe (adesão, streak, total, freeze) | P0 | M | ✅ |
| 5 | S4-05 | Navegação lista → detalhe + link editar no detalhe | P0 | S | ⚠️ |
| 6 | S4-06 | Chips de adesão no detalhe e no progresso agregado | P1 | S | ⚠️ |
| 7 | S4-07 | Testes unitários e smoke dos fluxos de detalhe | P0 | M | ⚠️ |

**Ordem sugerida:** 1 → 2 → 3 → 4 → 5 → 6 → 7.

**Fora de escopo:** PWA, notificações locais, sync multi-dispositivo, templates de onboarding, monetização.

---

## Definition of Done da Sprint 4

| Critério | Tarefa |
|----------|--------|
| Existe rota funcional `/habits/:id` com fallback para `/habits` quando id inválido | S4-02 |
| Heatmap individual diferencia concluído, perdido, não esperado e protegido por freeze | S4-03 |
| Métricas no detalhe exibem adesão 7d/30d, streak atual/recorde e total de conclusões | S4-04 |
| Mudanças de frequência não retroagem na adesão (dia adicionado hoje não vira falta em dias passados) | S4-01 |
| Lista de hábitos permite abrir o detalhe sem conflitar com ações de editar/arquivar | S4-05 |
| Chips de adesão aparecem apenas no detalhe do hábito e no progresso agregado (não em Hoje/Hábitos) | S4-06 |
| Contratos cobertos por specs (utils + rotas + componentes críticos) | S4-07 |
| `npm test` + `npm run lint` verdes | todas |

---

# Tarefa 1 — Utils de adesão (RN-04)

## Título (Trello)

**Implementar cálculo de adesão por hábito (7d/30d) com rótulo progressivo**

## Escopo IN

- [ ] Criar utilitário `computeHabitAdherence` com base em dias esperados (`scheduleDays`) e completions.
- [ ] Suportar janelas de 7 e 30 dias (rolling, incluindo hoje).
- [ ] Respeitar histórico de ativação por dia da semana (`scheduleDaySince`) para evitar retroatividade no cálculo.
- [ ] Regra explícita: se um dia da semana for adicionado hoje (ex.: quarta), quartas anteriores não contam como falta.
- [ ] Tratar bordas: hábito recém-criado, zero dias esperados, janelas curtas.
- [ ] Criar helper de apresentação para evitar rótulo enganoso (ex.: início de hábito não forçar "30d").
- [ ] Cobrir com testes de regra de negócio.

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/core/utils/habit-adherence.utils.ts` | Criar |
| `src/app/core/utils/habit-adherence.utils.spec.ts` | Criar |
| `src/app/core/models/today-habit-card.model.ts` | Editar (campos de adesão, se necessário) |

---

# Tarefa 2 — Página de detalhe do hábito

## Título (Trello)

**Criar rota `/habits/:id` com shell, header e fallback seguro**

## Escopo IN

- [ ] Registrar rota lazy em `app.routes.ts`.
- [ ] Criar `HabitDetailPageComponent` standalone com `OnPush`.
- [ ] Resolver `id` de rota; se inválido/inexistente, redirecionar para `/habits`.
- [ ] Header com voltar para lista e ação de editar (`/habits/:id/edit`).
- [ ] Layout responsivo com `app-nav` em tab `habits`.

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/app.routes.ts` | Editar |
| `src/app/features/habit-detail/pages/habit-detail-page/habit-detail-page.component.ts` | Criar |
| `src/app/features/habit-detail/pages/habit-detail-page/habit-detail-page.component.spec.ts` | Criar |

---

# Tarefa 3 — Heatmap individual idêntico ao Progresso

## Título (Trello)

**Reutilizar o heatmap de Progresso no detalhe, filtrado por hábito**

## Escopo IN

- [ ] Garantir reaproveitamento do **mesmo componente base** usado em `/progress`.
- [ ] Se houver acoplamento ao contexto de progresso, **componentizar/refatorar** no módulo de Progresso primeiro e só então reutilizar no detalhe.
- [ ] Expor inputs personalizáveis no componente (ex.: `habits`, `completions`, `todayKey`, recorte/filtro por `habitId`, modo de interação).
- [ ] Usar o mesmo padrão visual/UX da tela `/progress` (navegação mensal, grid, animação, acessibilidade).
- [ ] Exibir somente os dados do hábito em questão (filtrar completions por `habitId`).
- [ ] Manter legenda e tooltips no mesmo estilo da tela de Progresso.
- [ ] Garantir acessibilidade mínima (texto/contraste/aria).

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/features/progress/components/month-heatmap/month-heatmap.component.ts` | Ajustar/componentizar para inputs reutilizáveis (se necessário) |
| `src/app/features/progress/pages/progress-page/progress-page.component.ts` | Adequar consumo após refactor do componente |
| `src/app/features/habit-detail/pages/habit-detail-page/habit-detail-page.component.ts` | Integrar versão individual (filtro por hábito) |
| `src/app/features/habit-detail/pages/habit-detail-page/habit-detail-page.component.spec.ts` | Cobrir render e filtro por `habitId` |

---

# Tarefa 4 — Métricas no detalhe

## Título (Trello)

**Mostrar adesão, streak e freeze no detalhe do hábito**

## Escopo IN

- [ ] Exibir adesão 7d e 30d (Tarefa 1).
- [ ] Exibir streak atual, recorde e total de conclusões (já derivadas no core).
- [ ] Exibir saldo de freeze da semana (`free`: teto 1).
- [ ] Copy neutra em PT-BR, sem tom de culpa.

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/features/habit-detail/pages/habit-detail-page/habit-detail-page.component.ts` | Editar |
| `src/app/core/utils/today-habit.mapper.ts` | Editar (se centralizar dados de métricas) |

---

# Tarefa 5 — Navegação lista → detalhe

## Título (Trello)

**Permitir abrir detalhe tocando no card de hábito**

## Escopo IN

- [ ] Tornar card/list-item clicável para navegar para `/habits/:id`.
- [ ] Preservar ações de editar/arquivar/restaurar/excluir sem conflito de clique.
- [ ] Manter acessibilidade por teclado (`Enter`/`Space`) no alvo principal.

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/features/habits/components/habit-list-card/habit-list-card.component.ts` | Editar |
| `src/app/features/habits/pages/habits-page/habits-page.component.ts` | Editar |

---

# Tarefa 6 — Chips de adesão em detalhe + progresso

## Título (Trello)

**Adicionar adesão resumida nas telas de detalhe e progresso agregado**

## Escopo IN

- [ ] Exibir chip de adesão no detalhe do hábito (ex.: `78% · 30d`).
- [ ] Exibir resumo/chip de adesão na tela de progresso com visão agregada dos hábitos ativos.
- [ ] Fallback visual quando janela ainda curta (ex.: hábito recente).
- [ ] Garantir consistência com cálculo da Tarefa 1.
- [ ] Não exibir chips de adesão na listagem de `/habits` nem na tela `/today` (decisão de produto para evitar efeito punitivo).

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/features/habit-detail/pages/habit-detail-page/habit-detail-page.component.ts` | Editar |
| `src/app/features/progress/pages/progress-page/progress-page.component.ts` | Editar |
| `src/app/core/utils/habit-adherence.utils.ts` | Reutilizar |

---

# Tarefa 7 — Testes e validação final

## Título (Trello)

**Cobrir fluxo de detalhe e métricas com testes e smoke**

## Escopo IN

- [ ] Specs de utilitários de adesão e heatmap.
- [ ] Spec de rotas garantindo `/habits/:id` e fallback.
- [ ] Testes de interação lista → detalhe.
- [ ] Smoke manual:
  - [ ] Abrir detalhe por card da lista
  - [ ] Editar a partir do detalhe
  - [ ] id inválido redireciona para `/habits`
  - [ ] Heatmap individual renderiza sem quebrar em mobile 360px

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/app.routes.spec.ts` | Editar |
| `src/app/features/habits/pages/habits-page/habits-page.component.spec.ts` | Editar/criar |
| `src/app/features/habit-detail/**` | Criar/editar |

---

## Riscos e mitigação

| Risco | Mitigação |
|------|-----------|
| Métricas inconsistentes entre lista e detalhe | Centralizar cálculo em utils/core reutilizáveis |
| Regressão de clique no card (ações laterais quebradas) | Teste de interação para card principal vs botões de ação |
| Heatmap complexo para MVP | Entregar versão simples e testada (sem biblioteca externa) |

---

## Referências

- `docs/sprints/SPRINT-3.md`
- `docs/07-REGRAS-STREAK-E-FREEZE.md`
- `docs/03-ARQUITETURA-E-ROADMAP.md`
- Skills: `habit-builder-product`, `habit-builder-screens`, `habit-builder-ui`
