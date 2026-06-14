import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BETA_FEEDBACK_CONTACT_LABEL, BETA_FEEDBACK_WHATSAPP_URL } from '../../../../core/constants/beta-feedback.constants';

@Component({
  selector: 'app-privacy-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div
      class="min-h-dvh bg-brand-light-bg text-brand-light-text-primary dark:bg-brand-bg dark:text-brand-text-primary"
    >
      <header class="mx-auto max-w-3xl px-4 py-6 md:px-8">
        <a
          routerLink="/today"
          class="inline-flex items-center gap-2 text-sm font-medium text-brand-light-text-secondary transition-colors hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:text-brand-text-secondary dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
        >
          <i class="bi bi-arrow-left" aria-hidden="true"></i>
          Voltar
        </a>
      </header>

      <main class="mx-auto max-w-3xl px-4 pb-16 md:px-8">
        <h1 class="font-display text-3xl font-semibold md:text-4xl">
          Política de privacidade
        </h1>
        <p class="mt-2 text-sm text-brand-light-text-secondary dark:text-brand-text-secondary">
          Última atualização: junho de 2026
        </p>

        <div
          class="prose-policy mt-8 space-y-6 text-sm leading-relaxed text-brand-light-text-secondary dark:text-brand-text-secondary"
        >
          <section>
            <h2 class="text-base font-semibold text-brand-light-text-primary dark:text-brand-text-primary">
              Resumo
            </h2>
            <p class="mt-2">
              O Habit Builder é um app local-first. Seus hábitos, conclusões e
              configurações ficam no seu navegador (IndexedDB). Não pedimos
              conta, não enviamos seus dados para servidores nossos e não
              vendemos informações.
            </p>
          </section>

          <section>
            <h2 class="text-base font-semibold text-brand-light-text-primary dark:text-brand-text-primary">
              O que armazenamos
            </h2>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>Hábitos criados por você (nome, dias, metas, gatilhos)</li>
              <li>Registro de conclusões por dia</li>
              <li>Preferências de aparência (tema claro/escuro, accent)</li>
            </ul>
            <p class="mt-2">
              Tudo isso permanece no dispositivo até você exportar, importar ou
              apagar os dados do navegador.
            </p>
          </section>

          <section>
            <h2 class="text-base font-semibold text-brand-light-text-primary dark:text-brand-text-primary">
              O que não coletamos
            </h2>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>Nome, e-mail ou identificação pessoal no app</li>
              <li>Analytics de terceiros (Google Analytics, etc.)</li>
              <li>Rastreamento publicitário</li>
            </ul>
          </section>

          <section>
            <h2 class="text-base font-semibold text-brand-light-text-primary dark:text-brand-text-primary">
              Backup e exportação
            </h2>
            <p class="mt-2">
              Você pode exportar um arquivo JSON em Configurações → Dados. O
              backup é sua responsabilidade — se limpar o cache do navegador sem
              exportar, os dados podem ser perdidos.
            </p>
          </section>

          <section>
            <h2 class="text-base font-semibold text-brand-light-text-primary dark:text-brand-text-primary">
              Hospedagem
            </h2>
            <p class="mt-2">
              O app web é servido via Firebase Hosting (arquivos estáticos). Ao
              acessar o site, logs de servidor padrão podem registrar IP e
              user-agent — prática comum de hospedagem, não usada para perfilar
              usuários do app.
            </p>
          </section>

          <section>
            <h2 class="text-base font-semibold text-brand-light-text-primary dark:text-brand-text-primary">
              Contato
            </h2>
            <p class="mt-2">
              Dúvidas sobre privacidade:
              <a
                [href]="contactUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-brand-light-primary underline underline-offset-2 dark:text-brand-primary"
              >
                {{ contactLabel }}
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  `,
})
export class PrivacyPageComponent {
  protected readonly contactUrl = BETA_FEEDBACK_WHATSAPP_URL;
  protected readonly contactLabel = BETA_FEEDBACK_CONTACT_LABEL;
}
