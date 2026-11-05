# Spec Delta

## Purpose

Permite que um palestrante envie uma proposta de palestra e receba o registro criado, recusando dados inválidos antes de qualquer gravação.

## ADDED Requirements

### Requirement: Accept a valid talk submission
The system MUST accept a submission with a non-empty name, a valid email, a non-empty talk title, and a boolean GDE flag, without requiring the client to send an id. It MUST store that submission and return the created speaker record.

#### Scenario: Valid submission returns the created speaker
- **WHEN** a speaker submits a non-empty name, a valid email, a non-empty talk title, and a boolean GDE flag, and omits the id
- **THEN** the system stores the submission and returns a speaker record whose id is newly generated and whose name, email, talk title, and GDE flag match the submitted values

### Requirement: Reject an invalid talk submission
The system MUST reject a submission that omits a required field, uses an invalid email, sends a value of the wrong type, or includes a field outside the submission contract. It MUST respond with 400 Bad Request and MUST NOT store that submission.

#### Scenario: Missing talk title
- **WHEN** a speaker submits a payload that omits the talk title
- **THEN** the system responds with 400 Bad Request and does not store a speaker record

#### Scenario: Invalid email
- **WHEN** a speaker submits an email that is not a valid email address
- **THEN** the system responds with 400 Bad Request and does not store a speaker record

#### Scenario: GDE flag is not boolean
- **WHEN** a speaker submits a GDE flag that is not a boolean
- **THEN** the system responds with 400 Bad Request and does not store a speaker record

#### Scenario: Unknown field
- **WHEN** a speaker submits an otherwise valid proposal plus a field the submission contract does not define
- **THEN** the system responds with 400 Bad Request and does not store a speaker record

### Requirement: Block submit on the initial draft
The submission form MUST start with an empty draft and MUST keep the submit control unavailable while that initial draft is shown.

#### Scenario: Initial draft disables submit
- **WHEN** the submission form is first shown
- **THEN** the draft name, email, and talk title are empty, the GDE flag is false, and the submit control is disabled

### Requirement: Expose the form to assistive technology
The submission form MUST give each field an accessible name and MUST expose the submit control with an accessible name and its disabled state.

#### Scenario: Initial form is accessible
- **WHEN** the submission form is first shown
- **THEN** name, email, talk title, and GDE flag each expose an accessible name, and the submit control exposes an accessible name and a disabled state
