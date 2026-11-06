# Spec Delta

## Purpose

Permite cadastrar o local de um evento em `/event/new`, com validação HTML5 nativa nos campos obrigatórios e confirmação visível após um envio bem-sucedido.

## ADDED Requirements

### Requirement: Event form fields are HTML5-required
The event registration page at `/event/new` MUST expose inputs for Nome, Endereço, Capacidade, and Data that participate in the browser's native constraint validation as required fields. The form MUST NOT suppress native HTML5 validation.

#### Scenario: Required fields are marked for native validation
- **WHEN** a user opens `/event/new`
- **THEN** the Nome, Endereço, Capacidade, and Data inputs are present and each is subject to native required constraint validation

### Requirement: Empty submit shows native validation messages
When the user attempts to submit `/event/new` with all fields empty, the browser MUST block the submission and surface native validation feedback for the required fields. The page MUST NOT show the success confirmation for that attempt.

#### Scenario: Submit empty form
- **WHEN** a user opens `/event/new` and submits the form without filling Nome, Endereço, Capacidade, or Data
- **THEN** native constraint validation prevents the create request, at least one required field reports as invalid with a non-empty native validation message, and no success confirmation is shown

### Requirement: Successful event registration shows confirmation
When the user fills Nome, Endereço, Capacidade, and Data with valid values and submits, the system MUST create the event and show a visible success confirmation that includes the event name.

#### Scenario: Submit valid event
- **WHEN** a user on `/event/new` fills Nome, Endereço, Capacidade, and Data with valid values and submits the form
- **THEN** the event is created and the page shows a success confirmation that includes that event's name

### Requirement: Cypress E2E covers success and empty validation
The workspace MUST provide a Cypress E2E project separate from the Playwright `frontend-e2e` project. That Cypress project MUST include traditional specs (`cy.get`, `cy.contains`, `.should` only; no external AI testing libraries) that cover successful registration on `/event/new` using conventional CSS selectors (`id`, `name`, or `class`) and empty-form native validation on `/event/new`.

#### Scenario: Success path E2E
- **WHEN** the Cypress E2E suite for event creation runs the success scenario
- **THEN** it navigates to `/event/new`, fills Nome, Endereço, Capacidade, and Data via conventional CSS selectors, submits, and asserts that submission succeeded

#### Scenario: Empty form E2E
- **WHEN** the Cypress E2E suite for event creation runs the empty-form scenario
- **THEN** it navigates to `/event/new`, submits without filling fields, and asserts that native validation feedback is present
