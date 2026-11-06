# Design

## Context

See proposal.md for why the list is missing, and the delta specs for the observable contract. Today `SpeakersController` only has `POST /api/speakers`. `SpeakersService.findAll()` already returns a copy of the in-memory `SpeakerDTO[]`, and nothing calls it from HTTP. The form is `TalkSubmission` on `/` and `/cfp`. Its host owns `data-theme`, the `cfp-theme` localStorage key, and the design tokens in `talk-submission.css`. `provideHttpClient()` and `provideRouter(appRoutes)` are already registered. Jest for the form is `frontend:test-jest`, aimed at `talk-submission.spec.ts` only; `frontend:test` excludes that spec.

## Goals / Non-Goals

**Goals:**

- One GET on the existing speakers resource, and one new standalone page that renders that array.
- The dashboard and the form resolve the same theme and the same color tokens, so the two screens cannot drift.
- The list state is a `WritableSignal<SpeakerDTO[]>`, filled from `HttpClient`.

**Non-Goals:**

- A new `CfpController`, a rename of `TalkSubmission`, or an Angular downgrade.
- A data table, pagination, filter, edit, delete, auth, or any store besides the current in-memory array.
- Polling or a live refresh after a submit in another tab.

## Decisions

### 1. Add `@Get()` on `SpeakersController`

`findAll()` delegates to `speakersService.findAll()` and returns `SpeakerDTO[]`. Nest's default for that handler is HTTP 200 and a JSON array. No new DTO and no validation pipe: there is no body. The global prefix already makes the path `/api/speakers`, which is the URL the form already posts to.

Alternative considered: a new `CfpController`. Rejected because the stored resource and `findAll()` already live on speakers, and a second controller would publish the same records twice.

### 2. New `CfpDashboard` on `path: 'dashboard'`

Files under `frontend/src/app/cfp-dashboard/`. Class `CfpDashboard`, selector `app-cfp-dashboard`, standalone, `styleUrls` plus a template. Route `{ path: 'dashboard', component: CfpDashboard }` beside the two form routes. No redirect.

`HttpClient.get<SpeakerDTO[]>('/api/speakers')` runs from `ngOnInit`. The subscription is cleared in `ngOnDestroy`.

State:

- `talks: WritableSignal<SpeakerDTO[]> = signal([])`
- `loading = signal(true)` until the request settles
- `loadError = signal<string | null>(null)`

The template branches on those three. An initial empty `talks` array must not render the empty copy or the list while `loading` is true. Success writes the array and clears loading. Failure sets `loadError` to `The submissions could not be loaded.`, clears loading, and leaves the list unrendered. Empty success shows `No talks submitted yet.`

Markup: `h1` "Submitted talks"; `ul` of `li` cards; each card shows `talkTitle` (as `h2`), `name`, `email`, and the GDE sentence from the spec. Track by `talk.id`. Do not render `id`. Loading uses `role="status"`. Failure uses `role="alert"` and the error-panel class. "Submit a talk" is `<a routerLink="/cfp">`.

Alternative considered: a `<table>`. Rejected in the proposal because the form is a 32rem column; cards keep that width and still use a semantic list.

### 3. Share theme tokens and theme resolution

Move the `:host` token block (light and `[data-theme='night']`) into `frontend/src/app/cfp-theme.css`, imported by both components. Page, card, text, hint, border, button, success, and error values stay the ones already in `talk-submission.css`. Add a `.cfp-button` rule there for fill, label color, padding, radius, and focus outline, all via those variables. `TalkSubmission`'s submit button keeps its disabled opacity locally and also uses `.cfp-button`. Nav anchors on both pages use `.cfp-button` only, so fill and label color match the submit button in each theme.

`frontend/src/app/cfp-theme.ts` owns the storage key `cfp-theme`, the `'light' | 'night'` type, and the read / system-preference helpers. Both components keep their own `theme` signal, `data-theme` host binding, and `matchMedia` subscription. `TalkSubmission` switches to those helpers; the visible theme behavior does not change.

Alternative considered: copy the token block into the dashboard stylesheet. Rejected because the color spec requires the two cards to stay equal, and a copied block will drift.

Alternative considered: `data-theme` on `document.documentElement`. Rejected for the same reason as the layout change: each page host already paints its own viewport.

### 4. Form link uses `routerLink`

`TalkSubmission` imports `RouterLink` and adds `<a routerLink="/dashboard" class="cfp-button">View submissions</a>` inside the form card, after the `h1` and before the fields. It is not a submit button. The existing "Submit proposal" `<button type="submit">` stays.

The dashboard and form specs that render these links must provide `provideRouter`. `TalkSubmission`'s current TestBed does not; add it when the link lands, otherwise `RouterLink` has no router.

### 5. Tests stay on the current runners

- Extend `speakers.controller.spec.ts`: `GET /api/speakers` is 200 and `[]` on a fresh app; after a valid POST, GET returns that speaker in stored order; a second GET returns the same body.
- Add `cfp-dashboard.spec.ts` on the same Jest preset. Cover loading copy, two cards without ids, empty copy, alert copy, `data-theme` from a stubbed `matchMedia` and from `localStorage`, and the `/cfp` link. Extend `talk-submission.spec.ts` for the `/dashboard` link and for submit still being a `<button>`.
- Point `frontend/jest.talk-submission.config.cts` `testMatch` and `frontend/tsconfig.talk-submission.json` `include` at the dashboard spec and `cfp-theme.ts`. Exclude `app/cfp-dashboard/**/*.spec.ts` from `frontend:test`, same as the form spec.
- Do not assert `getComputedStyle` in Jest. During apply, compare page, card, and button colors in the browser for both themes. The e2e smoke test only checks the `h1` on `/` and does not need a new case.

## Risks / Trade-offs

- [jsdom will not prove the color spec] → One shared token file, plus a browser check of both themes during apply.
- [Moving tokens out of `talk-submission.css` can regress the form] → Move the existing custom properties unchanged and re-run `frontend:test-jest`.
- [The in-memory list disappears when the API process restarts] → Same limit as POST today. The dashboard shows the empty state.
- [A submit on `/` does not push the new row into an already open dashboard] → The dashboard reads once per visit. A later open calls GET again.
- [`RouterLink` without `provideRouter` breaks the form spec] → The form spec gains the router provider in the same change.

## Migration Plan

No stored data to move. Rollback is reverting the GET handler, the route, the new component, the form link, and the shared theme files, and restoring the token block on `TalkSubmission`. A leftover `cfp-theme` value stays valid for the form.

## Open Questions

None. The controller, the component name, the card list, the copy, and the shared tokens are fixed above.
