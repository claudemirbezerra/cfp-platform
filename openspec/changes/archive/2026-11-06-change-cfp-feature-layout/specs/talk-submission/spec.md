# Spec Delta

## ADDED Requirements

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
