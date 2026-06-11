# Visão de Negócio — WRS Habit Builder

> Relatório de modelo de negócio para o lançamento do Habit Builder como produto (web + Android + iOS), assumindo o cenário hipotético em que as recomendações dos relatórios 01 (código), 02 (UI/UX) e 03 (arquitetura/roadmap) já foram implementadas. Data da análise: junho/2026.

---

## 1. Resumo executivo

**Recomendação: Modelo 4 — Freemium com free generoso e Premium por assinatura (estilo Strava), sem anúncios em nenhum tier.**

| Modelo avaliado | Veredito |
|-----------------|----------|
| 1. Free com anúncios + assinatura para remover | ❌ Contradiz a tese do produto; economicamente fraco nesta categoria |
| 2. 100% gratuito | ❌ Não sustenta os custos que o roadmap cria (sync, lojas, notificações) |
| 3. 1 mês grátis → pago obrigatório (R$ 5 / <US$ 1) | ❌ Pior dos dois mundos: mata o funil orgânico e o preço é baixo demais para sustentar |
| 4. Free limitado + Premium completo (estilo Strava) | ✅ **Recomendado** — padrão vencedor da categoria, alinhado à tese e à arquitetura |

A tese central: o Habit Builder é um produto **local-first, sem culpa e sem fricção** — essas três qualidades são o diferencial competitivo e devem permanecer gratuitas para sempre. O Premium vende o que naturalmente custa dinheiro e agrega valor de longo prazo: **sync multi-dispositivo, insights avançados, ilimitados e personalização**.

---

## 2. O mercado: o que funciona em apps de hábito (2026)

### 2.1 Comparáveis diretos

| App | Modelo | Free tier | Preço pago | Lição |
|-----|--------|-----------|------------|-------|
| **Habitify** | Freemium em camadas | 3 hábitos, 1 lembrete | ~US$ 39,99/ano ou US$ 89,99 lifetime | Em 2026 migrou para 3 tiers (Free / Plus / Pro) — limite de hábitos é o gate que funciona |
| **Streaks** (Apple Design Award) | Compra única | Não tem | US$ 5,99 uma vez | Nicho premium iOS; sem free tier só funciona com marca forte no ecossistema Apple |
| **Fabulous** | Assinatura + trial | Quase nada | ~US$ 40–80/ano | ~US$ 80k/mês com 50k downloads — converte via onboarding emocional de 15 min, não via produto |
| **Loop Habit Tracker** | 100% free (open source) | Tudo | — | Prova que existe concorrente grátis e bom; o free tier de qualquer rival precisa competir com ele |
| **Habitica** | Freemium + cosméticos | Core completo | Assinatura opcional | Gamificação como monetização — distante da tese "calma" do Habit Builder |
| **Strava** (referência do modelo) | Freemium | Tracking core completo | ~R$ 14,90/mês BR (preço regional) | Free registra; Premium **analisa** (métricas, comparativos, rotas) — análise é o produto pago |
| **Duolingo** (referência de mecânica) | Free com ads + Super | Tudo, com anúncios | Assinatura remove ads + perks | Streak freeze como feature de retenção/monetização — já sugerido no relatório 02 |

### 2.2 Benchmarks da categoria (RevenueCat / Adapty 2026)

- **Churn de apps de hábito: ~11,3%/mês** (≈75% ao ano). Principal causa de cancelamento: perda de motivação do usuário (43%), seguida de "alternativas grátis bastam" (25%). Conclusão: o pago precisa justificar-se com **analytics profundos, customização e integrações** — exatamente o que alternativas grátis não têm.
- **Conversão freemium mediana: ~2,1%** download→pago (top quartil >4,5%). Hard paywall converte 5× mais (10,7%), **mas** sacrifica o boca-a-boca e a escala de marca — e em hábitos, onde Loop/EasyHabits são grátis, hard paywall briga contra "grátis e suficiente".
- **Health & Fitness é a categoria onde plano anual domina** (60,6% da receita) e tem o **maior trial-to-paid do mercado: ~35%** com trial de 2–4 semanas. Mediana de preço anual: ~US$ 39,99.
- **LTV por instalação H&F: ~US$ 1,21** (mediana 12 meses) — o melhor de todas as categorias.
- Paywall no onboarding com trial = maior conversão média (1,78% install→paid); >60% das conversões acontecem até o dia 7.

### 2.3 O que esses dados dizem para o Habit Builder

1. A categoria **paga por análise e conveniência**, não por tracking básico (tracking básico grátis é commodity).
2. **Plano anual com trial de 2–4 semanas** é a configuração de maior LTV em Health & Fitness.
3. Churn alto é estrutural: a retenção do *hábito do usuário* é a retenção da *assinatura* — features anti-churn (freeze de sequência, resumo semanal, notificações gentis) são features de negócio, não só de UX.

---

## 3. Avaliação dos 4 modelos propostos

### Modelo 1 — Free com anúncios + assinatura para remover ❌

**Por que não:**

- **Conflito direto com a tese do produto.** A identidade do app é "calma, foco, sem culpa, sem ruído" (dark theme refinado, microinterações, `prefers-reduced-motion`). Banner de anúncio numa tela "Hoje" minimalista destrói o posicionamento — é vender o oposto do que o produto promete.
- **Economia ruim na escala realista.** Anúncios pagam por volume. Com eCPM realista (US$ 0,5–2 no Brasil para display), seriam necessários **centenas de milhares de DAU** para gerar receita relevante. Projeto solo/indie não chega lá antes de morrer.
- Sessões de habit tracker são **curtas por design** (abrir → marcar → fechar, <30s). Pouquíssimas impressões por usuário — o pior perfil possível para ads.
- "Pagar para remover anúncios" cria o incentivo perverso de **piorar o produto grátis** para vender a paz de volta. Estratégia do Duolingo funciona porque sessões são longas (lições) e a escala é de centenas de milhões — nenhum dos dois se aplica aqui.

### Modelo 2 — 100% gratuito ❌

**Por que não:**

- Funciona enquanto o app é 100% localStorage (custo ~zero: Firebase Hosting estático). Mas o roadmap (relatório 03, Horizonte 3) prevê **sync multi-dispositivo** — que exige backend (Firestore), e custo por usuário que cresce para sempre.
- Lojas custam: Apple US$ 99/ano, Google US$ 25 + manutenção contínua de 3 plataformas (web, Android, iOS via Capacitor ou similar).
- Sem receita não há orçamento para aquisição, e em 2026 o crescimento orgânico puro em uma categoria com 8+ players estabelecidos é lento.
- **Cabe como estratégia de portfólio, não de produto.** Se o objetivo fosse apenas vitrine profissional, 100% free seria ótimo. O enunciado é lançar como produto — então precisa de modelo de receita.

### Modelo 3 — 1 mês grátis → pago obrigatório (R$ 5/mês ou <US$ 1) ❌

É um **hard paywall com fusível de 30 dias**. Problemas:

- **O dia 30 é o pior momento possível para cobrar.** As curvas de retenção da categoria dobram nos dias 7 e 30 — no dia 30 a maioria dos usuários já está em "engagement drift". A cobrança chega exatamente quando a motivação está no vale → cancelamento em massa, e o usuário perde acesso aos dados que acumulou (ou o app vira refém disso, o que é hostil).
- **Preço baixo demais para a matemática fechar.** R$ 5/mês − 15–30% de comissão da loja ≈ R$ 3,50–4,25 líquidos. Com churn de 11,3%/mês, o LTV ≈ R$ 31–37 por assinante. Isso é menos do que custa adquirir um usuário pagante via mídia paga em 2026. O modelo só se sustentaria com aquisição 100% orgânica — que o próprio paywall mata, porque **sem free tier permanente não há base instalada gerando boca-a-boca**.
- Preço baixo **não** aumenta proporcionalmente a conversão: dados da Adapty mostram que planos anuais "caros" em H&F geram 4,5× o LTV dos baratos. A barreira é a decisão de pagar, não o valor.
- A vantagem real do hard paywall (10,7% de conversão) pertence a apps com marca/funil fortes (caso Fabulous). Um produto novo sem marca, competindo com Loop grátis, não tem esse poder de fogo.

> Nota: a variante honesta deste modelo é a do **Streaks: compra única de ~US$ 5,99**. É viável como posicionamento de nicho ("pague uma vez, sem assinatura, privacidade total") — mas limita o teto de receita e não financia sync/backend contínuo. Vale considerar como **opção "Lifetime"** dentro do modelo 4, não como modelo principal.

### Modelo 4 — Free limitado + Premium completo (estilo Strava) ✅ RECOMENDADO

**Por que sim:**

- É o **padrão vencedor comprovado da categoria** (Habitify, Productive, Way of Life, HabitNow, Strava, todos freemium).
- **Alinha-se à tese do produto**: o core "sem culpa, sem fricção, sem conta" continua grátis e impecável — o free tier É o marketing. O Premium vende profundidade, não alivia uma dor artificial.
- **Alinha-se à arquitetura**: a decisão D1 do relatório 03 (completions como event log imutável) torna o sync premium "quase trivial" e todas as métricas premium (insights, recordes, tendências) são projeções sobre dados que já existem. O modelo de negócio aproveita o que a engenharia já construiu.
- Free tier permanente alimenta o **funil orgânico** (compartilhamento de conquistas do H3 → aquisição zero-custo), essencial para um produto indie sem budget de mídia.

---

## 4. Desenho do modelo recomendado

### 4.1 Divisão Free × Premium

Princípio: **o que toca a formação do hábito em si é grátis; o que é análise, conveniência, escala e identidade é pago.** Nunca colocar no paywall algo que cause perda de dados ou quebre um hábito em andamento.

| | **Free (para sempre)** | **Premium** |
|---|---|---|
| Hábitos ativos | Até **5** | Ilimitados |
| Marcar/desmarcar, gatilhos, ação mínima, dias da semana | ✅ Completo | ✅ |
| Streak atual + recorde + proteção básica | ✅ | ✅ |
| Heatmap mensal agregado | ✅ | ✅ |
| Adesão 7d/30d por hábito | ✅ (métrica central — nunca pagar por ela) | ✅ |
| Notificações locais (1 lembrete/hábito) | ✅ | Lembretes múltiplos e inteligentes |
| Export/import JSON (dados são do usuário) | ✅ Sempre grátis | ✅ |
| **Sync multi-dispositivo + backup em nuvem** | — | ✅ Âncora do Premium |
| Insights avançados (tendências, melhor dia/horário, correlações, resumo semanal histórico) | — | ✅ |
| Heatmap anual + histórico ilimitado de estatísticas | Estatísticas de 90 dias | ✅ |
| Freezes de sequência (automático) | Teto **1** armazenado | Teto **2** armazenados |
| Modo férias (pausa planejada) | — | Horizonte 2+ (ver `docs/07-REGRAS-STREAK-E-FREEZE.md`) |
| Temas de accent extras, ícones, widgets avançados | Tema padrão + 2 accents | ✅ Todos |
| Notas por conclusão + metas quantitativas (H2 do roadmap) | — | ✅ |
| Card-imagem de conquista para compartilhar | ✅ (com marca d'água discreta — é marketing) | ✅ Sem marca |

Justificativas-chave:

- **5 hábitos no free** (vs 3 do Habitify): generosidade calculada. Pesquisa comportamental sugere focar em poucos hábitos; 5 cobre o usuário sério iniciante e deixa o limite ser sentido só por power users — exatamente quem paga. Ser mais generoso que o líder é a cunha de entrada.
- **Adesão e export grátis para sempre**: são a alma da tese ("consistência > perfeição") e da confiança ("seus dados são seus"). Cobrar por isso seria trair o posicionamento.
- **Sync como âncora**: é a feature com custo marginal real (justifica assinatura recorrente moralmente e financeiramente) e a mais pedida por quem usa em 2+ dispositivos — o segmento de maior engajamento.

### 4.2 Preço

| Mercado | Mensal | **Anual (destaque)** | Lifetime |
|---------|--------|---------------------|----------|
| Brasil | R$ 12,90/mês | **R$ 79,90/ano** (≈ R$ 6,65/mês, "menos que um café por mês") | R$ 249 |
| Internacional | US$ 3,99/mês | **US$ 29,99/ano** | US$ 79,99 |

Racional:

- **Anual como herói**: 60% da receita de H&F vem de planos anuais; assinante anual de habit tracker sobrevive ao churn mensal de 11,3% por construção. Mostrar o preço anual **dividido por mês** (lift de 10–18% no trial start, dado Adapty).
- US$ 29,99/ano fica **abaixo da mediana da categoria** (US$ 39,99) — posicionamento desafiante coerente com um produto novo, e ainda 6× o teto da proposta de "menos de US$ 1/mês", que é insustentável.
- **Preço regionalizado** via App Store/Play Store (o Brasil paga em escala local; o produto nasce PT-BR com i18n no H3 — o preço acompanha).
- **Lifetime** (estilo Habitify/Streaks): captura o público anti-assinatura, gera caixa antecipado para um indie e custa pouco (usuário lifetime de habit tracker raramente usa sync pesado por décadas). Limitar a aparição (ex.: oferta pós-trial) para não canibalizar o anual.
- **Trial de 14 dias do Premium, sem cartão**, oferecido no onboarding (paywall de onboarding com trial = configuração de maior conversão; trials de 2–4 semanas convertem até ~35% em H&F). Importante: ao fim do trial o usuário **cai para o free, nunca perde dados** — coerência com "falha sem culpa".

### 4.3 Momentos de conversão (paywall contextual, nunca bloqueante)

1. **Onboarding**: apresentação do Premium + trial de 14 dias após o primeiro hábito criado (não antes — primeiro valor, depois oferta).
2. **6º hábito**: "Você está construindo um sistema. Premium libera hábitos ilimitados."
3. **Segundo dispositivo / reinstalação**: o momento de dor real → "Sincronize e nunca perca seu histórico."
4. **Marco de streak (30/66 dias)**: oferta celebratória junto ao card de conquista — conversão por orgulho, não por medo.
5. **Tela de insights**: preview borrado/parcial dos gráficos premium (padrão Strava) — o usuário vê *que* a análise existe sobre os dados *dele*.

Anti-padrões proibidos (coerência com a tese): paywall que esconda dados já gravados; countdown de oferta agressivo; perda de funcionalidade que o usuário já usava (grandfathering sempre).

### 4.4 Sequenciamento — quando ligar a monetização

O roadmap técnico (relatório 03) define a ordem; o negócio se encaixa nele:

```
Fase 0–1 (fundação)      → produto 100% free. Não monetizar antes de corrigir
                           o reset destrutivo: cobrar por um app que apaga
                           dados é risco reputacional fatal.
Fase 2 + H1 (PWA, métricas,
detalhe do hábito)        → lançamento "v1.0" nas lojas, ainda free.
                           Construir base + reviews + NPS.
H2 (notificações, notas,
metas quantitativas)      → introduzir Premium SEM sync ainda:
                           ilimitados + insights + personalização.
                           Early adopters com desconto fundador vitalício.
H3 (sync via Firebase)    → Premium completo com a âncora definitiva.
                           Revisar preço para o valor cheio.
```

Vantagem dessa ordem: o sync (maior custo de desenvolvimento e operação) só é construído quando já existe **receita validando** que usuários pagam pelo produto.

### 4.5 Mobile: estratégia de plataforma

- **PWA primeiro** (Fase 2 do roadmap) — instalável, offline-first, notificações; valida mobile com custo ~zero.
- **Lojas via Capacitor** (Android, depois iOS): mesma base Angular, acesso a widgets/health APIs nativas no futuro. iOS é prioridade de receita (usuários iOS de H&F têm ARPU consistentemente maior), Android é prioridade de volume no Brasil.
- Web continua existindo como porta de entrada SEO/orgânica e versão desktop.

---

## 5. Projeção ilustrativa (cenário conservador, mês 12 pós-Premium)

| Premissa | Valor | Base |
|----------|-------|------|
| Base instalada ativa (MAU) | 20.000 | Crescimento orgânico + ASO, sem mídia paga |
| Conversão free→paid acumulada | 2,5% | Mediana freemium 2,1%, ajustada por free generoso + trial no onboarding |
| Assinantes pagos | 500 | |
| Mix anual/mensal/lifetime | 60/30/10 | Padrão H&F |
| Receita média líquida/assinante/mês | ~R$ 7,50 | Após comissão de loja (15% — small business program) |
| **MRR líquido** | **~R$ 3.750** | |

Não é "quit your job money" no ano 1 — é consistente com a realidade da categoria (mediana de apps de assinatura: ~US$ 492/mês; o que separa o topo é experimentação contínua: apps que rodam experimentos faturam 40× mais — dado Adapty 2026). O modelo 4 é o único dos quatro que tem **teto alto** (top quartil freemium >4,5% de conversão dobraria o número) e **piso digno** (free tier mantém o produto vivo e crescendo mesmo com receita baixa).

---

## 6. KPIs de negócio a instrumentar desde o dia 1

| KPI | Meta inicial | Por quê |
|-----|--------------|---------|
| Retenção D7 / D30 | >25% / >12% | As curvas dobram nesses pontos; é o leading indicator de tudo |
| Ativação (1º hábito criado na 1ª sessão) | >60% | Formulário em camadas + templates (relatório 02) atacam isso |
| % usuários com 4+ check-ins/semana | >30% | Usuário que marca é usuário que renova |
| Install → trial | >8% | Benchmark global 11,2%; BR tende menor |
| Trial → paid | >25% | Benchmark H&F: até 35% |
| Churn mensal de assinantes | <9% | Média da categoria é 11,3%; freeze + resumo semanal são as armas |
| % receita do plano anual | >55% | Saúde do mix |

---

## 7. Riscos do modelo e mitigações

| Risco | Mitigação |
|-------|-----------|
| "Alternativa grátis basta" (25% dos cancelamentos da categoria) | Free tier excelente *é* a defesa: quem não pagaria de qualquer forma fica no ecossistema gerando boca-a-boca; o Premium compete em insights, não em tracking |
| Churn por perda de motivação (43% dos cancelamentos) | Features anti-churn como prioridade de produto: freeze, resumo semanal gentil, notificações no horário do gatilho, copy de retomada |
| Conversão freemium baixa demais (<1,5%) | Experimentos contínuos de paywall/preço (RevenueCat/Adapty SDK); reavaliar gates (ex.: 4 hábitos no free) antes de baixar preço |
| Plataforma local-first dificulta medir funil | Analytics privacy-first (ex.: eventos anônimos agregados), transparente na política de privacidade — coerente com o posicionamento |
| Dependência das comissões de loja | Web como canal de assinatura direta (Stripe) com preço levemente menor — legal e cada vez mais comum em 2026 |
| Indie solo: custo de manter 3 plataformas | Base única Angular + Capacitor; nada de codebase nativa duplicada |

---

## 8. Conclusão

| Pergunta do enunciado | Resposta |
|----------------------|----------|
| Free com anúncios + taxa para remover? | Não — destrói o posicionamento "calmo" e a economia de ads exige escala inatingível |
| 100% free? | Não como produto (ok apenas como portfólio) — o roadmap cria custos recorrentes que precisam de receita recorrente |
| 1 mês grátis → R$ 5/mês (<US$ 1)? | Não — cobra no pior momento da curva de retenção, com preço que não cobre CAC nem churn, e mata o funil orgânico |
| **Free limitado + Premium completo (estilo Strava)?** | **Sim** — padrão comprovado da categoria, alinhado à tese ("o core sem culpa é grátis para sempre") e à arquitetura (event log → sync e insights premium baratos de construir) |

Síntese em uma frase: **rastrear hábitos é grátis para sempre; entender seus hábitos e levá-los a qualquer lugar é Premium** — anual de R$ 79,90 / US$ 29,99 como plano herói, trial de 14 dias no onboarding, lifetime para o público anti-assinatura, e nenhum anúncio, nunca.
