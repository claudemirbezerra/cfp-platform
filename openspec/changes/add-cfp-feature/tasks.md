# Tasks

## 1. Dependencies

- [ ] 1.1 Add `class-validator` and `class-transformer` as dependencies and `supertest` plus `@types/supertest` as dev dependencies. Verify `npm ls class-validator class-transformer supertest @types/supertest` resolves them from the workspace root.
- [ ] 1.2 Add a `jest-preset-angular` release that supports Angular 22.2, create `frontend/jest.talk-submission.config.cts` (do not add `frontend/jest.config.cts`), and add an explicit `test-jest` target on `frontend` using `@nx/jest:jest`. Verify `npx nx show project frontend --json` lists `test-jest` and that the existing `test` target still uses `@angular/build:unit-test`.

## 2. API submission

- [ ] 2.1 Add a body class under `api/src/app/speakers/` that implements `Omit<SpeakerDTO, 'id'>` and is decorated with `class-validator`: non-empty `name`, valid `email`, non-empty `talkTitle`, boolean `isGDE`. Import `SpeakerDTO` from `@cfp-platform/shared-types`. Verify `npx nx build api` compiles the class.
- [ ] 2.2 Add an in-memory speakers service that assigns `id` with `crypto.randomUUID()` and returns `SpeakerDTO`, plus a controller method `POST` under the existing global prefix so the route is `POST /api/speakers`, taking the body class via `@Body()`. Import the feature module from `AppModule` without changing `GET /api`. Verify `npx nx build api` still compiles and `AppController` remains registered.
- [ ] 2.3 Register one `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`, `enableImplicitConversion: false`) from a helper used by `main.ts`. Verify the helper is the same function the HTTP spec in task 2.4 will call, by importing it from both `main.ts` and the spec.
- [ ] 2.4 Add a Jest spec in the existing `api` Jest project that boots the Nest testing app with the prefix `api` and that pipe, then uses `supertest` against `POST /api/speakers`. Cover a missing talk title, an invalid email, a non-boolean `isGDE`, and an unknown field: each responds `400` and does not appear in the in-memory store. Cover one valid body without `id`: response `201` and a `SpeakerDTO` whose `name`, `email`, `talkTitle`, and `isGDE` match the body and whose `id` is a non-empty string. Verify with `npx nx test api`.

## 3. Angular submission form

- [ ] 3.1 Add a standalone submission component under `frontend/src/app/talk-submission/` that imports `SpeakerDTO` from `@cfp-platform/shared-types`. Hold the draft in a `signal<Omit<SpeakerDTO, 'id'>>` whose initial value is `{ name: '', email: '', talkTitle: '', isGDE: false }`. Derive a `computed` that is true only when trimmed name and talk title are non-empty and the email matches a simple email check. Bind the submit button's native `disabled` attribute to the inverse of that computed value. Give the form an accessible name, associate each field with a `<label for>`, and give the submit button visible text. Register route `cfp`, add `provideHttpClient()` in `app.config.ts`, and post JSON to `/api/speakers`. Verify the component file is standalone (`imports` on the `@Component` decorator, no `NgModule`) and `npx nx build frontend` succeeds.
- [ ] 3.2 Add a Jest spec for that component, included only by `frontend/jest.talk-submission.config.cts`. Assert the draft signal's initial value is the empty draft above, assert the submit button is disabled on first render, and assert accessible names for name, email, talk title, the GDE checkbox, and the submit button. Verify with `npx nx test-jest frontend`.

## 4. Integration check

- [ ] 4.1 Run `npx nx test api`, `npx nx test-jest frontend`, and `npx nx test frontend`. Verify the new API and Jest form specs pass and the existing Vitest `App` spec still passes.
