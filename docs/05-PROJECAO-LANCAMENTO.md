# Projeção de Lançamento e Potencial — WRS Habit Builder

> Versão em documento do canvas de projeção. Cenário: tudo dos relatórios 01–04 implementado, lançamento somente **web + Android**, modelo **free limitado + Premium** (estilo Strava). Premissa de execução: dev solo. Fontes: benchmarks RevenueCat e Adapty 2026 (Health & Fitness) e comparáveis da categoria (Habitify, Streaks, Fabulous, Loop, Strava). Data: junho/2026.

---

## Indicadores-chave

| Indicador | Valor |
|-----------|-------|
| Prazo full-time (40h/sem) | **~5 meses** |
| Preço herói do Premium | **R$ 79,90/ano** |
| Chance de "dar certo" (cenário base ou melhor) | **~30%** |
| Teto máximo plausível (mês 36) | **R$ 160 mil MRR** |

---

## 1. Prazo para concluir tudo e lançar (web + Android)

Esforço estimado por bloco de trabalho, em semanas de dedicação integral (1 dev, 40h/semana), com base no escopo dos relatórios 01–04:

| Bloco | Conteúdo | Semanas |
|-------|----------|--------:|
| Fase 0 — Estancar riscos | Reset destrutivo fora, patch fora, specs verdes, `.gitignore` | 0,5 |
| Fase 1 — Fundação | CI, ESLint, testes do storage, modelo v2, refactor de componentes gigantes | 2,5 |
| Fase 2 — Plataforma | PWA, IndexedDB, camada de métricas, toasts | 3 |
| H1 — Core do produto | Detalhe do hábito, adesão visível, streak gentil, undo, templates | 3 |
| H2 — Retenção | Notificações locais, resumo semanal, notas, metas quantitativas | 4 |
| Monetização | Gates free/premium, paywall, billing (Play + Stripe), analytics | 3 |
| Android | Capacitor, assets de loja, política de privacidade, review, beta fechado | 2 |
| Beta aberto + polimento | Correções, ajustes de onboarding e conversão | 2 |
| **Total** | | **20 semanas ≈ 5 meses** |

| Regime | Prazo até o lançamento |
|--------|------------------------|
| Full-time (40h/sem) | **~5 meses** |
| Meio período (~15h/sem) | **10–14 meses** |
| H3 pós-lançamento (sync, insights, compartilhamento, i18n) | **+8–10 semanas** |

**Leitura do prazo:** o lançamento sai *antes* do "tudo". Pela sequência do relatório 04, o Premium estreia **sem sync** (ilimitados + insights + personalização) e o sync (H3) entra ~2 meses depois, já financiado por receita real. "Impecável e completo" (incluindo H3): **~7–8 meses full-time** ou ~16–20 meses em meio período.

---

## 2. Preço ideal do Premium

Calibrado para web + Android no Brasil (poder de compra menor que iOS/EUA), abaixo da mediana da categoria (US$ 39,99/ano) para posicionamento desafiante. Plano anual como herói: 60% da receita de Health & Fitness vem de anuais, e o assinante anual sobrevive ao churn mensal de ~11% da categoria.

| Plano | Brasil | Internacional (web) | Papel |
|-------|--------|---------------------|-------|
| **Anual (herói)** | R$ 79,90/ano (R$ 6,65/mês) | US$ 29,99/ano | Plano destacado no paywall, exibido como valor mensal |
| Oferta fundador | R$ 59,90/ano (1º ano, primeiros 500) | US$ 22,99/ano | Urgência honesta no lançamento + early adopters fiéis |
| Mensal | R$ 12,90/mês | US$ 3,99/mês | Âncora de preço que torna o anual óbvio |
| Lifetime | R$ 249 | US$ 79,99 | Captura o público anti-assinatura; caixa antecipado |

- **Trial de 14 dias sem cartão** no onboarding (trials de 2–4 semanas em H&F convertem até ~35% trial→pago).
- Ao expirar o trial, o usuário **cai para o free sem perder nada** — coerente com a tese "falha sem culpa".
- Na web, assinatura direta via **Stripe** (sem comissão de loja) com o mesmo preço: margem ~12 p.p. maior por assinante.

---

## 3. Probabilidade de dar certo

Mesmo com execução perfeita, o risco dominante é **distribuição**: 51% dos apps de assinatura faturam menos de US$ 1.000 no total e a mediana é ~US$ 492/mês (Adapty 2026). As estimativas abaixo já assumem produto impecável e roadmap completo:

| Patamar | Probabilidade estimada |
|---------|----------------------:|
| Produto vivo com receita (≥ cenário pessimista) | **65%** |
| "Dar certo" — negócio sustentável (≥ cenário base) | **30%** |
| Renda relevante (≥ cenário otimista) | **10%** |
| Topo da categoria (cenário máximo) | **2%** |

**O que move o ponteiro:** os ~30% viram **~45–50%** com duas alavancas que não são código:

1. **Experimentação contínua de paywall/preço** — apps que rodam experimentos faturam 40× mais que os que não rodam.
2. **Canal orgânico ativo** — ASO sério, conteúdo sobre hábitos em PT-BR, card de conquista compartilhável.

Execução de produto perfeita sem distribuição é a causa nº 1 de fracasso nesta categoria.

---

## 4. Potencial — pessimista, base, otimista e máximo

Receita recorrente mensal líquida projetada (R$, após comissão de loja), do mês 6 (lançamento) ao mês 36. Premium liga no mês ~8.

| Mês | Pessimista | Base | Otimista | Máximo |
|-----|-----------:|-----:|---------:|-------:|
| M6 | 0 | 0 | 0 | 0 |
| M9 | 150 | 400 | 800 | 1.500 |
| M12 | 400 | 1.200 | 3.000 | 6.000 |
| M18 | 900 | 3.500 | 9.000 | 25.000 |
| M24 | 1.500 | 7.000 | 18.000 | 60.000 |
| M30 | 1.900 | 10.500 | 27.000 | 110.000 |
| M36 | **2.200** | **14.000** | **35.000** | **160.000** |

### Premissas e foto do mês 36

| Cenário | MAU (M36) | Conversão free→pago | Assinantes | MRR líquido | Receita anualizada |
|---------|----------:|--------------------:|-----------:|------------:|-------------------:|
| Pessimista | 25 mil | 1,2% | ~300 | R$ 2,2 mil | ~R$ 26 mil/ano |
| Base | 75 mil | 2,5% | ~1.870 | R$ 14 mil | ~R$ 168 mil/ano |
| Otimista | 120 mil | 4,0% | ~4.670 | R$ 35 mil | ~R$ 420 mil/ano |
| Máximo | 430 mil | 5,0% | ~21.300 | R$ 160 mil | ~R$ 1,9 mi/ano |

- **ARPU líquido assumido:** ~R$ 7,50/assinante/mês (mix 60% anual / 30% mensal / 10% lifetime, comissão de 15% via small business program; parte das vendas web via Stripe melhora esse número).
- **Referências de conversão:** mediana freemium da categoria 2,1%; top quartil >4,5%.

| Resumo | Valor |
|--------|-------|
| Pessimista | R$ 2,2 mil/mês — paga os custos e pouco mais |
| Base → Otimista | R$ 14–35 mil/mês — renda real de indie |
| Máximo | R$ 160 mil/mês — top 1% da categoria |

**O que exige o cenário máximo:** top 1% não acontece só com produto perfeito — exige i18n + lançamento iOS (maior ARPU da categoria), loop viral funcionando (card de conquista), 2+ anos de experimentos de paywall e provavelmente um canal de conteúdo/comunidade próprio. Referência: Fabulous fatura ~US$ 80 mil/mês com 50 mil downloads/mês via funil de onboarding extremamente otimizado — **o teto existe, mas é funil, não feature**.

---

## Síntese

- **Prazo:** ~5 meses full-time (10–14 em meio período) até lançar web + Android impecável com Premium; +2 meses para o pacote completo com sync.
- **Preço:** anual R$ 79,90 como herói, mensal R$ 12,90 de âncora, lifetime R$ 249, trial de 14 dias.
- **Probabilidade de virar negócio sustentável:** ~30%, subindo para ~45–50% com experimentação e distribuição levadas tão a sério quanto o código.
- **Potencial no mês 36:** R$ 2,2 mil (pessimista) · R$ 14 mil (base) · R$ 35 mil (otimista) · R$ 160 mil/mês (máximo, top 1% com iOS + i18n).

> Valores líquidos de comissão de loja. Projeções ilustrativas baseadas em benchmarks públicos da categoria — não são garantia de resultado.
