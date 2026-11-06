# Tasks

## 1. Cypress E2E project

- [x] 1.1 Generate project `frontend-cypress-e2e` with `npx nx g @nx/js:library frontend-cypress-e2e --directory=frontend-cypress-e2e --bundler=none --unitTestRunner=none --minimal` (eslint as workspace default). Verify the project appears in `npx nx show projects`.
- [x] 1.2 Add Cypress with `npx nx g @nx/cypress:configuration --project=frontend-cypress-e2e --devServerTarget=frontend:serve --baseUrl=http://localhost:4200 --directory=src`. Set `implicitDependencies: ["frontend"]`. Remove unused library placeholder source if it is not needed for E2E. Verify `cypress.config.ts` exists and `npx nx show project frontend-cypress-e2e` exposes an `e2e` (or equivalent) target.
- [x] 1.3 Ensure `cypress.config.ts` uses the Nx Cypress preset with `baseUrl` `http://localhost:4200` and web-server commands for `frontend:serve` / `frontend:serve-static` as needed. Verify the config file loads without edit errors (`npx nx e2e frontend-cypress-e2e` may fail on missing specs until 3.x—config must resolve).

## 2. HTML5 native validation on event form

- [x] 2.1 On `event-creation.html`, add `ngNativeValidate` to the form and `required` on Nome, Endereço, Capacidade, and Data inputs (keep existing `id`/`name`). Change submit `[disabled]` so the button is disabled only while submitting, not while the reactive form is invalid. Verify in the running app that an empty submit triggers browser native validation and does not show `.event-creation__success`.
- [x] 2.2 Update `event-creation.spec.ts` (and any other specs) that expect submit disabled on an invalid idle form so they match the new enabled-when-idle behavior. Verify with the frontend unit-test target that covers this file (`npx nx test frontend` or the project’s event-creation test command).

## 3. Traditional Cypress specs for `/event/new`

- [x] 3.1 Add `frontend-cypress-e2e/src/e2e/event-creation.cy.ts` (or the path matching the generator `specPattern`) with a success scenario: `cy.visit('/event/new')`, fill `#event-nome`, `#event-endereco`, `#event-capacidade`, `#event-data` (or equivalent `name`/`class` selectors) with `cy.get` + `.type`, click submit with `cy.get`, assert success with `cy.get('.event-creation__success')` / `cy.contains` and `.should`. Use only traditional Cypress APIs—no AI testing libraries. Verify the file exists and uses those APIs only.
- [x] 3.2 In the same spec file, add an empty-form scenario: visit `/event/new`, submit without filling fields, assert native validation via `:invalid` and/or non-empty `validationMessage` with `.should`, and assert success is not shown. Verify with `npx nx e2e frontend-cypress-e2e` that both scenarios pass.

## 4. Integration

- [x] 4.1 Confirm `frontend-e2e` Playwright project is unchanged and still listed (`npx nx show project frontend-e2e`). Re-run event-creation unit tests and `npx nx e2e frontend-cypress-e2e`. Verify unit tests and both Cypress scenarios pass.

## Workflow follow-up

- Archive the change after review with `/opsx-archive` (or equivalent) once implementation is accepted.
