# Sprint 3 — Formulário em páginas dedicadas (criar / editar)

> Projeto: **WRS Habit Builder** (nome oficial a definir — pendência pré-alfa)  
> Marco: **Alfa (2/3)** · Sprint anterior: **Sprint 2 (concluída)** · Pré-trabalho: **Etapa Nav/Rotas/Form (concluída 12/06/2026)**  
> Capacidade: ~1 semana dev solo  
> Objetivo: substituir o modal global de criar/editar hábito por **páginas dedicadas** (`/habits/new` e `/habits/:id/edit`), com **ações pós-submit explícitas** e guard de descarte — entregando RF-02 (criar) e RF-03 (editar) no fluxo de rotas do alfa.  
> **Status: CONCLUÍDA** (12/06/2026) · 93 testes verdes · lint ok

---

## Resumo executivo

| Decisão | Valor |
|---------|-------|
| Modal global | **Removido** — form só via rotas |
| Criar — submit | Toast `"Hábito criado"` → navega para `returnUrl` |
| Criar — `returnUrl` | Query obrigatória na prática; valores permitidos: `/today` ou `/habits` (fallback `/today`) |
| Editar — submit | Toast `"Alterações salvas"` → **sempre** `/habits` (independente da origem) |
| Editar — id inválido | Redirect silencioso para `/habits` |
| Form sujo ao sair | Diálogo "Descartar alterações?" via `CanDeactivate` + snapshot |
| Cancelar / voltar limpo | Mesmo destino do submit respectivo (create → `returnUrl`; edit → `/habits`) |

**Referências:** RF-02, RF-03 · Tela 3 (`habit-builder-screens`) · `docs/etapas/ETAPA-NAV-ROTAS-EXECUCAO.md` · `habit-builder-product` · `habit-builder-ui`

---

## Visão geral

| # | ID | Tarefa | Prioridade | Esforço | Status |
|---|-----|--------|------------|---------|--------|
| 1 | S3-01 | Extrair `HabitFormComponent` e remover modal global | P0 | L | ✅ |
| 2 | S3-02 | Rotas lazy `/habits/new` e `/habits/:id/edit` | P0 | S | ✅ |
| 3 | S3-03 | Página criar + `returnUrl` + navegação pós-submit | P0 | M | ✅ |
| 4 | S3-04 | Página editar + resolução de id + navegação pós-submit | P0 | M | ✅ |
| 5 | S3-05 | Snapshot de dirty state + guard `CanDeactivate` | P0 | M | ✅ |
| 6 | S3-06 | Rewiring dos pontos de entrada (Hoje, Hábitos, lista) | P0 | M | ✅ |
| 7 | S3-07 | Shell UX das páginas de form (voltar, nav tab, layout) | P1 | S | ✅ |
| 8 | S3-08 | Testes unitários + smoke de rotas e fluxos | P0 | M | ✅ |

**Ordem sugerida:** 1 → 2 → 5 → 3 → 4 → 6 → 7 → 8. A Tarefa 1 desbloqueia 3–4; a Tarefa 5 deve existir antes de considerar 3–4 prontas; a 6 depende de 2–4.

**Fora de escopo:** tela de métricas `/habits/:id` ou `/habits/:id/progress`, chips de adesão, heatmap individual, PWA, form em camadas (campos colapsados), templates de onboarding, integração Stripe, alteração de regras de domínio (streak, freeze, storage).

---

## Definition of Done da Sprint 3

| Critério | Tarefa |
|----------|--------|
| `HabitFormComponent` standalone reutilizado por new e edit; sem `habit-form-modal` no app | S3-01 |
| `<app-habit-form-modal />` e `HabitFormModalService` removidos ou deprecados | S3-01 |
| Rotas lazy registradas com `canDeactivate` nas duas páginas | S3-02 |
| Criar: submit navega para `returnUrl` sanitizado; toast de sucesso | S3-03 |
| Editar: submit sempre vai para `/habits`; toast de sucesso | S3-04 |
| Id inexistente em edit redireciona para `/habits` sem quebrar o app | S3-04 |
| Form sujo: voltar, cancelar e navegação do browser pedem confirmação | S3-05 |
| Todos os CTAs de criar passam `returnUrl` correto | S3-06 |
| Editar na lista navega para `/habits/:id/edit` | S3-06 |
| Páginas com botão Voltar, título contextual e nav tab coerente | S3-07 |
| Specs de snapshot + smoke de rotas; `npm test` + `npm run lint` + CI verdes | S3-08 |

---

# Tarefa 1 — Extrair form compartilhado e remover modal

## Título (Trello)

**Extrair HabitFormComponent do modal e eliminar formulário global em overlay**

## Contexto

Até a Sprint 2, criar e editar hábito passavam por um modal global (`habit-form-modal` + `HabitFormModalService`). Isso conflita com o mapa de rotas do produto (Tela 3) e dificulta deep links, histórico do browser e guard de saída.

Esta tarefa move toda a lógica de validação, preview, persistência e toasts para um componente **reutilizável** que as páginas new/edit hospedam — sem duplicar regras de negócio.

## Escopo IN

- [ ] Criar `src/app/shared/components/habit-form/habit-form.component.ts` (ou consolidar se já extraído) com:
  - Inputs: `habitId: string | null` (`null` = modo criar)
  - Outputs: `saved`, `cancelled`
  - Validação existente (nome, ação mínima, dias, gatilho, etc.)
  - Toasts: `"Hábito criado"` / `"Alterações salvas"` no submit
  - Métodos públicos: `confirmLeave()`, `requestCancel()` para integração com pages e guard
- [ ] Mover template/estilos do modal para o componente compartilhado
- [ ] Remover `<app-habit-form-modal />` de `app.html`
- [ ] Remover ou esvaziar `HabitFormModalService` e referências `openNew` / `openEdit`
- [ ] Manter modal de ajuda "Por que ação mínima?" **dentro** do form (não é rota)
- [ ] Grep no repo: zero imports órfãos de `habit-form-modal`

## Escopo OUT

- ❌ Páginas de rota (Tarefas 3–4)
- ❌ Guard `CanDeactivate` (Tarefa 5)
- ❌ Form em camadas / progressive disclosure (Sprint 5+)

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/shared/components/habit-form/habit-form.component.*` | Criar / consolidar |
| `src/app/shared/components/habit-form-modal/` | Remover |
| `src/app/core/services/habit-form-modal.service.ts` | Remover |
| `src/app/app.html` | Editar |

## Critérios de aceite (Definition of Done)

1. Submit create chama `storage.createHabit` + toast + emite `saved`
2. Submit edit chama `storage.updateHabit` + toast + emite `saved`
3. Nenhum overlay global de form no bootstrap do app
4. Preview do card e validação idênticos ao comportamento pré-refactor
5. `npm test` verde; specs do modal migrados ou removidos sem perda de cobertura crítica

## Dependências

- **Bloqueia:** S3-03, S3-04
- **Paralelo:** S3-02 (registro de rotas)
- **Skills:** `habit-builder-screens` (Tela 3), `habit-builder-ui`

---

# Tarefa 2 — Rotas lazy do formulário

## Título (Trello)

**Registrar rotas /habits/new e /habits/:id/edit com lazy load**

## Contexto

As páginas de form são rotas de primeira classe no mapa do produto. Devem carregar sob demanda e compartilhar o guard de saída.

## Escopo IN

- [ ] Em `app.routes.ts`:
  - `habits/new` → `HabitNewPageComponent` (lazy)
  - `habits/:id/edit` → `HabitEditPageComponent` (lazy)
  - `canDeactivate: [habitFormCanDeactivateGuard]` em ambas
- [ ] Ordem das rotas: `habits/new` **antes** de `habits/:id/edit` para evitar conflito de segmentos
- [ ] Feature folder `src/app/features/habit-form/pages/` com pages standalone + OnPush
- [ ] Interface `HabitFormPageHost` com `confirmLeave()` para tipagem do guard

## Escopo OUT

- ❌ Lógica de `returnUrl` (Tarefa 3)
- ❌ Redirect de id inválido (Tarefa 4)

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/app.routes.ts` | Editar |
| `src/app/features/habit-form/pages/habit-new-page/` | Criar |
| `src/app/features/habit-form/pages/habit-edit-page/` | Criar |
| `src/app/features/habit-form/pages/habit-form-page-host.ts` | Criar |
| `src/app/core/guards/habit-form-can-deactivate.guard.ts` | Criar (shell; lógica na Tarefa 5) |

## Critérios de aceite (Definition of Done)

1. URLs `/habits/new` e `/habits/{uuid}/edit` resolvem sem 404
2. Lazy import não puxa o bundle das páginas no first paint de `/today`
3. Guard registrado nas duas rotas
4. `npm test` + lint verdes

## Dependências

- **Depende de:** S3-01 (componente a hospedar)
- **Bloqueia:** S3-03, S3-04, S3-06
- **Skills:** `habit-builder-product` (rotas)

---

# Tarefa 3 — Página criar + returnUrl + pós-submit

## Título (Trello)

**Implementar /habits/new com returnUrl e redirect pós-submit**

## Contexto

Criar hábito pode ser iniciado de **Hoje** ou da **lista de Hábitos**. O destino após salvar deve respeitar a origem — sem forçar sempre a mesma tela.

### Contrato pós-submit (criar)

| Evento | Comportamento |
|--------|---------------|
| **Submit válido** | `createHabit` → toast `"Hábito criado"` → `router.navigateByUrl(returnUrl)` |
| **Cancelar** (form limpo) | `navigateByUrl(returnUrl)` |
| **Voltar** (botão header) | Delega ao form: se sujo → confirmação; se limpo → `returnUrl` |
| **Form sujo + saída** | Diálogo descarte (Tarefa 5) |

### `returnUrl`

| Origem | URL de entrada | `returnUrl` |
|--------|----------------|-------------|
| CTA Hoje (header / empty) | `/habits/new?returnUrl=/today` | `/today` |
| CTA Hábitos (header / empty) | `/habits/new?returnUrl=/habits` | `/habits` |
| Valor ausente ou inválido | `/habits/new` | fallback `/today` |

## Escopo IN

- [ ] `HabitNewPageComponent` lê `returnUrl` via `ActivatedRoute.snapshot` ou signal
- [ ] `sanitizeHabitFormReturnUrl()` em `habit-form-return-url.utils.ts` — whitelist `/today` \| `/habits`
- [ ] `buildHabitNewUrl(returnUrl)` helper para CTAs
- [ ] `onSaved()` → `navigateByUrl(returnUrl)` após emit do form
- [ ] `navTab` da bottom nav: `'today'` se `returnUrl === '/today'`, senão `'habits'`
- [ ] Título da página / form: **"Novo hábito"**

## Escopo OUT

- ❌ Lógica de edit (Tarefa 4)
- ❌ Guard completo (Tarefa 5 — pode integrar em paralelo)

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/features/habit-form/pages/habit-new-page/habit-new-page.component.ts` | Criar |
| `src/app/core/utils/habit-form-return-url.utils.ts` | Criar |
| `src/app/core/utils/habit-form-return-url.utils.spec.ts` | Criar |

## Critérios de aceite (Definition of Done)

1. Criar a partir de Hoje → após salvar, usuário está em `/today` com toast
2. Criar a partir de Hábitos → após salvar, usuário está em `/habits` com toast
3. `?returnUrl=/evil` ou valor arbitrário cai em `/today`
4. Bookmark `/habits/new` sem query funciona (fallback `/today`)
5. Smoke manual mobile 360px

## Dependências

- **Depende de:** S3-01, S3-02
- **Integra com:** S3-05 (guard), S3-06 (CTAs)
- **Skills:** `habit-builder-screens`, `habit-builder-product`

---

# Tarefa 4 — Página editar + id + pós-submit

## Título (Trello)

**Implementar /habits/:id/edit com redirect e submit sempre para lista**

## Contexto

Editar é acionado hoje pela lista de hábitos (e no futuro pelo detalhe). O PO definiu: **após salvar edição, sempre voltar para `/habits`** — simplifica expectativa e evita loops de navegação.

### Contrato pós-submit (editar)

| Evento | Comportamento |
|--------|---------------|
| **Submit válido** | `updateHabit` → toast `"Alterações salvas"` → `router.navigate(['/habits'])` |
| **Cancelar** (form limpo) | `navigate(['/habits'])` |
| **Voltar** (botão header) | Delega ao form: se sujo → confirmação; se limpo → `/habits` |
| **`:id` inexistente** | Redirect imediato para `/habits` (constructor ou resolver) |
| **Form sujo + saída** | Diálogo descarte (Tarefa 5) |

## Escopo IN

- [ ] `HabitEditPageComponent` resolve `id` da rota
- [ ] `HabitStorageService.getHabitById(id)` — se `null`, redirect `/habits`
- [ ] Passar `habitId` para `HabitFormComponent`; form pré-preenche campos
- [ ] `onSaved()` → **sempre** `navigate(['/habits'])` — sem `returnUrl` na edição
- [ ] `navTab`: `'habits'` fixo
- [ ] Título: **"Editar hábito"**

## Escopo OUT

- ❌ Entrada editar a partir do detalhe (Sprint 4 — quando `/habits/:id` existir)
- ❌ `returnUrl` na edição (decisão: não usar)

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/features/habit-form/pages/habit-edit-page/habit-edit-page.component.ts` | Criar |
| `src/app/shared/components/habit-form/habit-form.component.ts` | Editar (modo edit / patch) |

## Critérios de aceite (Definition of Done)

1. `/habits/{id-válido}/edit` mostra dados corretos
2. `/habits/uuid-inexistente/edit` redireciona para `/habits`
3. Submit sempre retorna à lista, mesmo se usuário entrou por bookmark direto
4. Alterações persistem no IndexedDB; lista reflete após voltar
5. `npm test` verde

## Dependências

- **Depende de:** S3-01, S3-02
- **Integra com:** S3-05, S3-06
- **Skills:** `habit-builder-screens`, `habit-builder-localstorage`

---

# Tarefa 5 — Snapshot dirty + guard CanDeactivate

## Título (Trello)

**Confirmar descarte ao sair do form com alterações não salvas**

## Contexto

A Sprint 2 entregou confirmação de descarte **no modal**. Com páginas dedicadas, o mesmo comportamento deve cobrir: botão Voltar, evento `cancelled`, navegação da bottom nav, botão do browser e `CanDeactivate`.

## Escopo IN

- [ ] `habit-form-snapshot.utils.ts`:
  - `captureHabitFormSnapshot(scheduleDays, formValue)`
  - `isHabitFormSnapshotDirty(baseline, current)`
- [ ] Baseline atualizado após load, reset e submit bem-sucedido
- [ ] `HabitFormComponent.confirmLeave()` → `window.confirm` ou padrão existente de copy PT-BR
- [ ] `HabitFormComponent.requestCancel()` → confirma se dirty; emite `cancelled` se ok
- [ ] `habitFormCanDeactivateGuard` delega para `HabitFormPageHost.confirmLeave()`
- [ ] Specs Vitest: form limpo, alteração em campo, alteração em `scheduleDays`, submit limpa dirty

## Escopo OUT

- ❌ Modal customizado de confirmação (pode ficar `window.confirm` no alfa)
- ❌ Autosave / rascunho persistido

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/shared/components/habit-form/habit-form-snapshot.utils.ts` | Criar |
| `src/app/shared/components/habit-form/habit-form-snapshot.utils.spec.ts` | Criar |
| `src/app/core/guards/habit-form-can-deactivate.guard.ts` | Editar |
| `src/app/shared/components/habit-form/habit-form.component.ts` | Editar |

## Critérios de aceite (Definition of Done)

1. Alterar nome e clicar Voltar → pede confirmação
2. Submit e tentar voltar → não pede confirmação
3. Guard dispara em navegação programática e browser back (smoke)
4. Copy em PT-BR; acessível o suficiente para alfa (`window.confirm`)
5. ≥ 4 cenários em specs; `npm test` verde

## Dependências

- **Depende de:** S3-01
- **Bloqueia:** critério de pronto de S3-03 e S3-04
- **Skills:** `habit-builder-product` (confiança UX)

---

# Tarefa 6 — Rewiring dos pontos de entrada

## Título (Trello)

**Atualizar CTAs de criar e editar para navegação por rota**

## Contexto

Todo `HabitFormModalService.open*` deve virar `Router.navigate` ou `routerLink` com URLs corretas. Sem esta tarefa, as páginas existem mas ficam inacessíveis na prática.

## Escopo IN

### Criar (`/habits/new`)

| Origem | Implementação |
|--------|---------------|
| Header Hoje — botão `+ Novo hábito` | `buildHabitNewUrl('/today')` |
| Empty state Hoje | idem |
| Header Hábitos — botão `+ Novo hábito` | `buildHabitNewUrl('/habits')` |
| Empty state Hábitos (sem hábitos / filtro vazio) | idem + copy sem citar "navbar" |
| Bottom nav | **sem** botão `+` (removido na etapa nav) |

### Editar (`/habits/:id/edit`)

| Origem | Implementação |
|--------|---------------|
| Ação Editar no `habit-list-card` | `router.navigate(['/habits', id, 'edit'])` com `@click.stop` se dentro de área clicável |

### Limpeza

- [ ] Grep: zero `HabitFormModalService`, `openNew`, `openEdit`
- [ ] Atualizar testes que mockavam o modal

## Escopo OUT

- ❌ Editar a partir do detalhe `/habits/:id` (Sprint 4)
- ❌ Deep link de criar sem `returnUrl` (fallback na Tarefa 3 basta)

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/features/today/pages/today-page/today-page.component.ts` | Editar |
| `src/app/features/habits/pages/habits-page/habits-page.component.ts` | Editar |
| `src/app/features/habits/components/habit-list-card/habit-list-card.component.ts` | Editar (se necessário) |

## Critérios de aceite (Definition of Done)

1. Todos os CTAs de criar abrem `/habits/new` com `returnUrl` correto
2. Editar na lista abre página dedicada; não abre modal
3. Modo demo: CTAs de criar ocultos conforme regra existente
4. Smoke: fluxo completo Hoje → criar → Hoje; Hábitos → criar → Hábitos; lista → editar → Hábitos
5. `npm test` verde

## Dependências

- **Depende de:** S3-02, S3-03, S3-04
- **Paralelo:** S3-07
- **Skills:** `habit-builder-screens`, `docs/etapas/ETAPA-NAV-ROTAS-EXECUCAO.md`

---

# Tarefa 7 — Shell UX das páginas de form

## Título (Trello)

**Layout full-page do form: voltar, título, nav e espaçamento**

## Contexto

As páginas de form não são modais — precisam de hierarquia visual clara (voltar, título, conteúdo scrollável, bottom nav visível) alinhada ao design system.

## Escopo IN

- [ ] Botão **Voltar** (← + label) acima do form; delega a `requestCancel()`
- [ ] `app-nav` presente com tab ativa coerente (Tarefa 3/4)
- [ ] Container `max-w-3xl`, padding e `pb-28` para bottom nav mobile
- [ ] Títulos: "Novo hábito" / "Editar hábito" no form ou page header
- [ ] Focus no primeiro campo ao abrir (reutilizar lógica existente)
- [ ] Estados de loading: edit com id válido não pisca form vazio ( `@if (habitId())` )

## Escopo OUT

- ❌ Redesign de campos / form em camadas
- ❌ Breadcrumb

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/features/habit-form/pages/habit-new-page/habit-new-page.component.ts` | Editar template |
| `src/app/features/habit-form/pages/habit-edit-page/habit-edit-page.component.ts` | Editar template |
| `src/app/shared/components/habit-form/habit-form.component.html` | Editar (título contextual) |

## Critérios de aceite (Definition of Done)

1. Layout consistente com `/today` e `/habits` (tokens `habit-builder-ui`)
2. Voltar acessível por teclado; `aria-label` adequado
3. Responsivo 360px+; form scrollável sem cortar bottom nav
4. Smoke visual dark + light theme

## Dependências

- **Depende de:** S3-03, S3-04
- **Paralelo:** S3-06
- **Skills:** `habit-builder-ui`

---

# Tarefa 8 — Testes e validação de rotas

## Título (Trello)

**Specs de returnUrl, snapshot e smoke dos fluxos new/edit**

## Contexto

Mudança de modal → páginas é regressão frequente em navegação. Testes mínimos travam o contrato de `returnUrl`, dirty state e rotas.

## Escopo IN

- [ ] `habit-form-return-url.utils.spec.ts` — sanitize + buildUrl
- [ ] `habit-form-snapshot.utils.spec.ts` — ≥ 4 cenários (já iniciado na etapa)
- [ ] Atualizar `app.spec.ts` ou criar `app.routes.spec.ts` se existir padrão no repo
- [ ] Remover specs do modal obsoleto
- [ ] Checklist smoke manual documentado na DoD (abaixo)

### Checklist smoke manual

- [ ] Criar de Hoje → salvar → `/today` + toast
- [ ] Criar de Hábitos → salvar → `/habits` + toast
- [ ] Editar → salvar → `/habits` + toast
- [ ] Editar id inválido → `/habits`
- [ ] Form sujo + Voltar → confirmação
- [ ] Form sujo + browser back → confirmação
- [ ] Cancelar limpo → destino correto sem toast de sucesso

## Escopo OUT

- ❌ E2E Playwright/Cypress (se não existir no repo)
- ❌ Testes de integração IndexedDB pesados

## Arquivos prováveis

| Arquivo | Ação |
|---------|------|
| `src/app/core/utils/habit-form-return-url.utils.spec.ts` | Criar |
| `src/app/shared/components/habit-form/habit-form-snapshot.utils.spec.ts` | Manter / expandir |
| `src/app/app.spec.ts` | Editar |

## Critérios de aceite (Definition of Done)

1. Specs novos verdes; contagem total de testes não regride
2. `npm run lint` + CI verdes
3. Checklist smoke manual executado e ok
4. Nenhum import órfão de modal nos testes

## Dependências

- **Depende de:** S3-03 – S3-06
- **Skills:** convenções de teste do repo (Vitest)

---

# Check pós-sprint (validação no código)

> Verificação manual da Sprint 3 em 12/06/2026 (status real no repositório local).

| Tarefa | Status | Evidência no código |
|--------|--------|---------------------|
| S3-01 · Extrair form e remover modal global | ✅ | `app.html` com apenas `<router-outlet />` + `<app-toast />`; `HabitFormComponent` em `shared/components/habit-form`; sem ocorrências de `app-habit-form-modal` e `HabitFormModalService` em `src/app` |
| S3-02 · Rotas lazy de formulário | ✅ | `app.routes.ts` com `habits/new` e `habits/:id/edit`, ambos lazy e com `canDeactivate` |
| S3-03 · Página criar + returnUrl | ✅ | `habit-new-page.component.ts` com `sanitizeHabitFormReturnUrl`, `navigateByUrl(returnUrl)` e `navTab` dinâmico |
| S3-04 · Página editar + redirect padrão | ✅ | `habit-edit-page.component.ts` resolve `id`, redireciona inválido para `/habits`, submit/cancel sempre voltam para `/habits` |
| S3-05 · Snapshot dirty + guard | ✅ | `habit-form-snapshot.utils.ts`, `habit-form-can-deactivate.guard.ts`, `HabitFormComponent.confirmLeave()` e `requestCancel()` |
| S3-06 · Rewiring dos pontos de entrada | ✅ | `today-page.component.ts` e `habits-page.component.ts` usam `buildHabitNewLink`; editar na lista navega via rota |
| S3-07 · Shell UX das páginas new/edit | ✅ | Botão "Voltar", layout full page com `pb-28`, `app-nav` e foco no primeiro campo via `focusPrimaryField()` |
| S3-08 · Testes e smoke de rotas/contratos | ✅ | `app.routes.spec.ts`, `habit-form-return-url.utils.spec.ts`, `habit-form-snapshot.utils.spec.ts` |

## Próxima sprint

Sprint 4 consolidada em: [`docs/sprints/SPRINT-4.md`](./SPRINT-4.md)

---

## Apêndice — Mapa de rotas pós-Sprint 3

| Rota | Tela | Alteração nesta sprint |
|------|------|------------------------|
| `/habits/new` | Novo hábito | **Nova** — substitui modal create |
| `/habits/:id/edit` | Editar hábito | **Nova** — substitui modal edit |
| `/today` | Hoje | CTAs apontam para `/habits/new?returnUrl=/today` |
| `/habits` | Lista | CTAs + edit por rota |
| `/progress` | Progresso | Sem mudança de conteúdo nesta sprint |
| `/settings` | Configurações | Sem mudança de conteúdo nesta sprint |

Rotas `/habits/:id` (detalhe) e `/habits/:id/progress` permanecem **fora** até a Sprint 4.
