# Sprint 5 — Beta fechado + fechamento do Alfa

> Projeto: **WRS Habit Builder**  
> Marco: **Beta (5/6)** · Sprint anterior: **Sprint 4 (concluída parcial)** · Capacidade: ~1–2 semanas dev solo  
> Objetivo: fechar lacunas do Alfa (PWA + onboarding), preparar beta fechado (~20 testers) com landing, privacidade e canal de feedback.  
> **Status: CONCLUÍDA** (13/06/2026) · 98 testes verdes · lint + build ok

---

## Visão geral

| # | ID | Tarefa | Prioridade | Esforço | Status |
|---|-----|--------|------------|---------|--------|
| 0 | S5-00 | Tema claro/escuro (pré-requisito polish) | P0 | S | ✅ |
| 1 | S5-01 | PWA instalável completo | P0 | M | ✅ |
| 2 | S5-02 | Onboarding: form em camadas + 3 templates | P0 | M | ✅ |
| 3 | S5-03 | Landing page mínima + rota pública | P0 | M | ✅ |
| 4 | S5-04 | Política de privacidade (local-first) | P0 | S | ✅ |
| 5 | S5-05 | Kit beta: checklist + formulário feedback | P0 | S | ✅ |
| 6 | S5-06 | Fechar lacunas S4 + polish copy/a11y | P1 | M | ✅ |
| 7 | S5-07 | Decisão modo demo (dev-only) | P1 | S | ✅ |

**Ordem sugerida:** 0 → 1 → 2 → 3 → 4 → 5 → (6 e 7).

**Fora de escopo:** monetização, sync, notificações, Capacitor/loja, layer de foto compartilhável.

---

## Definition of Done da Sprint 5

| Critério | Tarefa |
|----------|--------|
| App instalável (PWA manifest + service worker) | S5-01 |
| Criar hábito rápido (nome + dias; opcionais colapsados) | S5-02 |
| 3 templates no empty state de `/habits` | S5-02 |
| Landing pública `/` com CTA e meta OG | S5-03 |
| Política de privacidade em `/privacy` linkada | S5-04 |
| Checklist beta + link feedback in-app | S5-05 |
| Card lista clicável → detalhe; labels adesão progressivos; specs | S5-06 |
| Demo oculto em produção (`isDevMode`) | S5-07 |
| Tema claro/escuro integrado | S5-00 |
| `npm test` + lint + build verdes | todas |

---

## Entregas principais

### S5-01 — PWA
- `@angular/service-worker` + `ngsw-config.json` + `manifest.webmanifest`
- `provideServiceWorker` em `app.config.ts` (somente produção)

### S5-02 — Onboarding
- Form em camadas: obrigatórios nome + dias; seção "Refinar (opcional)" colapsada
- Templates: Leitura, Caminhada, Meditação (`habit-templates.constants.ts`)
- Query `?template=reading` em `/habits/new`

### S5-03 — Landing
- Rota `/` → `LandingPageComponent` (proposta de valor, CTA `/today`, screenshots)

### S5-04 — Privacidade
- Rota `/privacy` + links em landing, settings, menu

### S5-05 — Kit beta
- `docs/BETA-CHECKLIST.md`
- `BetaFeedbackPanelComponent` em Configurações
- URL do form em `beta-feedback.constants.ts` (atualizar antes dos convites)

### S5-06 — Lacunas S4
- Card da lista clicável (Enter/Space)
- `windowLabel` progressivo em detalhe e progresso
- Specs: `habit-list-card`, `habit-detail-page`, `habit-form-return-url`

### S5-07 — Demo
- `revealPreviewActions` bloqueado fora de `isDevMode()`
- Decisão documentada em `docs/DEMO-MODE.md`

---

## Referências

- `docs/BETA-CHECKLIST.md`
- `docs/DEMO-MODE.md`
- `docs/sprints/SPRINT-4.md`
- Skills: `habit-builder-product`, `habit-builder-screens`, `habit-builder-ui`
