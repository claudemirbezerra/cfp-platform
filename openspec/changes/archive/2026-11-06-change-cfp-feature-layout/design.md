# Design

## Context

See proposal.md for why the Nx welcome page has to leave. Today `App` always renders `NxWelcome` above `router-outlet`, and only `/cfp` mounts `TalkSubmission`. The welcome template inlines a global `<style>` (it is not encapsulated) that sets `border-width: 0` on every element, so the submit `<button>` has no fill. `talk-submission.css` only sets width, margin, and font. `styles.css` is empty. Hints do not exist. Success and failure are bare paragraphs. Jest for this form is `frontend:test-jest`; the scaffold unit target `frontend:test` excludes `app/talk-submission/**/*.spec.ts`.

## Goals / Non-Goals

**Goals:**

- One page component owns the form, the hints, the theme, and the result panels.
- The shell no longer mounts the Nx welcome, and the form is what `/` and `/cfp` render.
- Button fill, night theme, and panels come from this component's stylesheet, not from the Nx preflight.

**Non-Goals:**

- A shared design-system library, new npm dependencies, or API changes.
- Translating the interface. Copy stays English, including the existing accessible names and the two result sentences.
- Animating the theme change or styling any screen other than submission.

## Decisions

### 1. Drop the welcome component from the shell

Remove `NxWelcome` from `App` and delete `frontend/src/app/nx-welcome.ts`. Leaving the file unused would keep the global preflight one import away from coming back.

Alternative considered: hide the welcome with CSS and keep the component. Rejected because the preflight would still load and the page would still carry Nx content in the DOM, which the spec forbids.

### 2. Mount the same component on `/` and `/cfp`

Add `{ path: '', component: TalkSubmission }` beside the existing `cfp` route. No redirect, so both URLs render the form directly.

Alternative considered: redirect `/` to `/cfp`. Rejected because the home URL would not itself be the form, and the spec requires both paths to show it.

### 3. Theme lives on the component host

`TalkSubmission` holds a `theme` signal, `'light' | 'night'`, and binds `data-theme` on `:host`. `:host` is `display: block; min-height: 100vh` and paints the page background. `styles.css` only sets `body { margin: 0; }` so the host covers the viewport. Component CSS variables define page, card, text, hint, button, success, and error colors for `[data-theme="light"]` and `[data-theme="night"]`.

Suggested tokens:

| Token | Light | Night |
| --- | --- | --- |
| page | `#eef2f6` | `#0f141c` |
| card | `#ffffff` | `#1a2230` |
| text | `#1c2430` | `#e8eef7` |
| hint | `#4b5568` | `#b7c3d4` |
| button fill / label | `#1d4ed8` / `#ffffff` | `#60a5fa` / `#0b1220` |
| success panel | `#e5f6ec` / `#14532d` | `#143528` / `#bbf7d0` |
| error panel | `#fde8e8` / `#7f1d1d` | `#3f1d24` / `#fecaca` |

The disabled button keeps the same fill at about 0.45 opacity, so it still differs from the page and from the enabled button.

Persistence key: `cfp-theme`, values `light` or `night`. On init, a stored valid value wins; otherwise `matchMedia('(prefers-color-scheme: dark)')` decides. Toggling writes the key. With nothing stored, follow later changes of that media query. An invalid stored value counts as no choice.

The control is a checkbox outside the `<form>`, with no `name`, labeled "Night theme". Checked means night. It must stay outside the form so it is not part of the submission fields. The client already posts the draft object rather than `FormData`; keeping the control outside matches that boundary.

Alternative considered: set `data-theme` on `document.documentElement` and put the variables in `styles.css`. Rejected because the spec's theme is this page, and the component stylesheet can own it.

### 4. Hints sit outside the labels

Each hint is a `<p>` after its control, referenced with `aria-describedby`. The existing `<label>` text stays the accessible name. Putting the hint inside the label would make `talk-submission.spec.ts` fail, because that test reads the label's text.

Copy:

- Name: "Use the name you want on the schedule."
- Email: "We'll reply about this proposal at this address."
- Talk title: "A short title attendees can recognize."
- GDE: "Select this if you are a Google Developer Expert."

Ids: `speaker-name-hint`, `speaker-email-hint`, `speaker-talk-title-hint`, `speaker-gde-hint`.

### 5. Button and panels are elements with their own classes

The submit control stays `<button type="submit" class="talk-submission__submit">`. Styles set background, color, border, padding, and radius explicitly. It is never an `<a>`.

Success stays the sentence `Proposal received for {{ speaker.talkTitle }}.` inside an element with `role="status"` and class `talk-submission__success`. Failure stays `The proposal could not be sent.` on `role="alert"` with class `talk-submission__error`. Panel background comes from the tokens above, so it differs from the card and the two panels differ from each other.

### 6. Tests follow the existing runners

- Extend `talk-submission.spec.ts` and run `frontend:test-jest`. Assert hint association and text, accessible names, the "Night theme" checkbox, `data-theme` for a stubbed `matchMedia` and a stubbed `localStorage`, that submit is a `HTMLButtonElement`, and that success and error use `role="status"` / `role="alert"` plus their panel classes. Stub `HttpClient` responses for the panel cases. Do not assert `getComputedStyle` colors in Jest.
- Update `app.spec.ts` for `frontend:test`: provide the router and `HttpClient`, expect the heading "Submit a talk", and expect no `app-nx-welcome`.
- Update `frontend-e2e/src/example.spec.ts` so `/` expects "Submit a talk" and not "Welcome".
- During apply, open the running app and check both themes: button fill versus page background, disabled versus enabled, success panel, and that `/` and `/cfp` have no Nx welcome content.

## Risks / Trade-offs

- [jsdom does not apply the real theme media query] → Tests stub `matchMedia` and `localStorage`. The browser check is what proves the fills.
- [A stored `cfp-theme` overrides the system scheme, so a later OS change is ignored] → That is the spec: an explicit choice wins. Clearing site data returns control to the system scheme.
- [`app.spec.ts` will not see the heading unless the test provides the router and `HttpClient`] → The updated test provides both, because the heading now comes from the routed form.
- [Deleting `nx-welcome.ts` removes the only global preflight] → The form stylesheet sets the properties it needs, and `body { margin: 0; }` replaces the one welcome rule the page still wants.

## Migration Plan

Frontend-only. No stored submissions move. Rollback is reverting the shell, route, form template, and styles. A leftover `cfp-theme` key in the browser is safe to ignore.

## Open Questions

None. Hint copy, tokens, and the storage key are fixed above so implementation does not have to reopen them.
