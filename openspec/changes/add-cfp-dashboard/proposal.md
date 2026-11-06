# Proposal

## Why

Quem envia uma palestra não consegue ver o que já foi submetido. `POST /api/speakers` grava o registro em memória e `SpeakersService.findAll()` já devolve essa lista, mas nenhuma rota GET a expõe e o Angular só mostra o formulário. O dashboard fecha essa leitura sem alterar o contrato de submissão.

## What Changes

- Expor `GET /api/speakers`, que responde `200` com um array de `SpeakerDTO` já persistido em memória. Lista vazia quando ainda não houve submissão aceita.
- Criar a página `/dashboard` no Angular, com um componente standalone que busca essa rota via `HttpClient` e guarda o resultado em `WritableSignal<SpeakerDTO[]>`.
- Listar as palestras em HTML semântico (lista de cards), com os mesmos design tokens, tipografia, cartão, temas claro/noturno e painéis de estado do formulário.
- No formulário, acrescentar um controle de navegação para `/dashboard` com o mesmo tratamento visual do botão de envio. No dashboard, um controle equivalente volta para `/cfp`.
- Não muda o corpo, a validação nem o status de `POST /api/speakers`. Não há edição, exclusão, filtro, paginação, autenticação nem persistência fora da memória.

## Capabilities

### New Capabilities

- `talk-listing`: leitura das palestras já aceitas. A API devolve o array de `SpeakerDTO`; `/dashboard` mostra essa lista, os estados de carregamento, vazio e falha, e o mesmo tema do formulário.

### Modified Capabilities

- `talk-submission`: a página do formulário (`/` e `/cfp`) passa a oferecer um controle acessível que navega para `/dashboard`. Os requisitos atuais de envio, validação, dicas, tema e painéis de sucesso/erro permanecem.

## Impact

- `api/src/app/speakers/`: novo handler GET em `SpeakersController`, reutilizando `SpeakersService.findAll()`. Teste HTTP no spec existente do controller.
- `frontend/src/app/`: novo componente de dashboard, rota `dashboard` em `app.routes.ts`, controle de navegação em `talk-submission`, e specs Jest do dashboard e do controle novo.
- `shared-types`: só consumo de `SpeakerDTO`. A interface não muda.
- `provideHttpClient()` já está em `app.config.ts`. Nenhuma dependência nova.

Premissas de encaixe:

- Não existe `CfpController` nem `CfpFormComponent`. O GET entra no `SpeakersController` já publicado em `/api/speakers`. O formulário original é `TalkSubmission` (`app-talk-submission`).
- A classe nova segue o projeto, sem sufixo `Component`: `CfpDashboard`, selector `app-cfp-dashboard`. O pedido citou `CfpDashboardComponent`; o comportamento é o mesmo.
- O Angular do workspace é `~22.2.0`. Não há downgrade para o Angular 21 citado no pedido.
- A cópia visível continua em inglês, como o formulário ("Submit a talk", "Night theme").
- A lista mostra nome, e-mail, título e GDE. O `id` permanece no DTO e não aparece na interface.
- A listagem é uma lista de cards, não uma tabela: o formulário já é uma coluna de cartão com `max-width: 32rem`, e a tabela estouraria essa largura.
- O dashboard lê a mesma preferência `cfp-theme` e oferece o controle "Night theme", para a rota direta não ficar presa a um tema.
