# talk-submission Specification

## Purpose

Permite que um palestrante envie uma proposta de palestra e receba o registro criado, recusando dados inválidos antes de qualquer gravação.

## Requirements

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

### Requirement: Show only the talk form
The public submission page MUST show the talk submission form and MUST NOT show Nx welcome or Nx marketing content. The form MUST be available at `/` and at `/cfp`.

#### Scenario: Home page is the talk form
- **WHEN** a speaker opens `/`
- **THEN** the page shows the heading "Submit a talk", does not show the text "Welcome frontend", and does not link to the Nx GitHub repository

#### Scenario: Call for papers path is the same form
- **WHEN** a speaker opens `/cfp`
- **THEN** the page shows the heading "Submit a talk" and does not show Nx welcome content

### Requirement: Describe each field with a hint
The submission form MUST show a non-empty hint for name, email, talk title, and the GDE flag. Each hint MUST sit outside the field's label and MUST be referenced by that field's `aria-describedby`. The accessible names MUST remain "Name", "Email", "Talk title", and "Google Developer Expert".

#### Scenario: Hints are visible and associated
- **WHEN** the submission form is first shown
- **THEN** each of those four fields has a visible non-empty hint, `aria-describedby` points at that hint, and the accessible name is unchanged

### Requirement: Switch between light and night themes
The submission page MUST offer a control named "Night theme" that switches the page between a light theme and a night theme. With no saved choice, the page MUST follow the system color scheme. After the speaker chooses a theme, the page MUST restore that choice on a later visit in the same browser.

#### Scenario: System dark scheme starts in night theme
- **WHEN** the speaker has not chosen a theme and the system color scheme is dark
- **THEN** the page shows the night theme and the "Night theme" control is on

#### Scenario: System light scheme starts in light theme
- **WHEN** the speaker has not chosen a theme and the system color scheme is light
- **THEN** the page shows the light theme and the "Night theme" control is off

#### Scenario: Chosen night theme is restored
- **WHEN** the speaker turns the "Night theme" control on and later opens the submission page again in the same browser
- **THEN** the page shows the night theme without asking again

### Requirement: Present submit as a button
The submit control MUST be a button named "Submit proposal", not a link. In both themes its fill MUST differ from the page background. While the draft is invalid the button MUST stay unavailable and MUST look different from the enabled button.

#### Scenario: Initial submit control is a disabled button
- **WHEN** the submission form is first shown
- **THEN** the submit control is a disabled button named "Submit proposal" whose fill differs from the page background

#### Scenario: Night theme keeps the button filled
- **WHEN** the night theme is active
- **THEN** the submit control's fill still differs from the page background

### Requirement: Present confirmation and failure as panels
After a successful submission the page MUST show the sentence "Proposal received for {talk title}." in a status region styled as a success panel, distinct from the form fields. When sending fails, the page MUST show "The proposal could not be sent." in an alert region styled as an error panel, distinct from the success panel.

#### Scenario: Successful submission shows a success panel
- **WHEN** the speaker submits a valid proposal and the system accepts it
- **THEN** a status region shows "Proposal received for {talk title}." and that region is presented as a success panel

#### Scenario: Failed submission shows an error panel
- **WHEN** the speaker submits a valid proposal and sending fails
- **THEN** an alert region shows "The proposal could not be sent." and that region is presented as an error panel
