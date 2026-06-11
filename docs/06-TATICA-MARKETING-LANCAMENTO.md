# Tática de Marketing de Lançamento — Avaliação e Playbook Complementar

> Avaliação da tática de marketing proposta pelo fundador para o lançamento (web + Android, modelo free limitado + Premium), com pontos positivos, negativos, correções sugeridas e um playbook complementar. Companion dos relatórios 04 (visão de negócio) e 05 (projeção). Data: junho/2026.

---

## 1. Resumo executivo

**Veredito geral: a tática é boa — acima da média do que indie founders fazem.** Ela acerta nos dois pilares que mais importam para um app de hábitos sem budget: **prova social visual** (foto + marca + "dia 35") e **semeadura de rede** (presentear assinaturas com mecânica de re-presente). O risco está na dependência de fatores fora de controle (influencers postarem de graça, amigos serem o público-alvo) e na ausência de três peças estruturais: **timing de lançamento, tracking de atribuição e loop de indicação dentro do produto**.

| Tática proposta | Nota | Veredito em 1 linha |
|-----------------|:----:|---------------------|
| 1. Layer de foto com hábito checado ("dia 35 musculação") | ⭐⭐⭐⭐⭐ | A melhor ideia do plano — é o loop viral do produto |
| 2. Fundador como usuário nº 1 postando diariamente | ⭐⭐⭐⭐ | Barato e autêntico; depende de constância e audiência |
| 3. Presentear 20 amigos + cada um presenteia +1 | ⭐⭐⭐½ | Boa mecânica viral; amigos são beta testers, não mercado |
| 4. 20 assinaturas para influencers (teste/feedback/propaganda) | ⭐⭐⭐ | Direção certa, expectativa errada — precisa de ajustes |
| 5. Tráfego pago com os lucros | ⭐⭐⭐ | Disciplina correta; a matemática do LTV limita o quanto escala |
| 6. Site de venda em escala média-alta | ⭐⭐ | Ordem invertida — a landing page precisa existir no dia 1 |

---

## 2. Avaliação tática por tática

### 2.1 Layer configurável em fotos ("dia 35 musculação") — ⭐⭐⭐⭐⭐

A pessoa treinando posta a própria foto na academia com o overlay do app mostrando o hábito checado e o contador de dias.

**Positivos:**

- É **UGC (user-generated content) com a marca embutida** — o tipo de marketing que não se compra. Cada post é prova social autêntica no feed de quem ainda não conhece o app.
- Encaixa perfeitamente no item 13 do roadmap H3 ("compartilhamento social leve") e o **supera**: foto pessoal + overlay é muito mais compartilhável que um card genérico de conquista. Strava construiu boa parte do crescimento exatamente nisso (mapa do treino + stats sobre foto).
- O gatilho de compartilhamento coincide com o **pico emocional** do usuário (acabou de treinar, acabou de manter a sequência) — momento de máxima propensão a postar.
- Alinha com a tese do produto: celebra consistência ("dia 35"), não perfeição.

**Negativos / riscos:**

- **É uma feature de produto, não só de marketing**: câmera/galeria + composição de overlay + export para stories exige ~2–3 semanas extras de desenvolvimento (Capacitor camera + canvas rendering). Precisa entrar no cronograma do relatório 05 — idealmente antes do lançamento, porque é a tática nº 1.
- **A barra estética é altíssima.** Ninguém posta uma foto sua com um overlay feio. Se o layer não for bonito o suficiente para a pessoa *querer* usar (tipografia, posições, temas claro/escuro, discrição da marca), a feature morre em silêncio. Orçar design caprichado.
- Usuários compartilham **marcos**, não dias comuns. Dia 35 sim; dia 4 não. O produto deve *sugerir* o compartilhamento nos marcos (7, 21, 30, 66, 100 dias) em vez de esperar iniciativa.
- A marca no overlay deve ser **discreta e charmosa** (estilo "shot on iPhone"), nunca um watermark agressivo — senão vira motivo para *não* postar.

**Como turbinar:**

- Free compartilha **com** a marca (é o marketing); Premium pode escolher layouts extras — nunca remover a marca de quem é free, ela é o motor do loop.
- Templates prontos por categoria (academia, leitura, meditação) e um modo "só texto" para quem não quer foto.
- Deep link no post → quem clica cai numa landing do hábito ("Comece seu dia 1") — fecha o loop de aquisição.

### 2.2 Fundador como usuário nº 1, postando todo dia — ⭐⭐⭐⭐

**Positivos:**

- **Founder-led marketing custa zero** e é o formato com mais alcance orgânico em 2026 (build in public).
- Dogfooding diário: você encontra os bugs e atritos antes dos usuários.
- Um fundador que usa o próprio app de hábitos **todos os dias** é a melhor prova da tese do produto — coerência narrativa perfeita.

**Negativos / riscos:**

- O alcance é limitado pela **sua audiência atual**. Se você tem 300 seguidores, 365 posts/ano alcançam pouca gente nova. O conteúdo precisa ser desenhado para *descoberta* (Reels/TikTok com hook nos 2 primeiros segundos), não só para quem já te segue.
- Posts diários idênticos ("dia N, hábito X") **saturam em ~2 semanas**. Precisa de variação: bastidores do desenvolvimento, lições de comportamento (Fogg, hábitos atômicos), recaídas e retomadas — a *história*, não só o checkmark.
- Risco de ironia pública: se *você* quebrar a sequência e sumir, a narrativa sofre. Mitigação: a própria tese do app ("falha sem culpa") vira conteúdo — "quebrei no dia 23, recomeçando no mesmo gatilho" é um post **melhor** que o dia 23 perfeito.

### 2.3 Presentear 20 amigos (cada um presenteia +1) — ⭐⭐⭐½

**Positivos:**

- Resolve o problema nº 1 de lançamento: **app vazio sem reviews**. 20–40 usuários reais no dia 1 geram os primeiros ratings, screenshots reais e bugs descobertos.
- A mecânica "cada presenteado pode presentear +1" é um **embrião de loop viral** (coeficiente K) — inteligente e raro em planos indie.
- Custo de caixa ≈ zero (é margem não realizada, não despesa).

**Negativos / riscos:**

- **Amigos não são mercado.** Eles elogiam por afeto, usam por obrigação e churnam em silêncio. Feedback de amigo vale para usabilidade ("não achei o botão"), não para validação de negócio ("eu pagaria").
- 20 pessoas não movem métrica nenhuma. O valor é qualitativo (beta) e social (primeiras reviews) — calibrar a expectativa.
- Cuidado com reviews de amigos em massa no mesmo dia: as lojas detectam padrões e podem descontar ou punir.

**Como turbinar:**

- Transformar em **beta fechado estruturado**: 2 semanas antes do lançamento, com formulário de feedback e um canal (grupo WhatsApp/Telegram). Amigos viram squad de teste, não só presenteados.
- Formalizar o "presenteie +1" **dentro do produto** (código de convite) — assim ele não morre nos amigos: vira o programa de indicação para todos os usuários (ver §4.2).

### 2.4 ~20 assinaturas anuais para influencers — ⭐⭐⭐

**Positivos:**

- Direção correta: micro-influencers de fitness/produtividade/estudo são o canal mais eficiente em custo para apps de hábito.
- Pedir **teste e feedback** (não só propaganda) é a abordagem certa — review honesto converte mais que publi engessada.

**Negativos / riscos — aqui o plano precisa de mais correções:**

- **Uma assinatura de R$ 79,90 não é remuneração, é unidade de demonstração.** Influencer com "muitos seguidores" (100k+) não posta por um ano de app grátis — agência dele nem responde. A taxa de resposta de outreach frio com oferta de produto é ~5–10%.
- O alvo certo é outro: **nano e micro (1k–30k seguidores)** de nichos específicos (gym girls, estudantes de concurso, leitura, corrida). Engajamento maior, audiência mais fiel, e o presente é genuinamente relevante. Para 20 conversões reais, prepare-se para abordar **100–150 perfis**.
- **Sem tracking, você nunca saberá o que funcionou.** Cada influencer precisa de código/link próprio (ex.: `habitbuilder.app/maria`) — mede instala e conversão por perfil.
- **Risco legal real (Brasil):** post pago ou com produto recebido exige identificação de publicidade (`#publi`/"presente da marca") — CONAR. Combine isso por escrito, mesmo informal.
- Melhor pedido que "propaganda": **"use por 30 dias e poste seu dia 30 com o layer de foto"** — junta a tática 1 com a 4 e gera conteúdo autêntico em vez de anúncio.

### 2.5 Tráfego pago com os lucros — ⭐⭐⭐

**Positivos:**

- A disciplina está certa: **orgânico primeiro, pago só com receita** — evita queimar caixa antes de ter funil que converte.
- Reinvestir lucro em aquisição é como apps de assinatura escalam de fato.

**Negativos / riscos:**

- **A matemática é apertada e precisa ser respeitada.** LTV líquido por assinante ≈ R$ 90–110 (relatório 05). Regra LTV ≥ 3×CAC → CAC máximo ≈ R$ 30–35 *por assinante*. Com conversão free→pago de 2,5%, isso significa pagar no máximo **~R$ 0,75–0,90 por instalação** — viável em Google App Campaigns/Meta no Brasil, mas sem folga nenhuma.
- Tráfego pago **amplifica** um funil que já converte; não conserta um que não converte. Só ligar depois de: onboarding medido, paywall com A/B test, e conversão orgânica ≥ 2%.
- Começar pequeno e cirúrgico: R$ 500–1.000/mês em 2–3 criativos (os posts orgânicos que melhor performaram viram os anúncios), medir CPI e conversão por campanha, matar o que não paga.

### 2.6 Site de venda em escala média-alta — ⭐⭐

**Positivos:**

- Reconhece que o produto precisa de uma vitrine própria fora das lojas.

**Negativos / riscos — ordem invertida:**

- **A landing page não é prêmio do sucesso, é pré-requisito do lançamento.** Todo o tráfego das táticas 1–4 (link na bio, deep link do layer de foto, link de influencer) precisa de um destino que converta *antes* do sucesso chegar, não depois.
- O app web já existe — uma landing de marketing (`habitbuilder.app`) com proposta de valor, screenshots, botões Play Store/web e os links de indicação custa **1 semana** e multiplica o resultado de todas as outras táticas.
- Bônus estratégico: a landing com checkout **Stripe** vende assinatura sem a comissão de 15% da loja — cada venda web vale ~18% mais.

---

## 3. Leitura do conjunto

**Pontos fortes do plano como um todo:**

1. Custo de caixa ≈ zero — tudo é margem, tempo e produto.
2. Centrado em **prova social visual**, o formato certo para esta categoria.
3. Tem embrião de **loop viral** (presente que gera presente) — raro em plano de indie.
4. Sequência financeira saudável (pago só com lucro).

**Pontos cegos a corrigir:**

1. **Sem timing** — não aproveita a maior onda sazonal da categoria (ver §4.1).
2. **Sem tracking** — nenhuma tática tem atribuição; impossível saber o que repetir.
3. **Loop de indicação fora do produto** — vive na boa vontade dos 20 amigos em vez de virar feature.
4. **Sem ASO** — a tática traz gente para a loja, mas nada garante que a loja converta (ícone, screenshots, keywords).
5. **Tudo depende de execução manual sua** — outreach, posts diários, gestão de gifts. O risco de abandono do marketing é igual ao risco de abandono de um hábito; trate o marketing como hábito com ação mínima.

---

## 4. Complementos — o que eu adicionaria

### 4.1 Timing: lançar na onda de Ano Novo (a alavanca grátis mais poderosa)

A categoria de hábitos tem o maior pico anual de buscas e downloads entre **26/dez e 15/jan** (resoluções de Ano Novo). Pelo cronograma do relatório 05 (~5 meses full-time a partir de jun/2026), o beta fica pronto em **novembro/2026** — encaixe perfeito:

```
Nov/2026  ─ Beta fechado (20 amigos) + landing no ar + waitlist
Dez/2026  ─ Lançamento soft + outreach de influencers agendado para janeiro
Jan/2027  ─ Campanha "66 dias" de Ano Novo + posts de influencers + push de ASO
Mar/2027  ─ Primeiro corte: dobrar no que os dados mostrarem que funcionou
```

Um lançamento em janeiro pode valer **2–3× o volume** do mesmo esforço em maio.

### 4.2 Programa de indicação dentro do produto (formalizar a tática 3)

- "Convide um amigo: vocês dois ganham 1 mês de Premium." Custo marginal ≈ zero, mecânica comprovada (Dropbox, Duolingo).
- O presente dos 20 amigos vira só a **primeira rodada** de um sistema permanente, com código de convite e contagem de indicações no perfil.

### 4.3 Campanha "66 dias" (desafio com identidade própria)

- 66 dias é o número médio de formação de hábito (Lally, UCL) — vira marca de campanha: **"O desafio dos 66 dias"** em janeiro.
- Conecta todas as táticas: o layer de foto mostra "dia X/66", influencers entram no desafio, o resumo semanal acompanha, quem completa ganha um card especial (e um desconto do Premium anual).
- Hashtag própria + página na landing com contador de participantes.

### 4.4 ASO desde o dia 1 (a loja é sua maior landing page)

- Keywords PT-BR de cauda longa: "hábitos", "rotina", "constância", "rastreador de hábitos", "67 dias" etc.
- Screenshots que vendem a **tese** (consistência > perfeição, "falha sem culpa") — não só telas bonitas.
- **Pedir review no momento certo**: prompt de avaliação ao completar 7 dias de sequência (pico de satisfação), nunca no primeiro uso. Reviews são o maior fator de conversão da loja.

### 4.5 Conteúdo SEO em PT-BR (terreno pouco disputado)

- Blog na landing: "como criar hábito de leitura", "método dos 2 minutos", "por que você desiste em janeiro" — a concorrência em português é fraca e o tráfego é perene.
- Cada post termina no CTA do app. 2 posts/mês bastam; em 12 meses isso costuma virar a maior fonte de instalações orgânicas depois da loja.

### 4.6 Comunidades e canais menos óbvios

- Comunidades BR: TabNews, grupos de concurseiros (público faminto por constância), r/produtividade, comunidades de corrida/leitura no WhatsApp/Telegram.
- **Parcerias locais**: personal trainers e professores de cursinho distribuindo o código de convite para alunos — o app vira ferramenta de acompanhamento deles (e cada personal é um micro-influencer com audiência hiper-qualificada).
- Product Hunt / Hacker News quando o i18n (H3) sair — não antes.

### 4.7 Instrumentação de marketing (o que medir desde o dia 1)

| Métrica | Ferramenta | Por quê |
|---------|-----------|---------|
| Instalações por origem (UTM/código) | Links únicos por canal/influencer | Saber o que repetir |
| Compartilhamentos do layer de foto / usuário | Evento de analytics | Mede o motor viral (tática 1) |
| Coeficiente K (convites → instalações) | Programa de indicação | Mede o loop da tática 3 |
| Conversão landing → instalação | Analytics da landing | Mede a tática 6 |
| CPI e CAC por campanha | Painéis de ads | Trava de segurança da tática 5 |

### 4.8 Eu (IA) como ferramenta contínua do seu marketing

Onde posso ser usado de forma recorrente neste plano:

- **Produção em lote**: calendário editorial mensal, variações de copy para posts diários (30 hooks de Reels de uma vez), roteiros de vídeo, descrições de loja otimizadas para keyword.
- **Outreach em escala**: pesquisa e qualificação de listas de micro-influencers por nicho, templates de mensagem personalizados por perfil, acompanhamento de respostas.
- **A/B testing**: gerar variações de paywall/headline/screenshot, e analisar os resultados dos experimentos para decidir o próximo.
- **Análise de feedback**: classificar reviews da loja e mensagens de beta testers em temas acionáveis (o que vira feature, o que vira bug, o que vira copy).
- **Conteúdo SEO**: rascunhos de artigos do blog baseados na ciência real (Fogg, Lally, Clear) com a sua revisão final.
- **Localização**: quando chegar o H3/i18n, traduzir e adaptar copy, loja e landing para en-US sem custo de agência.

---

## 5. Impacto esperado na projeção (relatório 05)

A tática proposta + complementos ataca exatamente o gargalo que segura os cenários: **distribuição**.

| Item | Sem tática de marketing | Com tática bem executada |
|------|------------------------|--------------------------|
| Probabilidade de "dar certo" (≥ base) | ~30% | **~45–50%** |
| Cenário mais provável | Entre pessimista e base | **Base, com chance real de otimista** |
| Custo adicional de produto | — | +2–3 semanas (layer de foto antes do lançamento) |
| Custo de caixa no lançamento | — | ≈ R$ 0 (gifts são margem) + R$ 500–1.000/mês de ads a partir do lucro |

**Condição para o impacto se realizar:** o layer de foto entra no escopo de lançamento (não no H3), a landing existe no dia 1, todo link tem tracking, e o lançamento mira a janela de janeiro.

---

## 6. Síntese

A tática é **aprovada com ajustes**: mantenha as 6 ideias, mas (1) promova o layer de foto a feature de lançamento com barra estética alta, (2) transforme o presente dos amigos em programa de indicação permanente dentro do produto, (3) mire nano/micro-influencers com link rastreado e pedido de "dia 30" em vez de celebridades com pedido de propaganda, (4) suba a landing page no dia 1 — não no sucesso, (5) respeite o teto de CAC de ~R$ 0,80/instalação no tráfego pago, e (6) **lance em janeiro** — a onda de Ano Novo é o maior multiplicador gratuito que este produto jamais terá.
