# Proposal

## Why

A tela `/event/new` já cadastra o local do evento, mas não há cobertura E2E Cypress e a validação atual (só Angular, botão desabilitado) impede o cenário de “formulário vazio com mensagens nativas do browser”. Precisamos de um projeto Cypress paralelo ao Playwright e de validação HTML5 nativa para os testes tradicionais do curso.

## What Changes

- Gerar um projeto E2E Cypress dedicado (ex.: `frontend-cypress-e2e`), sem remover nem converter o `frontend-e2e` Playwright (reservado para uso futuro).
- Adicionar specs Cypress tradicionais (`cy.get`, `cy.contains`, `.should`) para `/event/new`: sucesso (preencher Nome, Endereço, Capacidade, Data com seletores CSS `id`/`name`/`class`, submeter e assertir sucesso) e erro (submeter vazio e assertir mensagens nativas de validação).
- Ajustar o formulário de cadastro de evento para validação HTML5 nativa (`required` nos campos; formulário com validação nativa habilitada; botão de submit clicável com formulário vazio para o browser exibir as mensagens).
- Não adicionar bibliotecas externas de IA nem sintaxe Cypress fora do estilo tradicional.
- Sem mudanças de contrato da API `POST /api/events`.

## Capabilities

### New Capabilities

- `event-creation`: cadastro do local do evento em `/event/new`, incluindo validação HTML5 nativa nos campos obrigatórios, feedback de sucesso após submissão válida, e os cenários E2E Cypress tradicionais que cobrem sucesso e formulário vazio.

### Modified Capabilities

- (nenhuma)

## Impact

- Novo projeto Nx Cypress (scaffold via `@nx/js:library` + `@nx/cypress:configuration`, ou equivalente que deixe um app E2E separado), com `devServerTarget` apontando para `frontend:serve` e `baseUrl` em `http://localhost:4200`.
- Specs em `frontend-cypress-e2e` (caminho concreto definido no design), executáveis via target `e2e` do projeto Cypress.
- `frontend/src/app/event-creation/`: atributos `required`, `ngNativeValidate` (ou equivalente), e ajuste de `canSubmit`/disabled do botão para permitir o disparo da validação nativa; atualizar unit tests Jest/Vitest afetados.
- `frontend-e2e` Playwright permanece intacto.
- Dependências: `cypress` e `@nx/cypress` já presentes no workspace; sem pacotes de IA.
