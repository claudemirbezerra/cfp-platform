# Proposal

## Why

A plataforma de call for papers ainda não permite que um palestrante envie uma proposta de palestra. O workspace só expõe o scaffold do Nx: o Angular mostra a tela de boas-vindas e a API responde `GET /api` com `{ message: 'Hello API' }`. Sem um fluxo de submissão, o contrato `SpeakerDTO` já exportado por `@cfp-platform/shared-types` não é usado por nenhum dos dois apps.

## What Changes

- Adicionar uma página de submissão de palestra no app Angular existente, com componente standalone, estado em Signals e marcação WAI-ARIA.
- Adicionar `POST /api/speakers` no NestJS existente. O corpo entra por `@Body()`, é validado com `class-validator` e uma carga inválida responde `400 Bad Request`.
- Tipar o estado do formulário e a resposta da API com `SpeakerDTO` importado de `@cfp-platform/shared-types`. O `id` é gerado no servidor; o cliente não o envia.
- Persistir as submissões aceitas em memória no processo da API. Não há banco neste workspace.
- Acrescentar testes Jest obrigatórios: a API rejeita payloads inválidos com 400; o Angular verifica o valor inicial do Signal e o botão de envio desabilitado nesse estado.
- Manter `GET /api` e a tela de boas-vindas. A nova rota do formulário é o caminho da funcionalidade; o scaffold atual não é removido.

## Capabilities

### New Capabilities

- `talk-submission`: o palestrante preenche nome, e-mail, título da palestra e indicação de GDE, envia a proposta e recebe o `SpeakerDTO` criado. Cargas incompletas ou malformadas são recusadas antes de qualquer gravação, e o botão de envio permanece bloqueado enquanto o rascunho inicial é inválido.

### Modified Capabilities

- Nenhuma. `openspec list --specs` não retorna capabilities, e o comportamento atual de `GET /api` não muda.

## Impact

- `frontend/`: novo componente de submissão, rota e testes Jest. O target `test` atual continua no Vitest (`@angular/build:unit-test`); os testes novos desta capability rodam em um target Jest próprio, porque o runner do scaffold não é Jest.
- `api/`: módulo de palestrantes, `ValidationPipe` e testes Jest sobre o servidor HTTP de teste. O Jest da API já está configurado em `api/jest.config.cts`.
- `shared-types`: somente consumo de `SpeakerDTO`. A interface não muda.
- Dependências novas: `class-validator` e `class-transformer` na API; `supertest` (e tipos) para o teste HTTP; preset Jest compatível com o Angular 22.2 já instalado para o spec do formulário.
- Premissas de encaixe no repositório: os apps estão em `frontend/` e `api/`, não em `apps/`. O Angular instalado é `~22.2.0`, não 21. A implementação usa esses projetos e essa versão, com standalone components, Signals e WAI-ARIA. Não há downgrade nem mudança de pastas.
