# Spec Delta

## ADDED Requirements

### Requirement: Link to the submissions dashboard
The submission page MUST offer a link named "View submissions" that navigates to `/dashboard`. The link MUST be present at `/` and at `/cfp`. The submit control MUST remain a button named "Submit proposal".

#### Scenario: Home page links to the dashboard
- **WHEN** a speaker opens `/`
- **THEN** the page shows a link named "View submissions" to `/dashboard`, and the submit control is still a button named "Submit proposal"

#### Scenario: Call for papers path links to the dashboard
- **WHEN** a speaker opens `/cfp`
- **THEN** the page shows a link named "View submissions" to `/dashboard`

### Requirement: Style the dashboard link like the submit button
In the light theme and in the night theme, the "View submissions" link's fill and label color MUST equal the "Submit proposal" button's fill and label color in that same theme.

#### Scenario: Light theme matches the submit button
- **WHEN** the submission page is showing the light theme
- **THEN** the "View submissions" link's fill and label color equal the "Submit proposal" button's fill and label color

#### Scenario: Night theme matches the submit button
- **WHEN** the submission page is showing the night theme
- **THEN** the "View submissions" link's fill and label color equal the "Submit proposal" button's fill and label color
