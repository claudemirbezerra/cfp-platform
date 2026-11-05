# Design

## Context

See proposal.md for why this change exists. The behavior contract is `specs/talk-submission/spec.md`.

The Nx workspace already has the two apps and the shared contract:

- `frontend/` is Angular `~22.2.0`. `App` is a standalone component. Routes in `frontend/src/app/app.routes.ts` are empty. `app.config.ts` provides the router and does not provide `HttpClient`. The `test` target runs Vitest through `@angular/build:unit-test`; `frontend/tsconfig.spec.json` types `vitest/globals`.
- `api/` is NestJS `^11`. `main.ts` sets the global prefix `api` and does not register a `ValidationPipe`. `AppModule` only serves `GET /api`. Jest is already configured in `api/jest.config.cts`. The existing controller spec calls the method directly, so it never exercises HTTP validation.
- `SpeakerDTO` in `shared-types/src/lib/shared-types.ts` is an interface: `id`, `name`, `email`, `talkTitle`, `isGDE`. The path alias is `@cfp-platform/shared-types`. `class-validator` and `class-transformer` are not dependencies. `frontend/proxy.conf.json` already forwards `/api` to `http://localhost:3000`.

The requested layout (`apps/frontend`, `apps/api`, Angular 21) does not match this repo. This design keeps the installed projects and the installed Angular 22.2.

## Goals / Non-Goals

**Goals:**

- One submission path: the Angular form posts to `POST /api/speakers`, and the API returns a `SpeakerDTO`.
- The same `SpeakerDTO` type is imported by the form state and by the API response. The request body is the subset of that contract without `id`.
- Invalid bodies fail in the Nest validation pipe with HTTP 400 before the in-memory store is touched.
- The form's initial signal is the empty draft, and the submit control is disabled in that state, with accessible names on every field.

**Non-Goals:**

- Moving projects under `apps/`, downgrading Angular, or replacing the Vitest scaffold spec.
- Changing `SpeakerDTO` or the existing `GET /api` handler.
- Adding a database, authentication, a list of submissions, or editing a proposal after it is created.

## Decisions

### 1. Implement inside the existing Nx apps

Add the form under `frontend/src/app/talk-submission/` and the speakers feature under `api/src/app/speakers/`. Register the page at route `cfp` and leave the Nx welcome screen on the current shell. `AppModule` imports the new Nest module; `AppController` stays as it is.

Alternative considered: create `apps/frontend` and `apps/api` and retarget Angular to 21. Rejected because it duplicates apps that already build, and the installed Angular 22.2 already supports standalone components and signals.

### 2. Consume `SpeakerDTO` without turning the interface into a class

`SpeakerDTO` stays an interface. Interfaces disappear at runtime, so `class-validator` cannot decorate them.

- The Nest body type is a class that implements `Omit<SpeakerDTO, 'id'>` and carries the validators. The controller method takes that class through `@Body()`.
- The service generates `id` with `crypto.randomUUID()` and returns a value typed as `SpeakerDTO`.
- The Angular draft signal is typed as `Omit<SpeakerDTO, 'id'>`. A second signal holds the created `SpeakerDTO` or `null`. Both files import `SpeakerDTO` from `@cfp-platform/shared-types`.

The client omits `id`. Sending `id`, or any other unknown property, is an invalid body.

Alternative considered: generate `id` in the browser and post a full `SpeakerDTO`. Rejected because the spec says the server creates the id and a client-supplied id is not part of the submission contract.

### 3. Strict validation pipe, shared by the server and the Jest HTTP test

Add `class-validator` and `class-transformer`. Register one global `ValidationPipe` in `main.ts` and use that same setup when the Jest spec creates the Nest application:

- `whitelist: true`
- `forbidNonWhitelisted: true`
- `transform: true`
- `enableImplicitConversion: false`

Validators on the body class: `name` and `talkTitle` are non-empty strings; `email` is an email; `isGDE` is a boolean. Implicit conversion stays off so a string such as `"true"` fails `@IsBoolean()` and produces 400, matching the spec scenario for a non-boolean GDE flag.

The Jest spec lives next to the controller and runs with the existing `api` Jest project. It boots the testing module, applies the global prefix `api` and the same pipe, and issues `POST /api/speakers` through `supertest`. Asserting the controller method alone would skip the pipe and could not observe 400. Each invalid case also asserts that a later read of the in-memory store does not contain the rejected payload. `supertest` and its types are new dev dependencies.

Successful creation responds with `201` and the `SpeakerDTO`. The store is an in-memory list owned by the speakers service. There is no database in the workspace.

### 4. Standalone form, signal state, native disabled submit

The submission component is standalone. It does not use `NgModule`. The draft is one `signal`. A `computed` is true only when the trimmed name and talk title are non-empty and the email matches a simple email check. `isGDE` starts as `false` and is always a boolean because it is a checkbox.

Initial signal value:

- `name: ''`
- `email: ''`
- `talkTitle: ''`
- `isGDE: false`

The submit button uses the native `disabled` attribute bound to the inverse of that computed value. The initial draft fails the check, so the button is disabled on first render. `app.config.ts` gains `provideHttpClient()`. The component posts JSON to `/api/speakers`, which the existing dev proxy already forwards.

Accessible names come from native semantics, which assistive technologies expose:

- each text field has a `<label for>`
- the GDE flag is a checkbox with its own label
- the submit button has visible text
- the form has an accessible name

### 5. Jest for the new Angular spec, Vitest left in place

The required Angular tests run under Jest: initial signal value, and the submit button disabled on first render. The same spec also checks the accessible names required by the spec.

The current `frontend:test` target stays on Vitest so `app.spec.ts` keeps working. The new config file is `frontend/jest.talk-submission.config.cts`, not `jest.config.cts`. The `@nx/jest` plugin infers a `test` target from `jest.config.*`; a second file with that name would collide with the Vitest target. An explicit `test-jest` target in `frontend/project.json` points at the talk-submission config and uses `@nx/jest:jest` with `jest-preset-angular` compatible with Angular 22.2. `jsdom` is already installed.

The spec uses `TestBed` on the standalone component, reads the draft signal, and asserts `button.disabled`.

## Risks / Trade-offs

- [In-memory submissions disappear when the API process restarts] → Accepted. No database is in scope; the service keeps the list only for the 400 tests and for the success response.
- [`jest-preset-angular` may not match Angular 22.2 on the first install] → Pin the preset release that supports Angular 22, and keep the Vitest target untouched so a Jest setup failure does not remove the existing frontend test.
- [A unit test that calls the controller method would miss the 400] → The API spec goes through the HTTP adapter with the same pipe and prefix as `main.ts`.
- [Enabling implicit conversion would turn the string `"true"` into a boolean and hide the type-rejection scenario] → `enableImplicitConversion` stays false.
- [The client email check can diverge from `class-validator`'s `IsEmail`] → The button rule only needs to block the empty initial draft and obviously invalid emails. The API remains the authority for 400.

## Migration Plan

This is additive. Deploy the API with the new module and pipe, then the frontend route. `GET /api` stays. Rollback is reverting the change: no stored data must be migrated, and the in-memory list does not survive a restart anyway.
