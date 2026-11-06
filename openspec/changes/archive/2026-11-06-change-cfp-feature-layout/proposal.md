# Proposal

## Why

A tela que o palestrante vê ainda é o scaffold do Nx: `app-nx-welcome` ocupa a página com documentação do monorepo, e o formulário "Submit a talk" só aparece em `/cfp`, abaixo desse conteúdo. O reset CSS embutido no welcome zera borda e fundo dos controles, então o envio parece texto solto numa página branca, sem dicas nos campos e com a confirmação como um parágrafo cru. O objetivo desta tela é a submissão da palestra, não apresentar o Nx.

## What Changes

- Remover a tela de boas-vindas do Nx da experiência visível. A página do palestrante mostra só o formulário de submissão.
- Tornar esse formulário a página inicial (`/`) e mantê-lo em `/cfp`, sem o bloco do Nx acima.
- Estilizar o formulário como um cartão com hierarquia visual, em tema claro e tema noturno. Um controle na página alterna o tema; a escolha inicial segue `prefers-color-scheme` e fica gravada em `localStorage`.
- Acrescentar uma dica visível em cada campo (nome, e-mail, título e GDE), associada ao controle para tecnologia assistiva, sem alterar os nomes acessíveis já definidos (`Name`, `Email`, `Talk title`, `Google Developer Expert`).
- Fazer o envio parecer um botão preenchido, com estado desabilitado distinguível. Continua sendo `<button type="submit">` com o nome acessível `Submit proposal`, nunca um link.
- Apresentar "Proposal received for {talk title}." como um painel de sucesso, e o alerta "The proposal could not be sent." como um painel de erro. O texto das duas mensagens não muda.
- Não alterar campos, validação, `POST /api/speakers`, persistência nem `SpeakerDTO`.

Premissas: o texto da interface permanece em inglês, alinhado aos nomes acessíveis e aos testes atuais. O tema é da página de submissão, não um sistema de design compartilhado com outras telas. `GET /api` permanece como está.

## Capabilities

### New Capabilities

- Nenhuma.

### Modified Capabilities

- `talk-submission`: a página pública deixa de exibir o scaffold do Nx e passa a apresentar o formulário com dicas, tema claro/noturno, botão de envio visualmente distinto e confirmação (e erro) em painéis. Os requisitos de aceitar, recusar e bloquear o envio no rascunho inicial permanecem.

## Impact

- `frontend/src/app/app.html` e `frontend/src/app/app.ts`: deixam de renderizar `NxWelcome`.
- `frontend/src/app/app.routes.ts`: `/` passa a mostrar o mesmo formulário de `/cfp`.
- `frontend/src/app/nx-welcome.ts`: sai do shell. O arquivo pode ser removido quando nenhum teste ou template o referenciar.
- `frontend/src/app/talk-submission/`: template, estilos e, se preciso, um pouco de estado para o tema e para `aria-describedby`.
- `frontend/src/app/app.spec.ts` e `frontend-e2e/src/example.spec.ts`: hoje esperam o título "Welcome"; passam a cobrir a página de submissão.
- API, `shared-types` e o contrato `POST /api/speakers`: sem mudança.
