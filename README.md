# WRS Habit Builder

App web para construir e acompanhar hábitos no dia a dia. Marque o que fez hoje, acompanhe sequências e organize sua rotina — sem login, com dados salvos no navegador.

**Produção:** [https://wrs-habit-builder.web.app](https://wrs-habit-builder.web.app)

## Stack

- [Angular](https://angular.dev) 21 (standalone, signals, SSR com prerender)
- [Tailwind CSS](https://tailwindcss.com) 4
- [Bootstrap Icons](https://icons.getbootstrap.com)
- Persistência em `localStorage`
- Deploy em [Firebase Hosting](https://firebase.google.com/docs/hosting)

## Funcionalidades

- **Hoje** — lista de hábitos esperados no dia, progresso, marcar/desmarcar com animações
- **Hábitos** — lista completa com filtros (ativos, arquivados, na tela Hoje), ordenação e edição
- **Criar / editar** — modal com metas gerais ou por dia da semana
- **Sequência** — histórico de conclusões, faltas e reset após 7 faltas em dias agendados
- **Gerenciar dados** — exportar e importar backup JSON
- **Tema** — modo claro/escuro e cor de destaque (settings)
- **Modo demo** — preview de níveis visuais e sorteio aleatório (settings)

## Rotas

| Rota | Tela |
|------|------|
| `/` | Hoje |
| `/habits` | Lista de hábitos |
| `/data` | Gerenciar dados (backup JSON) |

## Desenvolvimento

Pré-requisitos: Node.js 20+ e npm.

```bash
npm install
npm start
```

Abra [http://localhost:4200](http://localhost:4200). O servidor recarrega ao salvar arquivos.

## Build

```bash
npm run build
```

Artefatos em `dist/wrs-habit-builder/`. O bundle do browser (usado no deploy) fica em `dist/wrs-habit-builder/browser`.

Para rodar o servidor SSR localmente após o build:

```bash
npm run serve:ssr:wrs-habit-builder
```

## Deploy (Firebase Hosting)

O projeto já está configurado com `firebase.json` e `.firebaserc` (projeto `wrs-habit-builder`).

```bash
npm run build
firebase deploy --only hosting
```

Requisitos: [Firebase CLI](https://firebase.google.com/docs/cli) instalada e autenticada (`firebase login`).

## Testes

```bash
npm test
```

## Estrutura do projeto

```
src/app/
├── core/           # modelos, serviços (storage, tema, demo), utils
├── features/
│   ├── today/      # tela Hoje e cards de hábito
│   ├── habits/     # lista e cards da biblioteca
│   └── data/       # export/import JSON
└── shared/         # navbar, modais, selects reutilizáveis
```

Dados persistidos na chave `wrs-habit-builder` do `localStorage` (schema versionado em `AppStorage`).

## Licença

Projeto privado.
