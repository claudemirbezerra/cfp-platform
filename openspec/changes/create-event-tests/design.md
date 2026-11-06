# Design

## Context

See proposal.md for motivation and `specs/event-creation/spec.md` for the contract. Today `/event/new` is `EventCreation` with reactive Angular validators only: inputs lack HTML `required`, Angular adds `novalidate` by default, and the submit button is `[disabled]="!canSubmit()"` while the form is invalid—so an empty submit never reaches native constraint validation. Success already renders `.event-creation__success` after `POST /api/events`. Workspace has `cypress` + `@nx/cypress` (plugin in `nx.json`), but no Cypress project; `frontend-e2e` remains Playwright-only. Stable field selectors already exist: `#event-nome` / `name="nome"`, `#event-endereco` / `name="endereco"`, `#event-capacidade` / `name="capacidade"`, `#event-data` / `name="data"`, and `button[type="submit"]` / `.event-creation__submit`.

## Goals / Non-Goals

**Goals:**

- A separate Nx Cypress E2E project that coexists with Playwright `frontend-e2e`.
- Traditional Cypress specs for `/event/new` success and empty-form native validation.
- Minimal form changes so the browser can show native required feedback on empty submit.

**Non-Goals:**

- Converting or deleting Playwright `frontend-e2e`.
- Cypress component testing, AI/LLM testing libs, Testing Library Cypress, or custom commands beyond what the Nx preset scaffolds.
- Changing `POST /api/events` contract or backend validation rules.
- Playwright specs for event creation in this change.

## Decisions

### 1. New project `frontend-cypress-e2e`

Create an empty Nx project, then attach Cypress—Nx’s documented path when a separate E2E app is needed (`@nx/cypress:configuration` alone only configures an existing project).

1. `npx nx g @nx/js:library frontend-cypress-e2e --directory=frontend-cypress-e2e --bundler=none --unitTestRunner=none --minimal` (keep eslint aligned with the workspace).
2. Strip or ignore library source that is unused for E2E if the generator leaves placeholders; the Cypress config owns the useful surface.
3. `npx nx g @nx/cypress:configuration --project=frontend-cypress-e2e --devServerTarget=frontend:serve --baseUrl=http://localhost:4200 --directory=src` so specs live under `frontend-cypress-e2e/src/e2e/` (or the generator’s equivalent under `src`).
4. Set `implicitDependencies: ["frontend"]` on the Cypress project (same pattern as `frontend-e2e`).
5. Prefer the `@nx/cypress` plugin’s inferred `e2e` / `open-cypress` targets; only hand-edit `cypress.config.ts` if the preset needs `webServerCommands` / `ciWebServerCommand` pointing at `frontend:serve` / `frontend:serve-static`.

`frontend:serve` already `dependsOn: ["api:serve"]` and proxies `/api` → `localhost:3000`, so the success path can hit a real create without a separate API target in Cypress.

Alternative considered: put Cypress inside `frontend` via `@nx/cypress:configuration --project=frontend`. Rejected—keeps app and E2E mixed and collides with the course’s “projeto E2E” expectation.

Alternative considered: replace Playwright in `frontend-e2e`. Rejected—user wants Playwright available later.

### 2. Spec file and traditional Cypress only

Add `frontend-cypress-e2e/src/e2e/event-creation.cy.ts` (adjust only if the generator’s `specPattern` differs; keep the file inside the Cypress project).

Two `it` blocks (or equivalent `describe` / `it`):

- **Success:** `cy.visit('/event/new')`; `cy.get('#event-nome')` (or `[name="nome"]`) `.type(...)`; same for endereço, capacidade, data; `cy.get('button[type="submit"]').click()` (or `.event-creation__submit`); assert success with `cy.get('.event-creation__success')` / `cy.contains(...)` and `.should('be.visible')` / `.should('contain', ...)`.
- **Empty error:** `cy.visit('/event/new')`; click submit with fields empty; assert native validity, e.g. `cy.get('#event-nome:invalid').should('exist')` and/or read `validationMessage` via `.should(($el) => { expect($el[0].validationMessage).to.not.equal('') })` on required fields. Do not assert custom Angular error copy for this scenario.

Use only `cy.get`, `cy.contains`, `cy.visit`, `.type`, `.click`, `.should` (and chai `expect` inside `.should` callbacks if needed for `validationMessage`). No `@testing-library/cypress`, no Cypress AI plugins, no Page Object framework required.

### 3. Enable HTML5 native validation on the form

In `event-creation.html`:

- Add `ngNativeValidate` on the `<form>` so Angular does not leave native validation suppressed.
- Add the HTML `required` attribute on Nome, Endereço, Capacidade, and Data inputs (keep existing `id` / `name`).
- Keep `min="1"` on capacidade for consistency with Angular `Validators.min(1)`.

In `event-creation.ts` / template:

- Stop disabling submit solely because the reactive form is invalid. Disable only while `isSubmitting()` is true so an empty click reaches the browser’s constraint validation UI.
- Keep Angular `Validators` and the early return in `submit()` as a safety net if native validation is bypassed.
- Keep the existing success and HTTP-error panels.

Update `event-creation.spec.ts` (and any related app specs) that currently expect the submit button disabled on an invalid form: they MUST expect the button enabled when idle/invalid, and still disabled (or equivalent) while submitting if covered.

Alternative considered: keep the button disabled and force-click in Cypress. Rejected—native messages would not appear; user chose HTML5-native option.

### 4. Run verification

- `npx nx e2e frontend-cypress-e2e` (or the inferred target name) against local serve.
- Re-run the event-creation unit tests after the disabled-button behavior change.

## Risks / Trade-offs

- [Native validation UI differs by browser; Cypress headless Chrome may not show the bubble tooltip] → Assert `:invalid` and/or non-empty `validationMessage`, which are stable across Chromium used by Cypress.
- [`@nx/js:library` leaves unused lib files in the E2E project] → Delete or ignore them in the same change; keep `project.json` / Cypress config clean.
- [Both Playwright and Cypress plugins register an `e2e` target name] → Targets are per-project; collision is only if someone runs a vague `nx run-many -t e2e` expecting one runner—document running `frontend-cypress-e2e` vs `frontend-e2e` explicitly.
- [Unit tests that assumed disabled submit will fail] → Update them in the same apply as the template change.
- [Success E2E needs API up] → Rely on `frontend:serve` → `api:serve`; if Cypress uses `baseUrl` only without starting servers, document starting both or use the preset’s `devServerTarget`.

## Migration Plan

No production data migration. Rollback: delete `frontend-cypress-e2e`, revert `event-creation` HTML/TS and unit-test expectations. Playwright project untouched.

## Open Questions

None. Project name, HTML5 approach, selectors, and traditional Cypress syntax are fixed above.
