# Spec Delta

## Purpose

Permite consultar as palestras já aceitas no call for papers e vê-las numa lista, inclusive quando ainda não há nenhuma.

## ADDED Requirements

### Requirement: Return stored talk submissions
`GET /api/speakers` MUST respond with 200 and a JSON array of the stored speaker records, in the order they were stored. Each record MUST include id, name, email, talk title, and GDE flag. The request MUST NOT change the stored records. When no talk has been accepted, the array MUST be empty.

#### Scenario: No submissions
- **WHEN** a client requests `GET /api/speakers` and no talk has been accepted
- **THEN** the response status is 200 and the body is an empty array

#### Scenario: Accepted submissions are listed
- **WHEN** one or more talks have been accepted and a client requests `GET /api/speakers`
- **THEN** the response status is 200 and the body lists each stored speaker, in stored order, with the same id, name, email, talk title, and GDE flag

#### Scenario: Reading does not change the store
- **WHEN** a client requests `GET /api/speakers` after a talk has been accepted
- **THEN** a second `GET /api/speakers` returns the same records

### Requirement: Show submitted talks as cards
The page at `/dashboard` MUST show the heading "Submitted talks" and MUST render the returned talks as items of one unordered list. Each item MUST be a card showing the speaker name, email, talk title, and GDE status. The GDE status MUST read "Google Developer Expert" when the flag is true and "Not a Google Developer Expert" when it is false. The speaker id MUST NOT be shown.

#### Scenario: Two talks render as list items
- **WHEN** `/dashboard` finishes loading and the server returned two talks
- **THEN** the page shows "Submitted talks" and an unordered list of two cards, each showing that talk's name, email, title, and GDE status, and neither card shows the id

### Requirement: Show a loading status
While the talk list is still loading, `/dashboard` MUST show "Loading talks." in a status region and MUST NOT show the talk list.

#### Scenario: Request in flight
- **WHEN** `/dashboard` has asked for the talk list and the response has not arrived
- **THEN** a status region shows "Loading talks." and the talk list is not shown

### Requirement: Show an empty list
When the talk list loads as an empty array, `/dashboard` MUST show "No talks submitted yet." and MUST NOT show any talk card.

#### Scenario: Empty response
- **WHEN** `/dashboard` finishes loading and the server returned an empty array
- **THEN** the page shows "No talks submitted yet." and shows no talk cards

### Requirement: Show a load failure
When loading the talk list fails, `/dashboard` MUST show "The submissions could not be loaded." in an alert region styled as an error panel, and MUST NOT show the talk list.

#### Scenario: Request fails
- **WHEN** `/dashboard` asks for the talk list and the request fails
- **THEN** an alert region shows "The submissions could not be loaded." as an error panel and the talk list is not shown

### Requirement: Switch the dashboard theme
`/dashboard` MUST offer a control named "Night theme" that switches the page between a light theme and a night theme. With no saved choice, the page MUST follow the system color scheme. A theme chosen on the submission page or on the dashboard MUST be the theme shown on a later visit to `/dashboard` in the same browser.

#### Scenario: System dark scheme starts in night theme
- **WHEN** the speaker has not chosen a theme and the system color scheme is dark
- **THEN** `/dashboard` shows the night theme and the "Night theme" control is on

#### Scenario: System light scheme starts in light theme
- **WHEN** the speaker has not chosen a theme and the system color scheme is light
- **THEN** `/dashboard` shows the light theme and the "Night theme" control is off

#### Scenario: Choice made on the form applies on the dashboard
- **WHEN** the speaker turns "Night theme" on on the submission page and then opens `/dashboard` in the same browser
- **THEN** `/dashboard` shows the night theme and the "Night theme" control is on

### Requirement: Match the submission page colors
In the light theme and in the night theme, each talk card's background, text color, and border color MUST equal the submission form card's background, text color, and border color in that same theme. The page background MUST likewise match. The error panel's background and text color MUST equal the submission page error panel in that theme.

#### Scenario: Light theme uses the form card colors
- **WHEN** `/dashboard` is showing the light theme and at least one talk card
- **THEN** the page background and that card's background, text color, and border color equal the submission form page and form card in the light theme

#### Scenario: Night theme uses the form card colors
- **WHEN** `/dashboard` is showing the night theme and at least one talk card
- **THEN** the page background and that card's background, text color, and border color equal the submission form page and form card in the night theme

### Requirement: Return to the submission form
`/dashboard` MUST offer a link named "Submit a talk" that navigates to `/cfp`. In both themes that link's fill and label color MUST equal the "Submit proposal" button's fill and label color on the submission page in the same theme.

#### Scenario: Dashboard links back to the form
- **WHEN** a speaker opens `/dashboard`
- **THEN** the page shows a link named "Submit a talk" whose destination is `/cfp`

#### Scenario: Return link matches the submit button
- **WHEN** `/dashboard` is showing the night theme
- **THEN** the "Submit a talk" link's fill and label color equal the "Submit proposal" button's fill and label color in the night theme
