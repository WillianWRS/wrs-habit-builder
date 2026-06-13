# Etapa — Nav, rotas e formulários (pré-Sprint 3)

> **Status: IMPLEMENTADA** (12/06/2026)  
> Copie o bloco **Prompt de execução** abaixo para um agente de implementação.

---

## Prompt de execução

```
Implemente a etapa **Nav, rotas e formulários** no projeto WRS Habit Builder (Angular 21, standalone, signals, Tailwind 4, IndexedDB).

Leia antes de codar:
- `.cursor/skills/habit-builder-product/SKILL.md`
- `.cursor/skills/habit-builder-screens/SKILL.md`
- `.cursor/skills/habit-builder-ui/SKILL.md`
- `docs/etapas/ETAPA-NAV-ROTAS-EXECUCAO.md` (decisões completas)

---

## Objetivo

Reorganizar navegação e rotas do app, remover o modal global de criar/editar hábito em favor de páginas dedicadas, e ajustar CTAs/layout nas telas Hoje e Hábitos — sem implementar métricas avançadas (isso fica para Sprint 3+).

---

## Mapa de rotas (obrigatório)

| Rota | Tela | Notas |
|------|------|-------|
| `/today` | Hoje | Rota principal do dashboard |
| `/habits` | Hábitos | Lista/registro |
| `/habits/new` | Novo hábito | Query `returnUrl` obrigatória na prática |
| `/habits/:id/edit` | Editar hábito | Submit → sempre `/habits` |
| `/progress` | Progresso | Conteúdo atual de `/historico` (renomear feature/rota) |
| `/settings` | Configurações | Tema + conteúdo de `/data` unificados |
| `/habits/:id/progress` | — | **Fora desta etapa** (rota reservada; não implementar UI) |

### Redirects (Angular router)

- `/` → `/today`
- `**` (wildcard) → `/today`
- `/historico` → `/progress`
- `/data` → `/settings`

Atualizar todos os `routerLink`, navegações programáticas e testes que usam paths antigos.

---

## Navegação

### Bottom nav (mobile) e header (desktop): **3 itens apenas**

Ordem visual: **Hábitos** (esquerda) · **Hoje** (centro) · **Menu** (direita)

- Remover botão **+** da navbar (mobile e desktop).
- Remover link direto **Histórico** do header desktop.
- `routerLink` dos tabs: `/habits`, `/today`.

### Botão Menu (substitui ícone de settings na nav)

- Label: **Menu**
- Ícone: `bi-list`
- `aria-label="Menu"`, `aria-haspopup="menu"`, `aria-expanded`
- Abre dropdown (mobile: dropup) com **3 itens**:

| Item | Ícone | Ação |
|------|-------|------|
| Configurações | `bi-gear` | Navegar para `/settings` |
| Progresso | `bi-bar-chart-line` (ou `bi-graph-up`) | Navegar para `/progress` |
| Assinatura | `bi-credit-card` ou ícone Stripe-like | **Placeholder**: toast "Em breve" ou item visualmente disabled; **sem rota** |

Remover do menu dropdown: toggles inline de tema/accent e link "Gerenciar dados" (migrar para `/settings`).

Manter no menu apenas o que for dev-only (ex.: preview demo no double-click do logo) se já existir — não expandir escopo.

---

## Formulário: modal → páginas

### Extrair e reutilizar

- Extrair o form de `habit-form-modal` para componente compartilhado (ex.: `HabitFormComponent`) ou mover lógica para pages — **sem duplicar** validação/preview/snapshot.
- Criar:
  - `features/habit-form/pages/habit-new-page/` → rota `/habits/new`
  - `features/habit-form/pages/habit-edit-page/` → rota `/habits/:id/edit`
- Remover `<app-habit-form-modal />` de `app.html` e deprecar `HabitFormModalService` (ou reduzir a helper de navegação se necessário).

### Comportamento `/habits/new`

- Ler `returnUrl` da query string.
- Valores permitidos: `/today` ou `/habits` (sanitizar — fallback `/today` se inválido).
- **Submit com sucesso**: persistir + toast "Hábito criado" + `router.navigateByUrl(returnUrl)`.
- **Cancelar/voltar** com form limpo: navegar para `returnUrl`.
- Form sujo: reutilizar lógica de "Descartar alterações?" (guard `CanDeactivate` ou equivalente com `habit-form-snapshot.utils`).

### Comportamento `/habits/:id/edit`

- Carregar hábito por `:id`; se não existir → redirect `/habits`.
- **Submit**: `updateHabit` + toast "Alterações salvas" + **`router.navigate(['/habits'])`** (sempre lista, independente de origem).
- Mesmo guard de descarte do create.

### Pontos de entrada (substituir `HabitFormModalService.open*`)

| Origem | Navegação |
|--------|-----------|
| CTA Hoje (header) | `/habits/new?returnUrl=/today` |
| Empty state Hoje | `/habits/new?returnUrl=/today` |
| CTA Hábitos (header) | `/habits/new?returnUrl=/habits` |
| Empty state Hábitos (primeiro hábito) | `/habits/new?returnUrl=/habits` |
| Editar na lista | `/habits/:id/edit` |

---

## CTAs e layout — Hoje (`/today`)

### Quando mostrar botão + no header

- **Sim**: quando há listagem de cards (bloco `@else` com hábitos do dia — inclui modo demo com cards).
- **Não**: empty states (`no-habits`, `rest-day`) — empty mantém CTA próprio existente.
- **Não**: modo demo — ocultar botão + do header (demo banner continua).

### Layout da linha acima da listagem

**Desktop:**
```
[ Ordenar ▾ ]                    [ + Novo hábito ]
```
- Ordenação à **esquerda**.
- Botão primário à **direita**, mesma altura visual da linha do sort.
- Label do sort: **"Ordenar"** (trocar "Ordenado por" em `habit-sort-select` — prop configurável ou texto fixo conforme contexto).

**Mobile:** mesma linha; botão direito **só ícone +** com `aria-label="Novo hábito"`.

Remover `justify-end` isolado do sort — usar `flex justify-between items-center`.

Atualizar `app-nav`: remover input `[hideNewHabit]` se existir só por causa do + na nav.

---

## CTAs e layout — Hábitos (`/habits`)

### Quando mostrar botão + no header

- **Sim**: quando `showEmpty()` é false (há itens na listagem filtrada).
- **Não**: empty state de filtro — se filtro "Ativos" sem hábitos cadastrados, empty precisa de **CTA "Criar hábito"** (hoje só menciona navbar — adicionar botão no empty apontando para `/habits/new?returnUrl=/habits`).
- **Não**: modo demo.

### Layout da linha acima da listagem

**Desktop — grid 2 colunas:**
```
┌─────────────────────────┬──────────────────┐
│ Filtros (pills)         │                  │
│ Ordenar ▾               │   + Novo hábito  │
└─────────────────────────┴──────────────────┘
```
- Esquerda: filtros em cima, sort embaixo (`flex flex-col gap-2`).
- Direita: botão alinhado verticalmente (sugestão: `self-center` ou `items-center` no grid).

**Mobile:** coluna direita com **só ícone +**.

Atualizar copy do empty state default que cita "navbar" → referir botão da própria tela ou CTA do empty.

---

## Tela `/settings`

Nova página unificada:

1. **Aparência** — modo claro/escuro (toggle ou botões como hoje no menu).
2. **Tema de cor** — alternância de accent (como hoje).
3. **Separador** — `<hr>` estilizado (`habit-builder-ui`).
4. **Dados** — conteúdo de `data-management-page` (export/import JSON, instruções) incorporado ou reutilizado via componente.

Título da página: **Configurações**. Nav tab Menu não fica "ativo" como tab principal; `activeTab` pode ser omitido ou tratar rota secundária.

---

## Tela `/progress`

- Renomear/mover feature `historico` → `progress` (ou alias de rota apontando para o mesmo componente renomeado).
- Título UI: **Progresso** (substituir "Histórico" onde aparecer).
- Manter heatmap mensal e modal de dia **como estão** nesta etapa — redesign de métricas agregadas é Sprint 4+.
- `historico-page` → renomear arquivos/componentes se fizer sentido (`progress-page`), ou manter pasta e só mudar rota — preferir consistência de naming.

---

## Fora de escopo desta etapa

- ❌ `/habits/:id/progress` (métricas individuais, botão olho)
- ❌ Utils de adesão / chips de adesão
- ❌ Redesign do conteúdo de Progresso (KPIs agregados, hábito mais feito)
- ❌ Integração Stripe real
- ❌ PWA, form em camadas, templates onboarding
- ❌ Alterar lógica de domínio (streak, freeze, storage)

---

## Definition of Done

1. Todas as rotas e redirects da tabela funcionam; `npm test` + `npm run lint` verdes.
2. Modal global removido; criar/editar só via rotas.
3. Nav com 3 itens; Menu com Configurações, Progresso, Assinatura placeholder.
4. CTAs Hoje/Hábitos conforme layout e regras de visibilidade (incl. demo).
5. Sort label "Ordenar" nas telas com listagem.
6. `/settings` unifica tema + dados; `/data` redirect ok.
7. `/progress` substitui `/historico`; redirect ok.
8. Specs de rotas/app atualizados (`app.spec.ts`, etc.).
9. Smoke manual: criar de Hoje → volta Hoje; criar de Hábitos → volta Hábitos; editar → volta Hábitos; back com form sujo pede confirmação; bookmarks antigos `/historico` e `/data` redirecionam.

---

## Ordem sugerida de implementação

1. Rotas + redirects (`app.routes.ts`, renomear paths internos)
2. Nav + menu dropdown
3. Extrair form + pages new/edit + guards
4. Remover modal global; rewiring edit/create
5. Layout CTAs Hoje + Hábitos + empty states
6. `/settings` (unificar)
7. `/progress` (rename historico)
8. Testes + grep por paths/modal órfãos

---

## Arquivos prováveis

| Área | Arquivos |
|------|----------|
| Rotas | `src/app/app.routes.ts`, `app.routes.server.ts` |
| Nav | `app-nav.component.*`, `settings-menu.component.*` |
| Form | `habit-form-modal/*` → `habit-form/pages/*`, `habit-form-snapshot.utils.ts` |
| Hoje | `today-page.component.ts` |
| Hábitos | `habits-page.component.ts`, `habit-list-card/*` |
| Sort | `habit-sort-select.component.ts` |
| Settings | nova feature `settings/` + mover/compor `data-management-page` |
| Progress | `features/historico/` → rename para `progress/` |
| App root | `app.html`, `app.ts`, `app.spec.ts` |

---

## Convenções

- PT-BR na UI; paths em inglês conforme tabela aprovada.
- Standalone + OnPush + signals; sem `*ngIf`/`*ngFor`.
- Reutilizar `ToastService`, focus trap onde modais permanecem (delete confirm).
- Diff mínimo fora do escopo; não refatorar cards/marquee nesta etapa.
```

---

## Decisões de produto (referência rápida)

| Tópico | Decisão |
|--------|---------|
| Default app | `/today` |
| 404 / rota inválida | redirect `/today` |
| Criar submit | volta `returnUrl` (`/today` ou `/habits`) |
| Editar submit | sempre `/habits` |
| + na nav | removido |
| + in-page | Hoje e Hábitos, só com listagem |
| Demo | sem botão + |
| Assinatura | placeholder no menu |
