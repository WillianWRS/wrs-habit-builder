---
name: habit-builder-screens
description: >-
  Screen specs, wireframes, routes, and acceptance criteria for WRS Habit Builder
  (Today, Habits list, Create/Edit, Detail). Use when creating or modifying pages,
  components, routing, empty states, or modals.
---

# Habit Builder — Telas

## Mapa (4 telas + modais)

| # | Tela | Rota | Prioridade |
|---|------|------|------------|
| 1 | **Hoje** | `/` | P0 — núcleo |
| 2 | Lista de hábitos | `/habits` | P1 |
| 3 | Criar / Editar | `/habits/new`, `/habits/:id/edit` | P0/P1 |
| 4 | Detalhe | `/habits/:id` | P1 |

**Modais (não são rotas):** confirmar arquivar · tooltip "Por que ação mínima?"

**Não implementar:** tela de Login/Registro (`/auth`).

Navegação inferior (mobile): tabs **Hoje** · **Hábitos** · **+** (criar).

Wireframes ASCII detalhados: [wireframes.md](wireframes.md)

---

## Tela 1 — Hoje (Dashboard) ★

**Objetivo:** marcar hábitos do dia em < 3 segundos.

### Layout

- Header: "Hoje · {dia da semana}, {data}" — sem avatar/menu de conta
- Barra de progresso: `{concluídos}/{total esperados hoje}` (ex.: `4/5 hábitos`)
- Lista de cards (somente hábitos ativos cujo weekday ∈ `scheduleDays`)
- Bottom nav: Hoje (ativo) · Hábitos · +

### Card de hábito

```
┌─────────────────────────────────────────┐
│ ○ Nome do hábito          HH:MM · Cat.  │
│   Mínimo: {minimumAction}               │
│                      [ Marcar ✓ ]       │  ← pendente
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ● Nome …                  ✓ Feito       │  ← concluído
│   Mínimo: …                             │
└─────────────────────────────────────────┘
```

### Comportamento

| Estado | UI |
|--------|-----|
| Pendente | Círculo vazio, botão "Marcar ✓" |
| Concluído | Check verde, label "Feito", animação leve (200ms) |
| Toggle | Marcar/desmarcar = RF-04 / RF-05 |

### Empty state

- Ilustração mínima ou ícone
- Texto: convite com exemplo de intenção ("Se café, então 1 página")
- CTA primário: **Criar primeiro hábito** → `/habits/new`

### Critérios de pronto

- [ ] Só hábitos esperados **hoje** (RN-03)
- [ ] Progresso do dia atualiza ao marcar/desmarcar
- [ ] Responsivo 360px+
- [ ] Empty state quando zero hábitos ativos

---

## Tela 2 — Lista de hábitos

**Objetivo:** visão geral + atalho para detalhe e criação.

### Layout

- Header: "Meus hábitos" + botão **+ Novo**
- Seção **Ativos**: nome, adesão 30d (%), chevron → detalhe
- Seção **Arquivados**: colapsável, itens muted
- Bottom nav: Hoje · Hábitos (ativo) · +

### Linha de hábito

`• {nome}    {adesão}% · 30d    >`

Toque na linha → `/habits/:id`

### Critérios de pronto

- [ ] Arquivados separados e colapsáveis
- [ ] Adesão 30d calculada (RN-04)
- [ ] + Novo → `/habits/new`

---

## Tela 3 — Criar / Editar hábito

**Objetivo:** cadastro guiado por ciência comportamental.

### Campos (ordem)

1. **Nome** (obrigatório)
2. **Categoria** — select: Saúde, Estudo, Corpo, Mindfulness, Outro
3. **Intenção (Se → Então)** — dois inputs ou um `triggerText` composto
4. **Ação mínima** — obrigatório, max 140 chars, contador visível
5. **Repetir** — toggles S T Q Q S S D (dom–sáb)
6. **Horário opcional** — time input `HH:mm`

Link: **"Por que ação mínima?"** → modal (Fogg)

Botão primário: **Salvar hábito** — validar antes de persistir.

### Validação

| Campo | Regra |
|-------|-------|
| name | não vazio, trim |
| minimumAction | não vazio, ≤ 140 chars |
| scheduleDays | ≥ 1 dia selecionado |
| triggerText | não vazio |

Editar: mesma tela, título "Editar hábito", pré-preencher dados.

### Critérios de pronto

- [ ] Create → redirect Hoje ou Lista
- [ ] Edit → PUT lógico via storage service
- [ ] Modal de ajuda funcional
- [ ] Dias da semana persistidos corretamente

---

## Tela 4 — Detalhe do hábito

**Objetivo:** visão de consistência ao longo do tempo.

### Header

- ← voltar
- Nome do hábito
- Link **Editar** → `/habits/:id/edit`

### Métricas

- Adesão 30d: `{n}%`
- Streak: `{n} dias` (quando RF-09 implementado)

### Heatmap

- Grid últimos **30–66 dias** (preferir 66 = fase de formação Lally)
- Legenda: `░` perdido · `█` feito · `·` não esperado (dia fora de schedule)

### Info block

- Gatilho: texto completo
- Frequência: dias humanizados (ex.: "seg–sex")

### Ação destrutiva

- **Arquivar hábito** → modal confirma → `archived: true`, histórico intacto

### Critérios de pronto

- [ ] Heatmap reflete schedule (dias não esperados ≠ perdidos)
- [ ] Adesão 7d e 30d (RF-08)
- [ ] Arquivar com confirmação (RN-05)

---

## Padrão Angular por feature

Cada feature em `src/app/features/{nome}/`:

```
{nome}/
├── {nome}.routes.ts      # lazy route se aplicável
├── pages/
│   └── {nome}-page.component.ts
├── components/           # subcomponentes da tela
└── index.ts              # barrel export opcional
```

- Componentes: **standalone**, `ChangeDetectionStrategy.OnPush`
- Estado: **signals** + serviços injetáveis
- Sem `*ngIf`/`*ngFor` — usar `@if` / `@for`

## Ordem de implementação sugerida

1. Hoje (vertical slice: listar + marcar)
2. Criar hábito (popula Hoje)
3. Detalhe + heatmap
4. Lista + arquivados
5. Editar + modais

## Skills relacionadas

- Domínio e RN: `habit-builder-product`
- Visual: `habit-builder-ui`
- Persistência: `habit-builder-localstorage`
