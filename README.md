# CFP Platform

Plataforma de call for papers: o palestrante envia uma proposta e consulta as submissões já aceitas. Monorepo [Nx](https://nx.dev) com Angular no frontend, NestJS na API e tipos compartilhados.

## O que faz

- **Submissão** (`/` e `/cfp`): formulário com nome, e-mail, título da palestra e flag GDE; tema claro/noite; feedback de sucesso ou erro.
- **Dashboard** (`/dashboard`): lista as palestras aceitas em cards, com estados de carregamento, lista vazia e falha.
- **API**: `POST /api/speakers` cria a proposta; `GET /api/speakers` lista as gravadas. Persistência **em memória** (sem banco).

Contrato compartilhado: `SpeakerDTO` em `@cfp-platform/shared-types` (`id`, `name`, `email`, `talkTitle`, `isGDE`).

Especificações em `openspec/specs/` (`talk-submission`, `talk-listing`).

## Stack

| Camada | Tecnologia |
| --- | --- |
| Frontend | Angular ~22 (standalone, Signals) |
| API | NestJS 11 + `class-validator` |
| Tipos | `@cfp-platform/shared-types` |
| Workspace | Nx 24, npm |

## Projetos

| Projeto | Pasta | Papel |
| --- | --- | --- |
| `frontend` | `frontend/` | App Angular |
| `api` | `api/` | App NestJS |
| `shared-types` | `shared-types/` | Biblioteca de DTOs |
| `frontend-e2e` / `api-e2e` | `*-e2e/` | E2E (Playwright / Jest) |

## Pré-requisitos

- Node.js compatível com o workspace
- npm (`packageManager`: `npm@11.9.0`)

## Setup

```sh
npm install
```

## Rodar localmente

Sobe o frontend (porta **4200**) e, por dependência, a API (porta **3000**). O Angular faz proxy de `/api` para `http://localhost:3000`.

```sh
npx nx serve frontend
```

Só a API:

```sh
npx nx serve api
```

URLs úteis:

- Form: http://localhost:4200/ ou http://localhost:4200/cfp
- Dashboard: http://localhost:4200/dashboard
- API: http://localhost:3000/api

## Testes

```sh
# API (Jest)
npx nx test api

# Features CFP no Angular (Jest: talk-submission + dashboard)
npx nx test-jest frontend

# Unit tests do scaffold Angular (Vitest; exclui specs CFP)
npx nx test frontend

# Biblioteca de tipos
npx nx test shared-types
```

## Build

```sh
npx nx build frontend
npx nx build api
npx nx build shared-types
```

Grafo do workspace: `npx nx graph`.

## Estrutura relevante

```
frontend/src/app/
  talk-submission/   # formulário CFP
  cfp-dashboard/     # listagem
api/src/app/
  speakers/          # POST/GET speakers
shared-types/src/    # SpeakerDTO
openspec/            # specs e histórico de mudanças
```
