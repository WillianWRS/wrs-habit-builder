---
name: habit-builder-ui
description: >-
  Design tokens, Tailwind classes, typography, motion, and component patterns for
  WRS Habit Builder dark theme aligned with portfolio. Use when styling components,
  building cards, progress bars, heatmaps, forms, or empty states.
---

# Habit Builder — UI

Visual alinhado ao portfólio (`portfolio-dev-fullstack`): dark, emerald para sucesso, tipografia display nos títulos.

## Design tokens

| Token | Valor | Uso |
|-------|-------|-----|
| Fundo app | `bg-zinc-950` | `body`, layout shell |
| Card | `bg-zinc-900` + `border-zinc-800` | cards de hábito, modais |
| Texto primário | `text-zinc-50` | títulos, nomes |
| Texto muted | `text-zinc-400` | mínimo, horário, labels |
| Primário / sucesso | `emerald-500` | botões, check, progresso |
| Sucesso muted | `emerald-500/20` | fundo de card concluído |
| Perigo | `red-500` | arquivar (outline, não agressivo) |
| Raio | `rounded-xl` cards · `rounded-lg` botões | consistente |
| Espaçamento page | `px-4 py-6` mobile · `max-w-lg mx-auto` | container |

### Tipografia

| Uso | Fonte | Classe sugerida |
|-----|-------|-----------------|
| Títulos de tela | Fraunces (display) | `font-display text-2xl font-semibold` |
| UI / corpo | Plus Jakarta Sans | `font-sans text-sm` / `text-base` |

Carregar via Google Fonts em `index.html` ou `@import` em `styles.scss`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
```

```scss
@theme {
  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-display: 'Fraunces', Georgia, serif;
}
```

(Adaptar conforme setup Tailwind v3/v4 do projeto.)

## Tailwind

Instalar e configurar se ainda não existir:

```bash
npm install -D tailwindcss @tailwindcss/postcss postcss
```

Conteúdo em `styles.scss`:

```scss
@import 'tailwindcss';
```

## Componentes — padrões

### Card de hábito (Hoje)

```html
<article
  class="rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors"
  [class.border-emerald-500/30]="completed()"
  [class.bg-emerald-500/10]="completed()"
>
  <!-- status dot + nome + meta -->
  <!-- minimumAction em text-zinc-400 text-sm -->
  <!-- botão Marcar: bg-emerald-500 text-zinc-950 font-medium -->
</article>
```

### Barra de progresso do dia

```html
<div class="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
  <div
    class="h-full rounded-full bg-emerald-500 transition-all duration-300"
    [style.width.%]="progressPercent()"
  ></div>
</div>
<p class="text-sm text-zinc-400">{{ done }}/{{ total }} hábitos</p>
```

### Bottom navigation

```html
<nav class="fixed bottom-0 inset-x-0 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur pb-safe">
  <!-- tabs: text-zinc-400, active text-emerald-500 -->
  <!-- FAB + centralizado ou tab dedicada -->
</nav>
```

Reservar `pb-20` no conteúdo para não sobrepor a nav.

### Botões

| Variante | Classes |
|----------|---------|
| Primário | `bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-4 py-2.5 rounded-lg` |
| Secundário | `border border-zinc-700 text-zinc-300 hover:bg-zinc-800` |
| Ghost / link | `text-emerald-500 hover:text-emerald-400` |
| Destrutivo | `border border-red-500/50 text-red-400 hover:bg-red-500/10` |

### Formulário

- Inputs: `bg-zinc-900 border-zinc-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg w-full px-3 py-2`
- Labels: `text-sm font-medium text-zinc-300`
- Erro: `text-red-400 text-xs mt-1`
- Contador 140 chars: `text-zinc-500 text-xs text-right`

### Seletor de dias (S–D)

Pills toggle:

```html
<button
  type="button"
  class="size-9 rounded-full text-sm font-medium border"
  [class.border-emerald-500]="selected()"
  [class.bg-emerald-500]="selected()"
  [class.text-zinc-950]="selected()"
  [class.border-zinc-700]="!selected()"
  [class.text-zinc-400]="!selected()"
>
  {{ label }}
</button>
```

Labels PT: D S T Q Q S S (domingo primeiro, weekday 0).

### Heatmap (Detalhe)

Grid CSS simples — **sem biblioteca pesada**:

```html
<div class="grid grid-cols-[repeat(22,minmax(0,1fr))] gap-1">
  @for (cell of cells(); track cell.date) {
    <span
      class="aspect-square rounded-sm"
      [class.bg-emerald-500]="cell.status === 'done'"
      [class.bg-zinc-800]="cell.status === 'missed'"
      [class.bg-zinc-900]="cell.status === 'skipped'"
      [attr.title]="cell.date"
    ></span>
  }
</div>
```

Legenda abaixo em `text-xs text-zinc-500`.

### Empty state

- Ícone ou emoji discreto (`text-4xl mb-4 opacity-60`)
- Título `font-display text-xl text-zinc-50`
- Subtexto `text-zinc-400 max-w-xs text-center`
- CTA primário abaixo

## Motion

| Interação | Animação |
|-----------|----------|
| Marcar hábito | scale `0.95 → 1`, 200ms ease-out no check |
| Progress bar | `transition-all duration-300` |
| Card concluído | border/background fade 200ms |

**Acessibilidade:** respeitar `prefers-reduced-motion`:

```scss
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Tom visual (não usar)

- ❌ Vermelho forte em "dia perdido" no heatmap (use zinc neutro)
- ❌ Copy culpabilizante estilizada como erro
- ❌ Gamificação exagerada (confetes, slot machine)
- ❌ Light mode no MVP (dark only)

## Acessibilidade (RNF-02)

- Botão "Marcar" com `aria-label="Marcar {nome} como feito"`
- Progresso: `role="progressbar"` + `aria-valuenow`
- Contraste: emerald on zinc-950 ≥ 4.5:1 para texto importante
- Focus visible: `focus-visible:ring-2 focus-visible:ring-emerald-500`

## Checklist visual por tela

- [ ] Fundo `zinc-950`, cards `zinc-900`
- [ ] Conclusão = emerald, não blue
- [ ] Fontes display + sans carregadas
- [ ] Mobile 360px sem overflow horizontal
- [ ] Bottom nav não cobre conteúdo
- [ ] `prefers-reduced-motion` respeitado

## Skills relacionadas

- Estrutura de telas: `habit-builder-screens`
- Domínio: `habit-builder-product`
